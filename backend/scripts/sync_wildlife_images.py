"""
Script to sync wildlife images from Supabase to Elasticsearch.
"""

import asyncio
import httpx
import os
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip('/')
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

# Elasticsearch configuration
ELASTIC_CLOUD_URL = os.getenv("ELASTIC_CLOUD_URL", "").rstrip('/')
ELASTIC_API_KEY = os.getenv("ELASTIC_API_KEY", "")
WILDLIFE_IMAGE_INDEX = "wildlife-images"


async def fetch_images_from_supabase() -> List[Dict]:
    """Fetch all wildlife images from Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/wildlife_images?select=*"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            images = response.json()
            print(f"✓ Fetched {len(images)} images from Supabase")
            return images
        except Exception as e:
            print(f"✗ Error fetching from Supabase: {e}")
            return []


async def create_elasticsearch_index():
    """Create the wildlife images index in Elasticsearch with proper mappings"""
    url = f"{ELASTIC_CLOUD_URL}/{WILDLIFE_IMAGE_INDEX}"
    headers = {
        "Authorization": f"ApiKey {ELASTIC_API_KEY}",
        "Content-Type": "application/json"
    }

    mapping = {
        "mappings": {
            "properties": {
                "id": {"type": "keyword"},
                "photo_image_url": {"type": "keyword"},
                "photo_description": {"type": "text"},
                "species_name": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "common_name": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "location": {"type": "text"},
                "conservation_status": {"type": "keyword"},
                "created_at": {"type": "date"},
                "updated_at": {"type": "date"}
            }
        }
    }

    async with httpx.AsyncClient() as client:
        try:
            # Delete existing index first
            delete_response = await client.delete(url, headers=headers)
            if delete_response.status_code in [200, 404]:
                print(f"✓ Cleared existing index")

            # Create new index
            response = await client.put(url, headers=headers, json=mapping)
            if response.status_code in [200, 201]:
                print(f"✓ Index '{WILDLIFE_IMAGE_INDEX}' created successfully")
                return True
            else:
                print(f"✗ Failed to create index: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"✗ Error creating index: {e}")
            return False


async def index_images_to_elasticsearch(images: List[Dict]):
    """Index all images to Elasticsearch"""
    url = f"{ELASTIC_CLOUD_URL}/{WILDLIFE_IMAGE_INDEX}/_bulk"
    headers = {
        "Authorization": f"ApiKey {ELASTIC_API_KEY}",
        "Content-Type": "application/x-ndjson"
    }

    # Build bulk request (newline-delimited JSON)
    bulk_data = []
    for img in images:
        # Index action
        bulk_data.append('{"index": {"_id": "' + img['id'] + '"}}')
        # Document
        import json
        bulk_data.append(json.dumps(img))

    bulk_body = "\n".join(bulk_data) + "\n"

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(url, headers=headers, content=bulk_body)
            if response.status_code in [200, 201]:
                result = response.json()
                if result.get("errors"):
                    print(f"⚠ Some documents failed to index")
                    for item in result.get("items", []):
                        if "error" in item.get("index", {}):
                            print(f"  Error: {item['index']['error']}")
                else:
                    print(f"✓ Successfully indexed {len(images)} images to Elasticsearch")
                return True
            else:
                print(f"✗ Failed to bulk index: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"✗ Error indexing to Elasticsearch: {e}")
            return False


async def sync_images():
    """Main sync function"""
    print("=" * 60)
    print("Wildlife Images Sync: Supabase → Elasticsearch")
    print("=" * 60)
    print()

    # Step 1: Fetch from Supabase
    print("[1/3] Fetching images from Supabase...")
    images = await fetch_images_from_supabase()

    if not images:
        print("✗ No images found in Supabase. Aborting sync.")
        return

    print(f"      Found {len(images)} images")
    print()

    # Step 2: Create Elasticsearch index
    print("[2/3] Creating Elasticsearch index...")
    success = await create_elasticsearch_index()

    if not success:
        print("✗ Failed to create Elasticsearch index. Aborting sync.")
        return

    print()

    # Step 3: Sync to Elasticsearch
    print("[3/3] Syncing images to Elasticsearch...")
    success = await index_images_to_elasticsearch(images)

    print()
    print("=" * 60)

    if success:
        print("✓ Sync completed successfully!")
        print()
        print(f"Summary:")
        print(f"  - Total images synced: {len(images)}")

        # Show some samples
        print(f"\n  Sample species:")
        unique_species = {}
        for img in images:
            species = img.get('common_name', 'Unknown')
            if species not in unique_species:
                unique_species[species] = img

        for i, (species, img) in enumerate(list(unique_species.items())[:5]):
            print(f"    • {species} ({img.get('species_name', 'N/A')})")
    else:
        print("✗ Sync failed!")

    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(sync_images())

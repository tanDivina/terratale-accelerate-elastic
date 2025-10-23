"""
Script to sync wildlife species from Supabase to Elasticsearch.
This ensures data is available in Elasticsearch for the hackathon,
while maintaining Supabase as the source of truth for future use.
"""

import asyncio
import httpx
import os
from typing import List, Dict
from dotenv import load_dotenv

# Import Supabase client
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

# Elasticsearch configuration
ELASTIC_CLOUD_URL = os.getenv("ELASTIC_CLOUD_URL", "").rstrip('/')
ELASTIC_API_KEY = os.getenv("ELASTIC_API_KEY", "")
WILDLIFE_SPECIES_INDEX = "wildlife-species"


async def fetch_species_from_supabase() -> List[Dict]:
    """Fetch all wildlife species from Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/wildlife_species?select=*"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            species = response.json()
            print(f"✓ Fetched {len(species)} species from Supabase")
            return species
        except Exception as e:
            print(f"✗ Error fetching from Supabase: {e}")
            return []


async def create_elasticsearch_index():
    """Create the wildlife species index in Elasticsearch with proper mappings"""
    url = f"{ELASTIC_CLOUD_URL}/{WILDLIFE_SPECIES_INDEX}"
    headers = {
        "Authorization": f"ApiKey {ELASTIC_API_KEY}",
        "Content-Type": "application/json"
    }

    mapping = {
        "mappings": {
            "properties": {
                "id": {"type": "keyword"},
                "common_name": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "scientific_name": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                "category": {"type": "keyword"},
                "family": {"type": "text"},
                "order": {"type": "text"},
                "conservation_status": {"type": "keyword"},
                "protected_by_law": {"type": "boolean"},
                "cites_appendix": {"type": "keyword"},
                "endemic_type": {"type": "keyword"},
                "habitat": {"type": "text"},
                "diet": {"type": "text"},
                "behavior": {"type": "text"},
                "notes": {"type": "text"},
                "created_at": {"type": "date"},
                "updated_at": {"type": "date"}
            }
        }
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.put(url, headers=headers, json=mapping)
            if response.status_code in [200, 201]:
                print(f"✓ Index '{WILDLIFE_SPECIES_INDEX}' created successfully")
                return True
            elif response.status_code == 400 and "resource_already_exists" in response.text:
                print(f"✓ Index '{WILDLIFE_SPECIES_INDEX}' already exists")
                return True
            else:
                print(f"✗ Failed to create index: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"✗ Error creating index: {e}")
            return False


async def index_species_to_elasticsearch(species: List[Dict]):
    """Index all species to Elasticsearch"""
    url = f"{ELASTIC_CLOUD_URL}/{WILDLIFE_SPECIES_INDEX}/_bulk"
    headers = {
        "Authorization": f"ApiKey {ELASTIC_API_KEY}",
        "Content-Type": "application/x-ndjson"
    }

    # Build bulk request (newline-delimited JSON)
    bulk_data = []
    for sp in species:
        # Index action
        bulk_data.append('{"index": {"_id": "' + sp['id'] + '"}}')
        # Document
        import json
        bulk_data.append(json.dumps(sp))

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
                    print(f"✓ Successfully indexed {len(species)} species to Elasticsearch")
                return True
            else:
                print(f"✗ Failed to bulk index: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"✗ Error indexing to Elasticsearch: {e}")
            return False


async def sync_species():
    """Main sync function"""
    print("=" * 60)
    print("Wildlife Species Sync: Supabase → Elasticsearch")
    print("=" * 60)
    print()
    print("Note: For hackathon, using Elasticsearch as primary DB.")
    print("Post-hackathon: Will switch to Supabase as primary.")
    print()

    # Step 1: Fetch from Supabase
    print("[1/3] Fetching species from Supabase...")
    species = await fetch_species_from_supabase()

    if not species:
        print("✗ No species found in Supabase. Aborting sync.")
        return

    print(f"      Found {len(species)} species")
    print()

    # Step 2: Create Elasticsearch index
    print("[2/3] Creating/verifying Elasticsearch index...")
    success = await create_elasticsearch_index()

    if not success:
        print("✗ Failed to create Elasticsearch index. Aborting sync.")
        return

    print()

    # Step 3: Sync to Elasticsearch
    print("[3/3] Syncing species to Elasticsearch...")
    success = await index_species_to_elasticsearch(species)

    print()
    print("=" * 60)

    if success:
        print("✓ Sync completed successfully!")
        print()
        print(f"Summary:")
        print(f"  - Total species synced: {len(species)}")

        # Count by category
        categories = {}
        for sp in species:
            cat = sp.get('category', 'unknown')
            categories[cat] = categories.get(cat, 0) + 1

        print(f"  - By category:")
        for cat, count in sorted(categories.items()):
            print(f"    • {cat}: {count}")
    else:
        print("✗ Sync failed!")

    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(sync_species())

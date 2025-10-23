"""
Script to sync wildlife images from the populate script to Supabase.
This backs up the Elasticsearch image data to Supabase for post-hackathon migration.
"""

import asyncio
import httpx
import os
from typing import List, Dict
from dotenv import load_dotenv

# Import the wildlife data from the populate script
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.populate_wildlife_images import SAMPLE_WILDLIFE_DATA

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


async def sync_images_to_supabase() -> bool:
    """Sync all wildlife images to Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/wildlife_images"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

    # Transform the data to match Supabase schema
    supabase_records = []
    for item in SAMPLE_WILDLIFE_DATA:
        record = {
            "photo_image_url": item["photo_image_url"],
            "photo_description": item["photo_description"],
            "species_name": item.get("species_name"),
            "common_name": item["common_name"],
            "location": item.get("location"),
            "conservation_status": item.get("conservation_status")
        }
        supabase_records.append(record)

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(url, headers=headers, json=supabase_records)
            response.raise_for_status()
            result = response.json()
            print(f"✓ Successfully synced {len(result)} images to Supabase")
            return True
        except Exception as e:
            print(f"✗ Error syncing to Supabase: {e}")
            if hasattr(e, 'response'):
                print(f"  Response: {e.response.text}")
            return False


async def verify_sync() -> int:
    """Verify how many images are in Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/wildlife_images?select=count"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Prefer": "count=exact"
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            count = response.headers.get("Content-Range", "0-0/0").split("/")[-1]
            return int(count)
        except Exception as e:
            print(f"✗ Error verifying sync: {e}")
            return 0


async def main():
    """Main sync function"""
    print("=" * 60)
    print("Wildlife Images Sync: Elasticsearch → Supabase")
    print("=" * 60)
    print()
    print("Note: Backing up Elastic image data to Supabase.")
    print("Post-hackathon: Images will be served from Supabase.")
    print()

    print(f"[1/2] Syncing {len(SAMPLE_WILDLIFE_DATA)} images to Supabase...")
    success = await sync_images_to_supabase()

    if not success:
        print("✗ Sync failed!")
        return

    print()
    print("[2/2] Verifying sync...")
    count = await verify_sync()

    print()
    print("=" * 60)
    print("✓ Sync completed successfully!")
    print()
    print(f"Summary:")
    print(f"  - Images in source: {len(SAMPLE_WILDLIFE_DATA)}")
    print(f"  - Images in Supabase: {count}")

    # Count by type
    categories = {}
    for item in SAMPLE_WILDLIFE_DATA:
        # Simple categorization based on common name
        name = item["common_name"].lower()
        if any(word in name for word in ["tree", "palm", "mangrove", "fern", "plant", "grass", "lily", "shrub"]):
            cat = "Plants"
        elif any(word in name for word in ["bird", "heron", "duck", "eagle", "toucan", "owl", "parrot"]):
            cat = "Birds"
        elif any(word in name for word in ["turtle", "caiman", "lizard", "frog"]):
            cat = "Reptiles/Amphibians"
        elif any(word in name for word in ["manatee", "monkey", "deer", "jaguar", "otter", "paca"]):
            cat = "Mammals"
        else:
            cat = "Other"

        categories[cat] = categories.get(cat, 0) + 1

    print(f"  - By category:")
    for cat, cnt in sorted(categories.items()):
        print(f"    • {cat}: {cnt}")

    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())

"""
Script to fetch wildlife images from Wikimedia Commons based on scientific names.
Uses the MediaWiki API to search for species-specific photos.
"""

import asyncio
import httpx
from typing import Optional, List, Dict
import os
from dotenv import load_dotenv

load_dotenv()

WIKIMEDIA_API_URL = "https://commons.wikimedia.org/w/api.php"
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip('/')
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


async def search_wikimedia_image(species_name: str) -> Optional[str]:
    """
    Search for an image on Wikimedia Commons by scientific name.
    Returns the URL of the first suitable image found.
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        # First, try to find images in a category matching the scientific name
        params = {
            "action": "query",
            "generator": "categorymembers",
            "gcmtitle": f"Category:{species_name}",
            "gcmlimit": "5",
            "gcmtype": "file",
            "prop": "imageinfo",
            "iiprop": "url|size|mime",
            "iiurlwidth": "800",
            "format": "json"
        }

        try:
            response = await client.get(WIKIMEDIA_API_URL, params=params)
            data = response.json()

            # Check if we got results from category
            if "query" in data and "pages" in data["query"]:
                for page in data["query"]["pages"].values():
                    if "imageinfo" in page:
                        image_info = page["imageinfo"][0]
                        # Filter for JPEG/PNG images
                        if image_info.get("mime") in ["image/jpeg", "image/png"]:
                            return image_info.get("url")

            # If category search fails, try searching by title
            search_params = {
                "action": "query",
                "generator": "search",
                "gsrsearch": f"File:{species_name}",
                "gsrlimit": "5",
                "gsrnamespace": "6",  # File namespace
                "prop": "imageinfo",
                "iiprop": "url|size|mime",
                "iiurlwidth": "800",
                "format": "json"
            }

            response = await client.get(WIKIMEDIA_API_URL, params=search_params)
            data = response.json()

            if "query" in data and "pages" in data["query"]:
                for page in data["query"]["pages"].values():
                    if "imageinfo" in page:
                        image_info = page["imageinfo"][0]
                        if image_info.get("mime") in ["image/jpeg", "image/png"]:
                            return image_info.get("url")

            return None

        except Exception as e:
            print(f"✗ Error searching Wikimedia for {species_name}: {e}")
            return None


async def get_species_from_supabase() -> List[Dict]:
    """Fetch all species from Supabase wildlife_species table."""
    url = f"{SUPABASE_URL}/rest/v1/wildlife_species?select=id,scientific_name,common_name"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url, headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"✗ Failed to fetch species: {response.status_code}")
            return []


async def update_wildlife_image(species_name: str, common_name: str, image_url: str):
    """Update or insert wildlife image in Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/wildlife_images"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

    data = {
        "species_name": species_name,
        "common_name": common_name,
        "photo_image_url": image_url,
        "photo_description": f"{common_name} ({species_name}) from Wikimedia Commons"
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, headers=headers, json=data)
        if response.status_code in [200, 201]:
            print(f"✓ Updated image for {common_name}")
            return True
        else:
            print(f"✗ Failed to update {common_name}: {response.status_code}")
            return False


async def main():
    """Main function to fetch Wikimedia images and update database."""
    print("Fetching species from Supabase...")
    species_list = await get_species_from_supabase()

    if not species_list:
        print("No species found in database")
        return

    print(f"Found {len(species_list)} species\n")

    success_count = 0
    failed_count = 0

    for species in species_list:
        scientific_name = species.get("scientific_name")
        common_name = species.get("common_name")

        if not scientific_name:
            continue

        print(f"Searching for {common_name} ({scientific_name})...")
        image_url = await search_wikimedia_image(scientific_name)

        if image_url:
            success = await update_wildlife_image(scientific_name, common_name, image_url)
            if success:
                success_count += 1
            else:
                failed_count += 1
        else:
            print(f"  ✗ No image found for {common_name}")
            failed_count += 1

        # Be nice to Wikimedia API
        await asyncio.sleep(0.5)

    print(f"\n{'='*50}")
    print(f"✓ Successfully updated: {success_count} species")
    print(f"✗ Failed or not found: {failed_count} species")
    print(f"{'='*50}")


if __name__ == "__main__":
    asyncio.run(main())

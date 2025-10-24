"""
Script to populate Supabase and Elasticsearch with wildlife images from San San Pond Sak Wetlands.
Fetches real species-specific photos from Wikimedia Commons API.
Only saves images when a species-specific Wikimedia photo is found.
"""

import asyncio
import httpx
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv

load_dotenv()

ELASTIC_CLOUD_URL = os.getenv("ELASTIC_CLOUD_URL", "").rstrip('/')
ELASTIC_API_KEY = os.getenv("ELASTIC_API_KEY", "")
WILDLIFE_IMAGE_INDEX = os.getenv("WILDLIFE_IMAGE_INDEX", "wildlife-images")
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip('/')
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
WIKIMEDIA_API_URL = "https://commons.wikimedia.org/w/api.php"

# Spanish to English common name mapping for species
ENGLISH_NAMES = {
    "Águila pescadora": "Osprey",
    "Amazilia colirrufo": "Rufous-tailed Hummingbird",
    "Bolsero castaño": "Orchard Oriole",
    "Carpintero lineado": "Lineated Woodpecker",
    "Carpintero picoplata": "Pale-billed Woodpecker",
    "Cigua palmera": "Palm Tanager",
    "Colibrí": "Hummingbird",
    "Colibrí pechicanelo": "Rufous-breasted Hermit",
    "Garza grande": "Great Egret",
    "Garza tricolor": "Tricolored Heron",
    "Garza cucharón": "Boat-billed Heron",
    "Garza-tigre castaña": "Rufescent Tiger-Heron",
    "Ibis verde": "Green Ibis",
    "Loro frentirrojo": "Red-lored Parrot",
    "Martín pescador verde": "Green Kingfisher",
    "Martín pescador pigmeo": "American Pygmy Kingfisher",
    "Momoto común": "Blue-crowned Motmot",
    "Oropéndola cabecicastaña": "Chestnut-headed Oropendola",
    "Tucán pico iris": "Keel-billed Toucan",
    "Zopilote cabecinegro": "Black Vulture",
    "Perezoso de tres dedos": "Three-toed Sloth",
    "Perezoso de dos dedos": "Two-toed Sloth",
    "Oso perezoso de tres dedos": "Brown-throated Sloth",
    "Oso perezoso de dos dedos": "Hoffmann's Two-toed Sloth",
    "Mono aullador": "Howler Monkey",
    "Mono araña": "Spider Monkey",
    "Mono araña colorado": "Geoffroy's Spider Monkey",
    "Mono capuchino": "White-faced Capuchin",
    "Mono cariblanco": "White-faced Capuchin",
    "Jaguar": "Jaguar",
    "Ocelote": "Ocelot",
    "Puma": "Puma",
    "Ñeque": "Central American Agouti",
    "Saíno": "Collared Peccary",
    "Tepezcuintle": "Paca",
    "Manatí": "West Indian Manatee",
    "Manatí antillano": "West Indian Manatee",
    "Delfín nariz de botella": "Bottlenose Dolphin",
    "Nutria neotropical": "Neotropical River Otter",
    "Tortuga carey": "Hawksbill Sea Turtle",
    "Tortuga verde": "Green Sea Turtle",
    "Tortuga baula": "Leatherback Sea Turtle",
    "Rana venenosa": "Poison Dart Frog",
    "Boa": "Boa Constrictor",
    "Boa constrictor": "Boa Constrictor",
    "Caimán": "Spectacled Caiman",
    "Babillo": "Spectacled Caiman",
    "Iguana verde": "Green Iguana",
    "Cocodrilo americano": "American Crocodile",
    "Lagarto aguja": "American Crocodile",
    "Barbita colibandeada": "Band-tailed Barbthroat",
    "Búho moteado": "Mottled Owl",
    "Chachalaca cabecigris": "Grey-headed Chachalaca",
    "Ermitaño colilargo": "Long-tailed Hermit",
    "Gallareta frentirroja": "Common Moorhen",
    "Gavilán aludo": "Broad-winged Hawk",
    "Gavilán zancón": "Crane Hawk",
    "Golondrina manglera": "Mangrove Swallow",
    "Golondrina tijereta": "Barn Swallow",
    "Halcón reidor": "Laughing Falcon",
    "Mímido gris": "Gray Catbird",
    "Pato real": "Muscovy Duck",
    "Pato-silbador aliblanco": "Black-bellied Whistling-Duck",
    "Pava crestada": "Crested Guan",
    "Perico frentirrojo": "Crimson-fronted Parakeet",
    "Playero coleador": "Spotted Sandpiper",
    "Puerco de monte": "White-lipped Peccary",
    "Reinita cachetinegra": "Kentucky Warbler",
    "Tángara escarlata": "Scarlet Tanager",
    "Tinamú chico": "Little Tinamou",
    "Tinamú grande": "Great Tinamou",
    "Tirano norteño": "Eastern Kingbird",
    "Vireo verdiamarillo": "Yellow-green Vireo",
    "Orey": "Orey",
    "Cativo": "Cativo Tree",
    "Cerillo": "Manni Tree",
    "Sangrillo": "Bloodwood Tree",
    "Caoba": "Mahogany",
    "Matumba": "Raffia Palm",
    "Mangle rojo": "Red Mangrove",
    "Mangle blanco": "White Mangrove",
    "Cyrilla": "Swamp Cyrilla",
    "Otoe lagarto": "Dumb Cane",
    "Negra jorra": "Golden Leather Fern",
    "Ajo": "Cassipourea",
    "Castaño": "Aninga",
    "Membrillo": "Membrillo",
    "Nymphoides": "Floating Heart",
    "Spathiphyllum": "Peace Lily",
    "Epidendrum nocturnum": "Night-scented Epidendrum",
    "Tillandsia usneoides": "Spanish Moss",
    "Brassavola nodosa": "Lady of the Night Orchid",
    "Encyclia cordigera": "Spice Orchid",
}


async def create_index():
    """Create the wildlife images index with proper mappings"""
    url = f"{ELASTIC_CLOUD_URL}/{WILDLIFE_IMAGE_INDEX}"
    headers = {
        "Authorization": f"ApiKey {ELASTIC_API_KEY}",
        "Content-Type": "application/json"
    }

    mapping = {
        "mappings": {
            "properties": {
                "photo_image_url": {"type": "keyword"},
                "photo_description": {"type": "text"},
                "species_name": {"type": "text"},
                "common_name": {"type": "text"},
                "english_name": {"type": "text"},
                "location": {"type": "text"},
                "conservation_status": {"type": "keyword"}
            }
        }
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.put(url, headers=headers, json=mapping)
            if response.status_code in [200, 201]:
                print(f"✓ Index '{WILDLIFE_IMAGE_INDEX}' created successfully")
            elif response.status_code == 400 and "resource_already_exists" in response.text:
                print(f"✓ Index '{WILDLIFE_IMAGE_INDEX}' already exists")
            else:
                print(f"✗ Failed to create index: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"✗ Error creating index: {e}")


async def save_to_supabase(doc: Dict) -> bool:
    """Save document to Supabase wildlife_images table"""
    url = f"{SUPABASE_URL}/rest/v1/wildlife_images"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=doc)
            if response.status_code in [200, 201]:
                return True
            else:
                print(f"  ✗ Supabase error: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"  ✗ Supabase error: {e}")
            return False


async def index_document(doc: Dict):
    """Index a single document to Elasticsearch"""
    url = f"{ELASTIC_CLOUD_URL}/{WILDLIFE_IMAGE_INDEX}/_doc"
    headers = {
        "Authorization": f"ApiKey {ELASTIC_API_KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=doc)
            if response.status_code in [200, 201]:
                return True
            else:
                print(f"  ✗ Elasticsearch error: {response.status_code}")
                return False
        except Exception as e:
            print(f"  ✗ Elasticsearch error: {e}")
            return False


async def search_wikimedia_image(species_name: str, common_name: str) -> Optional[str]:
    """
    Search for an image on Wikimedia Commons by scientific name.
    Returns the URL of the first suitable image found, or None if no specific image is available.
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Try to find images in a category matching the scientific name
        params = {
            "action": "query",
            "generator": "categorymembers",
            "gcmtitle": f"Category:{species_name}",
            "gcmlimit": "10",
            "gcmtype": "file",
            "prop": "imageinfo",
            "iiprop": "url|size|mime|extmetadata",
            "iiurlwidth": "800",
            "format": "json"
        }

        try:
            response = await client.get(WIKIMEDIA_API_URL, params=params)
            data = response.json()

            if "query" in data and "pages" in data["query"]:
                for page in data["query"]["pages"].values():
                    if "imageinfo" in page:
                        image_info = page["imageinfo"][0]
                        image_url = image_info.get("url", "")

                        # Check if it's a valid image type
                        if image_info.get("mime") not in ["image/jpeg", "image/png"]:
                            continue

                        return image_url

            # If category search fails, try searching by title with scientific name
            search_params = {
                "action": "query",
                "generator": "search",
                "gsrsearch": f"File:{species_name}",
                "gsrlimit": "10",
                "gsrnamespace": "6",
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
                        image_url = image_info.get("url", "")

                        if image_info.get("mime") not in ["image/jpeg", "image/png"]:
                            continue

                        return image_url

            return None

        except Exception as e:
            print(f"  ⚠ Wikimedia search error: {e}")
            return None


async def get_species_from_supabase() -> List[Dict]:
    """Fetch all species from Supabase wildlife_species table."""
    url = f"{SUPABASE_URL}/rest/v1/wildlife_species?select=id,scientific_name,common_name,conservation_status,category"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"✗ Failed to fetch species: {response.status_code}")
                return []
        except Exception as e:
            print(f"✗ Error fetching from Supabase: {e}")
            return []


async def populate_wildlife_images():
    """Main function to populate both Supabase and Elasticsearch with Wikimedia images"""
    print("=" * 70)
    print("Wildlife Image Population: Wikimedia Commons → Supabase + Elasticsearch")
    print("=" * 70)
    print(f"Target index: {WILDLIFE_IMAGE_INDEX}")
    print(f"Elastic URL: {ELASTIC_CLOUD_URL}")
    print(f"Supabase URL: {SUPABASE_URL}")

    # Check required credentials
    if not SUPABASE_SERVICE_ROLE_KEY:
        print("\n✗ ERROR: SUPABASE_SERVICE_ROLE_KEY not found in environment!")
        print("Please set it in your .env file")
        return
    if not ELASTIC_API_KEY:
        print("\n✗ ERROR: ELASTIC_API_KEY not found in environment!")
        print("Please set it in your .env file")
        return

    print()

    await create_index()

    print("\nFetching species from Supabase...")
    species_list = await get_species_from_supabase()

    if not species_list:
        print("✗ No species found in Supabase.")
        return

    print(f"✓ Found {len(species_list)} species\n")
    print("Fetching images from Wikimedia Commons...\n")

    success_count = 0
    skipped_count = 0

    for species in species_list:
        scientific_name = species.get("scientific_name")
        common_name = species.get("common_name")
        conservation_status = species.get("conservation_status", "Unknown")

        if not scientific_name:
            continue

        print(f"Processing {common_name} ({scientific_name})...")

        # Try to get image from Wikimedia
        wikimedia_url = await search_wikimedia_image(scientific_name, common_name)

        if wikimedia_url:
            english_name = ENGLISH_NAMES.get(common_name, common_name)
            doc = {
                "photo_image_url": wikimedia_url,
                "photo_description": f"{common_name} / {english_name} ({scientific_name}) - Image from Wikimedia Commons",
                "species_name": scientific_name,
                "common_name": common_name,
                "english_name": english_name,
                "location": "San San Pond Sak Wetlands",
                "conservation_status": conservation_status
            }

            # Save to both Supabase and Elasticsearch
            supabase_success = await save_to_supabase(doc)
            elastic_success = await index_document(doc)

            if supabase_success and elastic_success:
                success_count += 1
                print(f"  ✓ Saved to Supabase and Elasticsearch")
            elif supabase_success or elastic_success:
                success_count += 1
                print(f"  ⚠ Partial success (check logs above)")
            else:
                skipped_count += 1
                print(f"  ✗ Failed to save")
        else:
            skipped_count += 1
            print(f"  ✗ No suitable Wikimedia image found (skipping generic stock photos)")

        # Be nice to Wikimedia API
        await asyncio.sleep(0.5)

    print("\n" + "=" * 70)
    print("Summary:")
    print(f"  ✓ Successfully saved: {success_count}")
    print(f"  ✗ Skipped (no specific image): {skipped_count}")
    print(f"  Total processed: {len(species_list)}")
    print("=" * 70)
    print("\nNote: Only species with specific Wikimedia images were saved.")
    print("Generic stock photos were skipped to ensure accuracy.")


if __name__ == "__main__":
    asyncio.run(populate_wildlife_images())

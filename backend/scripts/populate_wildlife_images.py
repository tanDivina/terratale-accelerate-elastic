"""
Script to populate Elasticsearch with sample wildlife images from San San Pond Sak Wetlands.
Uses Pexels stock photos for demonstration purposes.
"""

import asyncio
import httpx
from typing import List, Dict
import os
from dotenv import load_dotenv

load_dotenv()

ELASTIC_CLOUD_URL = os.getenv("ELASTIC_CLOUD_URL", "").rstrip('/')
ELASTIC_API_KEY = os.getenv("ELASTIC_API_KEY", "")
WILDLIFE_IMAGE_INDEX = os.getenv("WILDLIFE_IMAGE_INDEX", "wildlife-images")

SAMPLE_WILDLIFE_DATA = [
    {
        "photo_image_url": "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
        "photo_description": "Great Blue Heron standing majestically in shallow wetland waters",
        "species_name": "Ardea herodias",
        "common_name": "Great Blue Heron",
        "location": "San San Pond Sak Wetlands"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/86596/owl-bird-eyes-eagle-owl-86596.jpeg",
        "photo_description": "Spectacled Owl perched on a branch, displaying distinctive facial markings",
        "species_name": "Pulsatrix perspicillata",
        "common_name": "Spectacled Owl",
        "location": "San San Pond Sak Wetlands"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1320474/pexels-photo-1320474.jpeg",
        "photo_description": "Three-toed Sloth hanging from tree branches in mangrove forest",
        "species_name": "Bradypus variegatus",
        "common_name": "Brown-throated Sloth",
        "location": "San San Pond Sak Wetlands"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3894157/pexels-photo-3894157.jpeg",
        "photo_description": "Sea turtle swimming gracefully through crystal clear Caribbean waters",
        "species_name": "Chelonia mydas",
        "common_name": "Green Sea Turtle",
        "location": "San San Pond Sak Wetlands"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2317904/pexels-photo-2317904.jpeg",
        "photo_description": "Kingfisher perched on a branch overlooking wetland waters",
        "species_name": "Megaceryle alcyon",
        "common_name": "Belted Kingfisher",
        "location": "San San Pond Sak Wetlands"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg",
        "photo_description": "Dense mangrove forest roots creating intricate ecosystem",
        "species_name": "Rhizophora mangle",
        "common_name": "Red Mangrove",
        "location": "San San Pond Sak Wetlands"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3490257/pexels-photo-3490257.jpeg",
        "photo_description": "Howler monkey resting in tropical canopy of wetland forest",
        "species_name": "Alouatta palliata",
        "common_name": "Mantled Howler Monkey",
        "location": "San San Pond Sak Wetlands"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1059823/pexels-photo-1059823.jpeg",
        "photo_description": "Butterfly with vibrant blue wings resting on tropical flower",
        "species_name": "Morpho peleides",
        "common_name": "Blue Morpho Butterfly",
        "location": "San San Pond Sak Wetlands"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2317942/pexels-photo-2317942.jpeg",
        "photo_description": "Colorful toucan perched in rainforest canopy near wetlands",
        "species_name": "Ramphastos sulfuratus",
        "common_name": "Keel-billed Toucan",
        "location": "San San Pond Sak Wetlands"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2168831/pexels-photo-2168831.jpeg",
        "photo_description": "Red-eyed tree frog clinging to leaf in humid wetland environment",
        "species_name": "Agalychnis callidryas",
        "common_name": "Red-eyed Tree Frog",
        "location": "San San Pond Sak Wetlands"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1571940/pexels-photo-1571940.jpeg",
        "photo_description": "Green iguana basking on branch near wetland waters",
        "species_name": "Iguana iguana",
        "common_name": "Green Iguana",
        "location": "San San Pond Sak Wetlands"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2317767/pexels-photo-2317767.jpeg",
        "photo_description": "Scarlet Macaw displaying brilliant red and blue plumage",
        "species_name": "Ara macao",
        "common_name": "Scarlet Macaw",
        "location": "San San Pond Sak Wetlands"
    }
]


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
                "location": {"type": "text"}
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


async def index_document(doc: Dict):
    """Index a single document"""
    url = f"{ELASTIC_CLOUD_URL}/{WILDLIFE_IMAGE_INDEX}/_doc"
    headers = {
        "Authorization": f"ApiKey {ELASTIC_API_KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=doc)
            if response.status_code in [200, 201]:
                print(f"✓ Indexed: {doc['common_name']}")
            else:
                print(f"✗ Failed to index {doc['common_name']}: {response.status_code}")
        except Exception as e:
            print(f"✗ Error indexing {doc['common_name']}: {e}")


async def populate_wildlife_images():
    """Main function to populate the index"""
    print("Starting wildlife image population...")
    print(f"Target index: {WILDLIFE_IMAGE_INDEX}")
    print(f"Elastic URL: {ELASTIC_CLOUD_URL}\n")

    await create_index()

    print(f"\nIndexing {len(SAMPLE_WILDLIFE_DATA)} wildlife documents...\n")

    for doc in SAMPLE_WILDLIFE_DATA:
        await index_document(doc)

    print(f"\n✓ Finished indexing {len(SAMPLE_WILDLIFE_DATA)} documents")


if __name__ == "__main__":
    asyncio.run(populate_wildlife_images())

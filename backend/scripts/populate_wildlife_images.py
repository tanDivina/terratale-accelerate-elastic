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
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2317767/pexels-photo-2317767.jpeg",
        "photo_description": "Yellow-crowned Amazon parrot in tropical forest canopy, endangered species",
        "species_name": "Amazona ochrocephala",
        "common_name": "Yellow-crowned Amazon",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Endangered"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3894157/pexels-photo-3894157.jpeg",
        "photo_description": "Green sea turtle swimming gracefully through Caribbean waters, critically endangered",
        "species_name": "Chelonia mydas",
        "common_name": "Green Sea Turtle",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Endangered"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/4666751/pexels-photo-4666751.jpeg",
        "photo_description": "Hawksbill sea turtle on nesting beach, critically endangered marine species",
        "species_name": "Eretmochelys imbricata",
        "common_name": "Hawksbill Sea Turtle",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Critically Endangered"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2611811/pexels-photo-2611811.jpeg",
        "photo_description": "Leatherback sea turtle, largest living turtle species, critically endangered",
        "species_name": "Dermochelys coriacea",
        "common_name": "Leatherback Sea Turtle",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Critically Endangered"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
        "photo_description": "Loggerhead sea turtle in coastal waters, endangered marine reptile",
        "species_name": "Caretta caretta",
        "common_name": "Loggerhead Sea Turtle",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Endangered"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/5476960/pexels-photo-5476960.jpeg",
        "photo_description": "Muscovy duck in wetland habitat, vulnerable wild species",
        "species_name": "Cairina moschata",
        "common_name": "Muscovy Duck",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Endangered"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/8083690/pexels-photo-8083690.jpeg",
        "photo_description": "Black-bellied whistling duck in wetland grasses",
        "species_name": "Dendrocygna autumnalis",
        "common_name": "Black-bellied Whistling Duck",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Endangered"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/4666748/pexels-photo-4666748.jpeg",
        "photo_description": "Harpy Eagle perched majestically, apex predator and critically endangered species",
        "species_name": "Harpia harpyja",
        "common_name": "Harpy Eagle",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Endangered"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2317942/pexels-photo-2317942.jpeg",
        "photo_description": "Resplendent Quetzal with brilliant emerald plumage, endangered cloud forest bird",
        "species_name": "Pharomachrus mocinno",
        "common_name": "Resplendent Quetzal",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Endangered"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6514925/pexels-photo-6514925.jpeg",
        "photo_description": "West Indian Manatee grazing on aquatic vegetation, critically endangered marine mammal",
        "species_name": "Trichechus manatus",
        "common_name": "West Indian Manatee",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Endangered"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1670732/pexels-photo-1670732.jpeg",
        "photo_description": "White-tailed deer in wetland forest clearing, endangered subspecies",
        "species_name": "Odocoileus virginianus",
        "common_name": "White-tailed Deer",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Endangered"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3493777/pexels-photo-3493777.jpeg",
        "photo_description": "Red brocket deer in tropical forest habitat, endangered small deer species",
        "species_name": "Mazama americana",
        "common_name": "Red Brocket Deer",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Endangered"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3608263/pexels-photo-3608263.jpeg",
        "photo_description": "Capybara family near water edge, largest rodent in the world, endangered",
        "species_name": "Hydrochaeris hydrochaeris",
        "common_name": "Capybara",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Endangered"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/5857753/pexels-photo-5857753.jpeg",
        "photo_description": "Lowland paca foraging at night, endangered large rodent",
        "species_name": "Agouti paca",
        "common_name": "Lowland Paca",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Endangered"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2317904/pexels-photo-2317904.jpeg",
        "photo_description": "Spectacled caiman in wetland waters, vulnerable crocodilian species",
        "species_name": "Caiman crocodilus",
        "common_name": "Spectacled Caiman",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Endangered"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg",
        "photo_description": "Red mangrove ecosystem with intricate root system, critical wetland habitat",
        "species_name": "Rhizophora mangle",
        "common_name": "Red Mangrove",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Keystone Species"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg",
        "photo_description": "Black mangrove in coastal wetland, important for shoreline stabilization",
        "species_name": "Avicennia germinans",
        "common_name": "Black Mangrove",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Keystone Species"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg",
        "photo_description": "Cativo tree in lowland rainforest, dominant species forming extensive stands",
        "species_name": "Prioria copaifera",
        "common_name": "Cativo",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Vulnerable"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg",
        "photo_description": "Orey tree in swamp forest, important wetland species",
        "species_name": "Campnosperma panamensis",
        "common_name": "Orey",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Species"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg",
        "photo_description": "Cerillo tree with distinctive yellow wood, swamp forest species",
        "species_name": "Symphonia globulifera",
        "common_name": "Cerillo",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Species"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg",
        "photo_description": "Sangrillo tree in wetland forest, important timber species",
        "species_name": "Pterocarpus officinalis",
        "common_name": "Sangrillo",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Species"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6894276/pexels-photo-6894276.jpeg",
        "photo_description": "Yolillo palm in peat swamp forest, important wetland palm species",
        "species_name": "Raphia taedigera",
        "common_name": "Yolillo Palm",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Species"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3490257/pexels-photo-3490257.jpeg",
        "photo_description": "Howler monkey in tropical canopy of wetland forest",
        "species_name": "Alouatta palliata",
        "common_name": "Mantled Howler Monkey",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Vulnerable"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1059823/pexels-photo-1059823.jpeg",
        "photo_description": "Blue Morpho butterfly with vibrant wings, important pollinator",
        "species_name": "Morpho peleides",
        "common_name": "Blue Morpho Butterfly",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2317942/pexels-photo-2317942.jpeg",
        "photo_description": "Keel-billed toucan in rainforest canopy near wetlands",
        "species_name": "Ramphastos sulfuratus",
        "common_name": "Keel-billed Toucan",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2168831/pexels-photo-2168831.jpeg",
        "photo_description": "Red-eyed tree frog in humid wetland environment, one of 20 amphibian species",
        "species_name": "Agalychnis callidryas",
        "common_name": "Red-eyed Tree Frog",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2252618/pexels-photo-2252618.jpeg",
        "photo_description": "Water hyacinth floating on wetland waters with attractive purple flowers",
        "species_name": "Eichhornia crassipes",
        "common_name": "Water Hyacinth",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Aquatic Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6775268/pexels-photo-6775268.jpeg",
        "photo_description": "Water lettuce floating in wetland, resembling a head of lettuce",
        "species_name": "Pistia stratiotes",
        "common_name": "Water Lettuce",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Aquatic Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6894335/pexels-photo-6894335.jpeg",
        "photo_description": "Yellow allamanda with bright golden flowers in tropical wetland habitat",
        "species_name": "Allamanda cathartica",
        "common_name": "Yellow Allamanda",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3493777/pexels-photo-3493777.jpeg",
        "photo_description": "Green basilisk lizard running across water surface, famous Jesus Christ lizard",
        "species_name": "Basiliscus plumifrons",
        "common_name": "Green Basilisk (Jesus Christ Lizard)",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/4666748/pexels-photo-4666748.jpeg",
        "photo_description": "Neotropical otter hunting in freshwater streams, agile aquatic predator",
        "species_name": "Lontra longicaudis",
        "common_name": "Neotropical Otter",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Near Threatened"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3490257/pexels-photo-3490257.jpeg",
        "photo_description": "White-faced capuchin monkey foraging near water in tropical forest",
        "species_name": "Cebus capucinus",
        "common_name": "White-faced Capuchin Monkey",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2253018/pexels-photo-2253018.jpeg",
        "photo_description": "Jaguar stalking through wetland habitat, apex predator of Central America",
        "species_name": "Panthera onca",
        "common_name": "Jaguar",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Near Threatened"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3493777/pexels-photo-3493777.jpeg",
        "photo_description": "Roseate spoonbill with distinctive pink plumage feeding in shallow waters",
        "species_name": "Platalea ajaja",
        "common_name": "Roseate Spoonbill",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
        "photo_description": "Anhinga drying its wings after diving for fish, also known as snakebird",
        "species_name": "Anhinga anhinga",
        "common_name": "Anhinga (Snakebird)",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
        "photo_description": "Great egret wading through shallow wetland waters hunting for fish",
        "species_name": "Ardea alba",
        "common_name": "Great Egret",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2317904/pexels-photo-2317904.jpeg",
        "photo_description": "Snail kite raptor hunting for apple snails in wetland marshes",
        "species_name": "Rostrhamus sociabilis",
        "common_name": "Snail Kite",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/4666748/pexels-photo-4666748.jpeg",
        "photo_description": "Osprey diving for fish near wetland waters, skilled fish-eating raptor",
        "species_name": "Pandion haliaetus",
        "common_name": "Osprey",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6775268/pexels-photo-6775268.jpeg",
        "photo_description": "Castaño wetland plant with large leaves, important aquatic vegetation",
        "species_name": "Montrichardia arborescens",
        "common_name": "Castaño",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Aquatic Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6894276/pexels-photo-6894276.jpeg",
        "photo_description": "Caña blanca tall grass growing in wetland margins, forms dense stands",
        "species_name": "Gynerium sagittatum",
        "common_name": "Caña Blanca",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg",
        "photo_description": "Negra jorra fern in coastal wetlands, salt-tolerant species",
        "species_name": "Acrostichum aureum",
        "common_name": "Negra Jorra",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2252618/pexels-photo-2252618.jpeg",
        "photo_description": "Lirio wetland lily with white fragrant flowers",
        "species_name": "Hymenocallis pedalis",
        "common_name": "Lirio",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Aquatic Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6775268/pexels-photo-6775268.jpeg",
        "photo_description": "Urospatha aquatic aroid in shaded wetland areas",
        "species_name": "Urospatha friedrichsthalii",
        "common_name": "Urospatha",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Aquatic Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6894276/pexels-photo-6894276.jpeg",
        "photo_description": "Cyperus sedge forming dense colonies in wetland margins",
        "species_name": "Cyperus luzulae",
        "common_name": "Cyperus",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg",
        "photo_description": "Icaco shrub with edible fruits along coastal wetland areas",
        "species_name": "Chrysobalanus icaco",
        "common_name": "Icaco",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6775268/pexels-photo-6775268.jpeg",
        "photo_description": "Neea shrub species found in wetland forest margins",
        "species_name": "Neea sp.",
        "common_name": "Neea",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6894276/pexels-photo-6894276.jpeg",
        "photo_description": "Cyperus grass species forming herbaceous wetland vegetation",
        "species_name": "Cyperus sp.",
        "common_name": "Cyperus",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg",
        "photo_description": "Mangle blanco mangrove tree with distinctive white bark in coastal wetlands",
        "species_name": "Laguncularia racemosa",
        "common_name": "Mangle Blanco",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Mangrove"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3687770/pexels-photo-3687770.jpeg",
        "photo_description": "Majagüillo hibiscus with large pink flowers in wetland margins",
        "species_name": "Hibiscus pernambucensis",
        "common_name": "Majagüillo",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6775091/pexels-photo-6775091.jpeg",
        "photo_description": "Mangle cimarrón shrub with aromatic leaves in wetland areas",
        "species_name": "Myrica mexicana",
        "common_name": "Mangle Cimarrón",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3687770/pexels-photo-3687770.jpeg",
        "photo_description": "Mangle cimarrón tree with white flower clusters in swamp forests",
        "species_name": "Cyrilla racemiflora",
        "common_name": "Mangle Cimarrón",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg",
        "photo_description": "Tococa shrub species with distinctive leaves in wetland understory",
        "species_name": "Tococa sp.",
        "common_name": "Tococa",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Plant"
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

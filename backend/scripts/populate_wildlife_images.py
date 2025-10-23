"""
Script to populate Elasticsearch with sample wildlife images from San San Pond Sak Wetlands.
Uses Pexels stock photos for demonstration purposes.
Now includes all 71 species from the Supabase wildlife_species table.
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
    # BIRDS (30 species)
    {
        "photo_image_url": "https://images.pexels.com/photos/4666748/pexels-photo-4666748.jpeg",
        "photo_description": "Águila pescadora (Osprey) diving for fish near wetland waters",
        "species_name": "Pandion haliaetus",
        "common_name": "Águila pescadora",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2317942/pexels-photo-2317942.jpeg",
        "photo_description": "Amazilia colirrufo (Rufous-tailed Hummingbird) hovering near tropical flowers",
        "species_name": "Amazilia tzacatl",
        "common_name": "Amazilia colirrufo",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2317942/pexels-photo-2317942.jpeg",
        "photo_description": "Barbita colibandeada hermit in wetland understory",
        "species_name": "Threnetes ruckeri",
        "common_name": "Barbita colibandeada",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
        "photo_description": "Bolsero castaño (Orchard Oriole) perched in wetland trees",
        "species_name": "Icterus spurius",
        "common_name": "Bolsero castaño",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Declining"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2317767/pexels-photo-2317767.jpeg",
        "photo_description": "Búho moteado (Mottled Owl) in tropical forest canopy",
        "species_name": "Ciccaba virgata",
        "common_name": "Búho moteado",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
        "photo_description": "Carpintero picoplata woodpecker in wetland forest",
        "species_name": "Campephilus guatemalensis",
        "common_name": "Carpintero picoplata",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/5476960/pexels-photo-5476960.jpeg",
        "photo_description": "Chachalaca cabecigris in tropical vegetation",
        "species_name": "Ortalis cinereiceps",
        "common_name": "Chachalaca cabecigris",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2317942/pexels-photo-2317942.jpeg",
        "photo_description": "Colibrí pechicanelo hummingbird feeding on nectar",
        "species_name": "Glaucis hirsuta",
        "common_name": "Colibrí pechicanelo",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2317942/pexels-photo-2317942.jpeg",
        "photo_description": "Ermitaño colilargo hermit in tropical understory",
        "species_name": "Phaethornis superciliosus",
        "common_name": "Ermitaño colilargo",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/8083690/pexels-photo-8083690.jpeg",
        "photo_description": "Gallareta frentirroja (Common Moorhen) in wetland grasses",
        "species_name": "Gallinula chloropus",
        "common_name": "Gallareta frentirroja",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
        "photo_description": "Garza cucharón (Boat-billed Heron) in shallow wetland waters",
        "species_name": "Cochlearius cochlearius",
        "common_name": "Garza cucharón",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
        "photo_description": "Garza-tigre castaña (Rufescent Tiger-Heron) hunting in wetland",
        "species_name": "Tigrisoma lineatum",
        "common_name": "Garza-tigre castaña",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/4666748/pexels-photo-4666748.jpeg",
        "photo_description": "Gavilán aludo (Broad-winged Hawk) perched in canopy",
        "species_name": "Buteo platypterus",
        "common_name": "Gavilán aludo",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/4666748/pexels-photo-4666748.jpeg",
        "photo_description": "Gavilán zancón (Crane Hawk) with distinctive long legs",
        "species_name": "Geranospiza caerulescens",
        "common_name": "Gavilán zancón",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
        "photo_description": "Golondrina manglera (Mangrove Swallow) near water",
        "species_name": "Tachycineta albilinea",
        "common_name": "Golondrina manglera",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
        "photo_description": "Golondrina tijereta (Barn Swallow) in flight over wetlands",
        "species_name": "Hirundo rustica",
        "common_name": "Golondrina tijereta",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Declining"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/4666748/pexels-photo-4666748.jpeg",
        "photo_description": "Halcón reidor (Laughing Falcon) perched prominently",
        "species_name": "Herpetotheres cachinnans",
        "common_name": "Halcón reidor",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
        "photo_description": "Martín pescador pigmeo (American Pygmy Kingfisher) near stream",
        "species_name": "Chloroceryle aenea",
        "common_name": "Martín pescador pigmeo",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
        "photo_description": "Mímido gris (Gray Catbird) in wetland vegetation",
        "species_name": "Dumetella carolinensis",
        "common_name": "Mímido gris",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Declining"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/5476960/pexels-photo-5476960.jpeg",
        "photo_description": "Pato real (Muscovy Duck) in wetland habitat",
        "species_name": "Cairina moschata",
        "common_name": "Pato real",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/8083690/pexels-photo-8083690.jpeg",
        "photo_description": "Pato-silbador aliblanco (Black-bellied Whistling Duck) in wetland",
        "species_name": "Dendrocygna autumnalis",
        "common_name": "Pato-silbador aliblanco",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Vulnerable"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/5476960/pexels-photo-5476960.jpeg",
        "photo_description": "Pava crestada (Crested Guan) in tropical forest",
        "species_name": "Penelope purpurascens",
        "common_name": "Pava crestada",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Vulnerable"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2317767/pexels-photo-2317767.jpeg",
        "photo_description": "Perico frentirrojo (Crimson-fronted Parakeet) in canopy",
        "species_name": "Aratinga finschi",
        "common_name": "Perico frentirrojo",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
        "photo_description": "Playero coleador (Spotted Sandpiper) along wetland shore",
        "species_name": "Actitis macularia",
        "common_name": "Playero coleador",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Declining"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
        "photo_description": "Reinita cachetinegra (Kentucky Warbler) in understory",
        "species_name": "Oporornis formosus",
        "common_name": "Reinita cachetinegra",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Declining"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
        "photo_description": "Tángara escarlata (Scarlet Tanager) with brilliant red plumage",
        "species_name": "Piranga olivacea",
        "common_name": "Tángara escarlata",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Declining"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/5476960/pexels-photo-5476960.jpeg",
        "photo_description": "Tinamú chico (Little Tinamou) foraging on forest floor",
        "species_name": "Crypturellus soui",
        "common_name": "Tinamú chico",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/5476960/pexels-photo-5476960.jpeg",
        "photo_description": "Tinamú grande (Great Tinamou) in wetland forest",
        "species_name": "Tinamus major",
        "common_name": "Tinamú grande",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
        "photo_description": "Tirano norteño (Eastern Kingbird) perched prominently",
        "species_name": "Tyrannus tyrannus",
        "common_name": "Tirano norteño",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Declining"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
        "photo_description": "Vireo verdiamarillo (Yellow-green Vireo) in tropical foliage",
        "species_name": "Vireo flavoviridis",
        "common_name": "Vireo verdiamarillo",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },

    # MAMMALS (10 species)
    {
        "photo_image_url": "https://images.pexels.com/photos/2253018/pexels-photo-2253018.jpeg",
        "photo_description": "Jaguar stalking through wetland habitat, apex predator",
        "species_name": "Panthera onca",
        "common_name": "Jaguar",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Threatened"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6514925/pexels-photo-6514925.jpeg",
        "photo_description": "Manatí (West Indian Manatee) grazing on aquatic vegetation",
        "species_name": "Trichechus manatus",
        "common_name": "Manatí",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Endangered"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3490257/pexels-photo-3490257.jpeg",
        "photo_description": "Mono araña colorado (Geoffroy's Spider Monkey) in canopy",
        "species_name": "Ateles geoffroyi",
        "common_name": "Mono araña colorado",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Threatened"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3490257/pexels-photo-3490257.jpeg",
        "photo_description": "Mono aullador (Mantled Howler Monkey) in tropical forest",
        "species_name": "Alouatta palliata",
        "common_name": "Mono aullador",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3490257/pexels-photo-3490257.jpeg",
        "photo_description": "Mono cariblanco (White-faced Capuchin) foraging near water",
        "species_name": "Cebus capucinus",
        "common_name": "Mono cariblanco",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3894157/pexels-photo-3894157.jpeg",
        "photo_description": "Oso perezoso de dos dedos (Hoffmann's Two-toed Sloth) hanging in canopy",
        "species_name": "Choloepus hoffmanni",
        "common_name": "Oso perezoso de dos dedos",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3894157/pexels-photo-3894157.jpeg",
        "photo_description": "Oso perezoso de tres dedos (Brown-throated Sloth) in wetland forest",
        "species_name": "Bradypus variegatus",
        "common_name": "Oso perezoso de tres dedos",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3608263/pexels-photo-3608263.jpeg",
        "photo_description": "Puerco de monte (White-lipped Peccary) moving through forest",
        "species_name": "Dicotyles pecari",
        "common_name": "Puerco de monte",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Threatened"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3493777/pexels-photo-3493777.jpeg",
        "photo_description": "Puma in tropical habitat, powerful predator",
        "species_name": "Puma concolor",
        "common_name": "Puma",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Threatened"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3608263/pexels-photo-3608263.jpeg",
        "photo_description": "Saíno (Collared Peccary) foraging in wetland forest",
        "species_name": "Tayassu tajacu",
        "common_name": "Saíno",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },

    # PLANTS (24 species)
    {
        "photo_image_url": "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg",
        "photo_description": "Ajo tree in swamp forest ecosystem",
        "species_name": "Cassipourea elliptica",
        "common_name": "Ajo",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Species"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2252618/pexels-photo-2252618.jpeg",
        "photo_description": "Brassavola nodosa orchid with white fragrant flowers",
        "species_name": "Brassavola nodosa",
        "common_name": "Brassavola nodosa",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Species"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6775268/pexels-photo-6775268.jpeg",
        "photo_description": "Castaño wetland plant with large leaves",
        "species_name": "Montrichardia arborescens",
        "common_name": "Castaño",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Aquatic Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg",
        "photo_description": "Cativo tree in lowland rainforest, dominant species",
        "species_name": "Prioria copaifera",
        "common_name": "Cativo",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Vulnerable"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg",
        "photo_description": "Cerillo tree with distinctive yellow wood",
        "species_name": "Symphonia globulifera",
        "common_name": "Cerillo",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Species"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6894335/pexels-photo-6894335.jpeg",
        "photo_description": "Cydista vine with yellow trumpet flowers",
        "species_name": "Cydista aequinoctalis",
        "common_name": "Cydista",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Species"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3687770/pexels-photo-3687770.jpeg",
        "photo_description": "Cyrilla tree with white flower clusters in swamp forests",
        "species_name": "Cyrilla racemiflora",
        "common_name": "Cyrilla",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2252618/pexels-photo-2252618.jpeg",
        "photo_description": "Encyclia cordigera orchid in tropical habitat",
        "species_name": "Encyclia cordigera",
        "common_name": "Encyclia cordigera",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Species"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2252618/pexels-photo-2252618.jpeg",
        "photo_description": "Epidendrum nocturnum night-blooming orchid",
        "species_name": "Epidendrum nocturnum",
        "common_name": "Epidendrum nocturnum",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Species"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6775268/pexels-photo-6775268.jpeg",
        "photo_description": "Hydrocotyle aquatic pennywort floating on water",
        "species_name": "Hydrocotyle spp",
        "common_name": "Hydrocotyle",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Aquatic Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6775268/pexels-photo-6775268.jpeg",
        "photo_description": "Lechuga de agua (Water Lettuce) floating in wetland",
        "species_name": "Pistia spp",
        "common_name": "Lechuga de agua",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Aquatic Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg",
        "photo_description": "Mangle blanco (White Mangrove) with distinctive bark",
        "species_name": "Laguncularia racemosa",
        "common_name": "Mangle blanco",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Keystone Species"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg",
        "photo_description": "Mangle rojo (Red Mangrove) with intricate root system",
        "species_name": "Rhizophora mangle",
        "common_name": "Mangle rojo",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Keystone Species"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6894276/pexels-photo-6894276.jpeg",
        "photo_description": "Matumba (Yolillo Palm) in peat swamp forest",
        "species_name": "Raphia taedigera",
        "common_name": "Matumba",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Species"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg",
        "photo_description": "Membrillo tree with large distinctive fruits",
        "species_name": "Gustavia superba",
        "common_name": "Membrillo",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Species"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg",
        "photo_description": "Negra jorra fern in coastal wetlands, salt-tolerant",
        "species_name": "Acrostichum aureum",
        "common_name": "Negra jorra",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2252618/pexels-photo-2252618.jpeg",
        "photo_description": "Nymphoides aquatic floating heart plant",
        "species_name": "Nymphoides spp",
        "common_name": "Nymphoides",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Aquatic Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg",
        "photo_description": "Orey tree in swamp forest habitat",
        "species_name": "Campnosperma panamensis",
        "common_name": "Orey",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Species"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6775268/pexels-photo-6775268.jpeg",
        "photo_description": "Otoe lagarto (Dieffenbachia) in wetland understory",
        "species_name": "Dieffenbachia longispatha",
        "common_name": "Otoe lagarto",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg",
        "photo_description": "Rauwolfia shrub with medicinal properties",
        "species_name": "Rauwolfia sp.",
        "common_name": "Rauwolfia",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg",
        "photo_description": "Sangrillo tree in wetland forest",
        "species_name": "Pterocarpus officinalis",
        "common_name": "Sangrillo",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Species"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6775268/pexels-photo-6775268.jpeg",
        "photo_description": "Spathiphyllum peace lily in shaded wetland areas",
        "species_name": "Spathiphyllum sp.",
        "common_name": "Spathiphyllum",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Plant"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6894276/pexels-photo-6894276.jpeg",
        "photo_description": "Tillandsia usneoides (Spanish Moss) hanging from trees",
        "species_name": "Tillandsia usneoides",
        "common_name": "Tillandsia usneoides",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Epiphyte"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/6775268/pexels-photo-6775268.jpeg",
        "photo_description": "Urospatha aquatic aroid in shaded wetland areas",
        "species_name": "Urospatha friedrischtallii",
        "common_name": "Urospatha",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Native Aquatic Plant"
    },

    # REPTILES (7 species)
    {
        "photo_image_url": "https://images.pexels.com/photos/2317904/pexels-photo-2317904.jpeg",
        "photo_description": "Babillo (Spectacled Caiman) in wetland waters",
        "species_name": "Caiman crocodilus",
        "common_name": "Babillo",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3493777/pexels-photo-3493777.jpeg",
        "photo_description": "Boa constrictor in tropical forest habitat",
        "species_name": "Boa constrictor",
        "common_name": "Boa",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3493777/pexels-photo-3493777.jpeg",
        "photo_description": "Iguana verde (Green Iguana) basking in tropical sun",
        "species_name": "Iguana iguana",
        "common_name": "Iguana verde",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Least Concern"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2317904/pexels-photo-2317904.jpeg",
        "photo_description": "Lagarto aguja (American Crocodile) in coastal waters",
        "species_name": "Crocodylus acutus",
        "common_name": "Lagarto aguja",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Endangered"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/2611811/pexels-photo-2611811.jpeg",
        "photo_description": "Tortuga baula (Leatherback Sea Turtle), largest living turtle",
        "species_name": "Dermochelys coriacea",
        "common_name": "Tortuga baula",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Critically Endangered"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/4666751/pexels-photo-4666751.jpeg",
        "photo_description": "Tortuga carey (Hawksbill Sea Turtle) on nesting beach",
        "species_name": "Eretmochelys imbricata",
        "common_name": "Tortuga carey",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Critically Endangered"
    },
    {
        "photo_image_url": "https://images.pexels.com/photos/3894157/pexels-photo-3894157.jpeg",
        "photo_description": "Tortuga verde (Green Sea Turtle) swimming through Caribbean waters",
        "species_name": "Chelonia mydas",
        "common_name": "Tortuga verde",
        "location": "San San Pond Sak Wetlands",
        "conservation_status": "Endangered"
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

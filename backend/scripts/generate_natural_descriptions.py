import os
import asyncio
import time
from dotenv import load_dotenv
from supabase import create_client, Client
import google.generativeai as genai

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def generate_description(common_name: str, english_name: str, species_name: str) -> str:
    """Generate a natural language description for a species using Gemini"""

    name_to_use = english_name if english_name else common_name

    prompt = f"""Generate a natural, conversational description (15-30 words) for this animal/plant species that someone might use when searching:

Species: {name_to_use} ({species_name})

The description should include:
- Physical appearance (size, color, texture, distinctive features)
- What it looks like or resembles in everyday language
- Memorable analogies or comparisons
- Be conversational and searchable

Examples:
- "large gray aquatic mammal with paddle-like tail, looks like a chubby mermaid or sea cow, gentle and slow-moving"
- "slow-moving furry mammal that hangs upside down in trees, long claws and perpetual smile"
- "colorful tropical bird with enormous rainbow-colored beak, black body with bright yellow throat"

Only return the description, nothing else."""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error generating description for {name_to_use}: {e}")
        return ""


def main():
    print("Fetching species from Supabase...")

    response = supabase.table("wildlife_images").select("id, common_name, english_name, species_name, natural_description").execute()

    if not response.data:
        print("No species found in database")
        return

    species_map = {}
    for row in response.data:
        species_name = row['species_name']
        if species_name not in species_map:
            species_map[species_name] = {
                'common_name': row['common_name'],
                'english_name': row['english_name'],
                'species_name': row['species_name'],
                'ids': [row['id']],
                'has_description': bool(row.get('natural_description'))
            }
        else:
            species_map[species_name]['ids'].append(row['id'])

    total_species = len(species_map)
    print(f"\nFound {total_species} unique species")

    species_without_desc = [s for s in species_map.values() if not s['has_description']]
    print(f"Species without descriptions: {len(species_without_desc)}")

    if not species_without_desc:
        print("All species already have descriptions!")
        return

    print("\nGenerating descriptions...\n")

    for i, species_data in enumerate(species_without_desc, 1):
        common_name = species_data['common_name']
        english_name = species_data['english_name']
        species_name = species_data['species_name']
        ids = species_data['ids']

        display_name = english_name if english_name else common_name
        print(f"[{i}/{len(species_without_desc)}] Processing: {display_name} ({species_name})")

        description = generate_description(common_name, english_name, species_name)

        if description:
            print(f"  Description: {description}")

            try:
                for species_id in ids:
                    supabase.table("wildlife_images").update({
                        "natural_description": description
                    }).eq("id", species_id).execute()

                print(f"  ✓ Updated {len(ids)} record(s)")
            except Exception as e:
                print(f"  ✗ Error updating database: {e}")
        else:
            print(f"  ✗ Failed to generate description")

        time.sleep(1)
        print()

    print("✓ All descriptions generated and saved!")


if __name__ == "__main__":
    main()

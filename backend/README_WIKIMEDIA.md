# Wikimedia Commons Integration

## Overview

The wildlife image system now uses **Wikimedia Commons** to fetch real species-specific photos instead of generic stock photos.

## Scripts

### 1. `fetch_wikimedia_images.py`
Updates the **Supabase** `wildlife_images` table with images from Wikimedia Commons.

**Usage:**
```bash
cd backend
python -m scripts.fetch_wikimedia_images
```

**What it does:**
- Fetches all species from `wildlife_species` table
- Searches Wikimedia Commons for each species by scientific name
- Updates `wildlife_images` table with actual species photos
- Provides summary of success/failures

### 2. `populate_wildlife_images.py`
Populates **Elasticsearch** `wildlife-images` index with Wikimedia images.

**Usage:**
```bash
cd backend
python -m scripts.populate_wildlife_images
```

**What it does:**
- Fetches species from Supabase
- Searches Wikimedia Commons for real species photos
- Falls back to Pexels stock photos if Wikimedia fails
- Indexes images into Elasticsearch for search

## How Wikimedia Search Works

The scripts use the **MediaWiki API** with two search strategies:

1. **Category Search**: Looks for images in `Category:{Scientific_Name}`
   - Most accurate for well-documented species
   - Example: `Category:Panthera onca` for Jaguar

2. **File Search**: Searches for files matching the scientific name
   - Backup method if category doesn't exist
   - Example: `File:Panthera onca`

## Image Quality

Wikimedia Commons provides:
- Real wildlife photos (not stock photos)
- Species-specific images
- High-quality, properly licensed images
- 800px width thumbnails (configurable)

## Troubleshooting

### No images found for some species

Some species may not have photos on Wikimedia Commons, especially:
- Endemic or rare species
- Species with limited documentation
- Species with complex/incorrect scientific names

**Solution**: The scripts will fall back to Pexels stock photos or report the missing image.

### Rate limiting

The scripts include a 0.5 second delay between requests to be respectful to Wikimedia's API.

### API timeout

Default timeout is 30 seconds. Increase if needed in the script configuration.

## Cleaning Up Duplicates

To remove duplicate images from Supabase:

```sql
DELETE FROM wildlife_images
WHERE id NOT IN (
  SELECT DISTINCT ON (species_name, common_name) id
  FROM wildlife_images
  ORDER BY species_name, common_name, created_at
);
```

## Next Steps

To improve image quality:
1. Run the Wikimedia fetch scripts periodically to update images
2. Consider integrating with iNaturalist API for observation photos
3. Allow manual image uploads for rare/endemic species
4. Add image verification and quality checks

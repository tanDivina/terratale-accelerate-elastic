/*
  # Create Wildlife Images Table

  ## Overview
  Creates a table to store wildlife images/photos that are currently in Elasticsearch.
  This provides a backup and allows post-hackathon migration from Elastic to Supabase.

  ## New Tables
  
  ### `wildlife_images`
  Stores wildlife photo information with URLs and descriptions
  - `id` (uuid, primary key)
  - `photo_image_url` (text) - URL to the wildlife photo
  - `photo_description` (text) - Detailed description of the photo
  - `species_name` (text) - Scientific name
  - `common_name` (text) - Common name in Spanish/English
  - `location` (text) - Location where photo was taken
  - `conservation_status` (text) - Conservation status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on `wildlife_images` table
  - Add policy for public read access (educational/informational purpose)
  - Add policy for authenticated insert/update/delete (for data management)
*/

CREATE TABLE IF NOT EXISTS wildlife_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_image_url text NOT NULL,
  photo_description text NOT NULL,
  species_name text,
  common_name text NOT NULL,
  location text,
  conservation_status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for common searches
CREATE INDEX IF NOT EXISTS idx_wildlife_images_common_name ON wildlife_images(common_name);
CREATE INDEX IF NOT EXISTS idx_wildlife_images_species_name ON wildlife_images(species_name);
CREATE INDEX IF NOT EXISTS idx_wildlife_images_location ON wildlife_images(location);

-- Enable RLS
ALTER TABLE wildlife_images ENABLE ROW LEVEL SECURITY;

-- Allow public read access for educational purposes
CREATE POLICY "Public can view wildlife images"
  ON wildlife_images
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to insert images
CREATE POLICY "Authenticated users can insert images"
  ON wildlife_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update images
CREATE POLICY "Authenticated users can update images"
  ON wildlife_images
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete images"
  ON wildlife_images
  FOR DELETE
  TO authenticated
  USING (true);
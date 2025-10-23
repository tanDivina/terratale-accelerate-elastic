/*
  # Create Wildlife Species Database Schema

  ## Overview
  Creates tables to store wildlife species information from the San San Pond Sak Wetland in Panama.
  
  ## New Tables
  
  ### `wildlife_species`
  Main table storing all species information
  - `id` (uuid, primary key)
  - `common_name` (text) - Common name in Spanish
  - `scientific_name` (text) - Latin scientific name
  - `category` (text) - Main category (mammal, bird, reptile, amphibian, plant, aquatic)
  - `family` (text) - Taxonomic family
  - `order` (text) - Taxonomic order
  - `conservation_status` (text) - Conservation status (endangered, threatened, vulnerable, etc.)
  - `protected_by_law` (boolean) - Protected by Panamanian law
  - `cites_appendix` (text) - CITES appendix (1, 2, 3, or null)
  - `endemic_type` (text) - Endemic classification (national, regional, null)
  - `habitat` (text) - Primary habitat description
  - `diet` (text) - Dietary information
  - `behavior` (text) - Behavioral notes
  - `notes` (text) - Additional information
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on `wildlife_species` table
  - Add policy for public read access (educational/informational purpose)
  - Add policy for authenticated insert/update (for data management)
*/

CREATE TABLE IF NOT EXISTS wildlife_species (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  common_name text NOT NULL,
  scientific_name text,
  category text NOT NULL CHECK (category IN ('mammal', 'bird', 'reptile', 'amphibian', 'plant', 'aquatic', 'other')),
  family text,
  "order" text,
  conservation_status text,
  protected_by_law boolean DEFAULT false,
  cites_appendix text CHECK (cites_appendix IN ('1', '2', '3')),
  endemic_type text CHECK (endemic_type IN ('national', 'regional')),
  habitat text,
  diet text,
  behavior text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for common searches
CREATE INDEX IF NOT EXISTS idx_wildlife_category ON wildlife_species(category);
CREATE INDEX IF NOT EXISTS idx_wildlife_scientific_name ON wildlife_species(scientific_name);
CREATE INDEX IF NOT EXISTS idx_wildlife_common_name ON wildlife_species(common_name);

-- Enable RLS
ALTER TABLE wildlife_species ENABLE ROW LEVEL SECURITY;

-- Allow public read access for educational purposes
CREATE POLICY "Public can view wildlife species"
  ON wildlife_species
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to insert species data
CREATE POLICY "Authenticated users can insert species"
  ON wildlife_species
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update species data
CREATE POLICY "Authenticated users can update species"
  ON wildlife_species
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete species data
CREATE POLICY "Authenticated users can delete species"
  ON wildlife_species
  FOR DELETE
  TO authenticated
  USING (true);
/*
  # Add natural language descriptions to wildlife images

  1. Changes
    - Add `natural_description` column to wildlife_images table for semantic search
    - This field will contain descriptive text like "large gray aquatic mammal that looks like a fat mermaid"
  
  2. Purpose
    - Enable natural language search for animals based on descriptions
    - Improve user experience by allowing conversational queries
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wildlife_images' AND column_name = 'natural_description'
  ) THEN
    ALTER TABLE wildlife_images ADD COLUMN natural_description text;
  END IF;
END $$;

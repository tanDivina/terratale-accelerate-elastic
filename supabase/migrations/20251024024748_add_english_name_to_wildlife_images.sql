/*
  # Add English Name Field to Wildlife Images

  ## Changes
  1. Add `english_name` column to wildlife_images table to store English translations
  2. This allows both Spanish and English names to be searchable
  3. Add index for efficient searching on english_name

  ## Migration Details
  - New Column: `english_name` (text, nullable)
  - New Index: `idx_wildlife_images_english_name` on english_name column
*/

-- Add english_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wildlife_images' AND column_name = 'english_name'
  ) THEN
    ALTER TABLE wildlife_images ADD COLUMN english_name text;
  END IF;
END $$;

-- Create index for english_name
CREATE INDEX IF NOT EXISTS idx_wildlife_images_english_name ON wildlife_images(english_name);
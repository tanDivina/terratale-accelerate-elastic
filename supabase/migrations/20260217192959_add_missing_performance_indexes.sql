/*
  # Add missing performance indexes

  ## Summary
  Adds indexes that were missing for frequently queried columns, improving
  query performance for the most common access patterns.

  ## New Indexes

  ### conversations table
  - `idx_conversations_updated_at` - speeds up the default sort order when
    loading conversation history (ORDER BY updated_at DESC)

  ### wildlife_images table
  - `idx_wildlife_images_conservation_status` - speeds up filtering by
    conservation status in gallery and search features
  - `idx_wildlife_images_english_name` - speeds up lookups by English name

  ## Notes
  - All indexes use IF NOT EXISTS to safely re-run without error
  - These are non-destructive additions only
*/

CREATE INDEX IF NOT EXISTS idx_conversations_updated_at
  ON conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_wildlife_images_conservation_status
  ON wildlife_images(conservation_status);

CREATE INDEX IF NOT EXISTS idx_wildlife_images_english_name
  ON wildlife_images(english_name);

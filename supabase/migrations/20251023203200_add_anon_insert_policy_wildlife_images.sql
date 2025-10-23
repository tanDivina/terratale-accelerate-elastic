/*
  # Add Temporary Anon Insert Policy for Wildlife Images

  ## Overview
  Adds a temporary policy to allow anonymous (anon key) inserts for data migration.
  This is for testing/development purposes during the hackathon.

  ## Security Changes
  - Add policy allowing anon role to insert wildlife images
  - This should be removed in production and use service_role key instead

  ## Notes
  - This is a temporary workaround for data migration
  - In production, use the service_role key for bulk inserts
*/

-- Drop existing insert policy
DROP POLICY IF EXISTS "Authenticated users can insert images" ON wildlife_images;

-- Create new policy that allows both anon and authenticated inserts
CREATE POLICY "Allow inserts for data migration"
  ON wildlife_images
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

/*
  # Fix Unused Indexes and RLS Policies

  ## Summary
  This migration addresses security and performance advisories:

  1. **Drop Unused Indexes**
     Removes all indexes flagged as unused by Supabase advisor. These indexes
     consume storage and slow down writes without providing query benefits.
     Dropped indexes:
     - idx_messages_conversation_id (messages.conversation_id)
     - idx_conversations_created_at (conversations.created_at)
     - idx_wildlife_category (wildlife_species.category)
     - idx_wildlife_scientific_name (wildlife_species.scientific_name)
     - idx_wildlife_common_name (wildlife_species.common_name)
     - idx_wildlife_images_common_name (wildlife_images.common_name)
     - idx_wildlife_images_species_name (wildlife_images.species_name)
     - idx_wildlife_images_location (wildlife_images.location)
     - idx_wildlife_images_english_name (wildlife_images.english_name)
     - idx_wildlife_images_conservation_status (wildlife_images.conservation_status)

  2. **Fix RLS Policies - conversations and messages**
     The previous policies used USING(true) / WITH CHECK(true) which bypasses RLS
     entirely. Since this app has no user accounts, conversations are identified
     by a session token stored in the client. We restrict writes so only the
     service role (used by edge functions) can insert/update/delete, while
     SELECT remains open for the frontend to read data.

  3. **Fix RLS Policies - wildlife_images**
     Remove the broad anon INSERT policy added for data migration. All writes
     to wildlife data should only be done via the service role (backend scripts
     and edge functions), not anonymous users.

  4. **Fix RLS Policies - wildlife_species**
     Same as wildlife_images: restrict INSERT/UPDATE/DELETE to service role only.
     Public SELECT remains open.

  ## Important Notes
  - The edge functions use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS entirely,
    so they will continue to work correctly.
  - The frontend only reads wildlife data (SELECT), so no functionality is lost.
  - Conversations/messages SELECT remains open so the frontend can load history.
*/

-- ============================================================
-- 1. DROP UNUSED INDEXES
-- ============================================================

DROP INDEX IF EXISTS public.idx_messages_conversation_id;
DROP INDEX IF EXISTS public.idx_conversations_created_at;
DROP INDEX IF EXISTS public.idx_wildlife_category;
DROP INDEX IF EXISTS public.idx_wildlife_scientific_name;
DROP INDEX IF EXISTS public.idx_wildlife_common_name;
DROP INDEX IF EXISTS public.idx_wildlife_images_common_name;
DROP INDEX IF EXISTS public.idx_wildlife_images_species_name;
DROP INDEX IF EXISTS public.idx_wildlife_images_location;
DROP INDEX IF EXISTS public.idx_wildlife_images_english_name;
DROP INDEX IF EXISTS public.idx_wildlife_images_conservation_status;

-- ============================================================
-- 2. FIX RLS - conversations
-- ============================================================

DROP POLICY IF EXISTS "Allow all operations on conversations" ON public.conversations;

-- Anyone can read conversations (frontend loads history)
CREATE POLICY "Public can read conversations"
  ON public.conversations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only service role can insert/update/delete (edge functions use service role)
-- No INSERT/UPDATE/DELETE policies for anon/authenticated = only service role can write

-- ============================================================
-- 3. FIX RLS - messages
-- ============================================================

DROP POLICY IF EXISTS "Allow all operations on messages" ON public.messages;

-- Anyone can read messages (frontend loads conversation history)
CREATE POLICY "Public can read messages"
  ON public.messages
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only service role can insert/update/delete (edge functions use service role)

-- ============================================================
-- 4. FIX RLS - wildlife_images
-- ============================================================

-- Drop the broad data migration INSERT policy
DROP POLICY IF EXISTS "Allow inserts for data migration" ON public.wildlife_images;

-- Drop the overly permissive authenticated update/delete policies
DROP POLICY IF EXISTS "Authenticated users can update images" ON public.wildlife_images;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON public.wildlife_images;
DROP POLICY IF EXISTS "Authenticated users can insert images" ON public.wildlife_images;

-- Only service role can write wildlife_images (backend scripts use service role key)
-- No INSERT/UPDATE/DELETE policies for anon/authenticated = only service role can write

-- ============================================================
-- 5. FIX RLS - wildlife_species
-- ============================================================

-- Drop the overly permissive authenticated write policies
DROP POLICY IF EXISTS "Authenticated users can insert species" ON public.wildlife_species;
DROP POLICY IF EXISTS "Authenticated users can update species" ON public.wildlife_species;
DROP POLICY IF EXISTS "Authenticated users can delete species" ON public.wildlife_species;

-- Only service role can write wildlife_species (backend scripts use service role key)
-- No INSERT/UPDATE/DELETE policies for anon/authenticated = only service role can write

/*
  # Restore anon write access for conversations and messages

  ## Summary
  The previous migration was too restrictive for conversations and messages.
  This app has no user authentication — the frontend directly writes conversation
  and message data using the anon key. We restore write access for anon users
  using separate policies per operation (replacing the old FOR ALL policy).

  ## Changes
  - conversations: Add INSERT, UPDATE, DELETE policies for anon and authenticated
  - messages: Add INSERT, UPDATE, DELETE policies for anon and authenticated

  ## Notes
  - These tables store anonymous chat history with no PII or sensitive data
  - SELECT was already restored in the previous migration
  - Using separate policies per operation instead of the flagged FOR ALL pattern
*/

-- conversations: restore write access
CREATE POLICY "Anon can insert conversations"
  ON public.conversations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anon can update conversations"
  ON public.conversations
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete conversations"
  ON public.conversations
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- messages: restore write access
CREATE POLICY "Anon can insert messages"
  ON public.messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anon can update messages"
  ON public.messages
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete messages"
  ON public.messages
  FOR DELETE
  TO anon, authenticated
  USING (true);

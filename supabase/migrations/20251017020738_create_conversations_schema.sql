/*
  # Create Conversation History Schema

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key) - Unique identifier for each conversation
      - `created_at` (timestamptz) - When the conversation was started
      - `updated_at` (timestamptz) - When the conversation was last updated
      - `title` (text) - Auto-generated title from first message

    - `messages`
      - `id` (uuid, primary key) - Unique identifier for each message
      - `conversation_id` (uuid, foreign key) - Links to conversations table
      - `type` (text) - Message type: 'user', 'assistant', or 'images'
      - `content` (text) - The message text content
      - `audio_url` (text, nullable) - URL to audio file if available
      - `images` (jsonb, nullable) - JSON array of image search results
      - `created_at` (timestamptz) - When the message was sent

  2. Security
    - No RLS policies needed - conversations are stored locally per browser
    - Tables are publicly accessible for this demo application
    - In production, would add user authentication and RLS policies

  3. Indexes
    - Index on conversation_id for efficient message queries
    - Index on created_at for sorting conversations
*/

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  title text NOT NULL DEFAULT 'New Conversation'
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('user', 'assistant', 'images')),
  content text NOT NULL,
  audio_url text,
  images jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on conversations"
  ON conversations
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on messages"
  ON messages
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

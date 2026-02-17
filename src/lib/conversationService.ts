import { supabase, Message, Conversation } from './supabase';
import type { WildlifeImage } from '../types/wildlife';

export async function createConversation(firstMessage: string): Promise<string> {
  const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');

  const { data, error } = await supabase
    .from('conversations')
    .insert({ title })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function saveMessage(
  conversationId: string,
  type: 'user' | 'assistant' | 'images',
  content: string,
  audioUrl?: string,
  images?: WildlifeImage[]
): Promise<void> {
  const { error: messageError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      type,
      content,
      audio_url: audioUrl,
      images
    });

  if (messageError) throw messageError;

  const { error: updateError } = await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  if (updateError) throw updateError;
}

export async function loadConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
}

export async function loadMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (error) throw error;
}

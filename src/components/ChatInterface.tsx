import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Volume2, VolumeX, History, Plus, X } from 'lucide-react';
import ImageLightbox from './ImageLightbox';
import { createConversation, saveMessage, loadConversations, loadMessages, deleteConversation } from '../lib/conversationService';
import type { Conversation } from '../lib/supabase';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'images';
  content: string;
  images?: ImageResult[];
  audioUrl?: string;
}

interface ImageResult {
  _id: string;
  _score: number;
  fields: {
    photo_image_url: string[];
    photo_description: string[];
  };
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Welcome to San San Pond Sak Wetlands! Ask me anything about the wildlife, ecosystem, or share a description of an animal you\'ve seen.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<Array<{url: string, description: string}>>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentMessageIdRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    connectWebSocket();
    fetchConversations();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const fetchConversations = async () => {
    try {
      const data = await loadConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const connectWebSocket = () => {
    const wsUrl = import.meta.env.VITE_BACKEND_WS_URL || 'ws://localhost:8000/ws';

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        if (event.data instanceof Blob) {
          audioChunksRef.current.push(event.data);
          return;
        }

        const data = JSON.parse(event.data);

        if (data.type === 'text') {
          const messageId = Date.now().toString();
          currentMessageIdRef.current = messageId;
          audioChunksRef.current = [];

          setMessages(prev => [...prev, {
            id: messageId,
            type: 'assistant',
            content: data.content
          }]);
          setIsLoading(false);

          if (currentConversationId) {
            saveMessage(currentConversationId, 'assistant', data.content).catch(console.error);
          }
        } else if (data.type === 'audio_end') {
          if (audioChunksRef.current.length > 0 && currentMessageIdRef.current) {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);

            setMessages(prev => prev.map(msg =>
              msg.id === currentMessageIdRef.current
                ? { ...msg, audioUrl }
                : msg
            ));

            audioChunksRef.current = [];
          }
        } else if (data.type === 'image_search_results') {
          const newMessage = {
            id: Date.now().toString(),
            type: 'images' as const,
            content: 'Here are the images I found:',
            images: data.content
          };
          setMessages(prev => [...prev, newMessage]);
          setIsLoading(false);

          if (currentConversationId) {
            saveMessage(currentConversationId, 'images', newMessage.content, undefined, data.content).catch(console.error);
          }
        } else if (data.type === 'error') {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'assistant',
            content: `Error: ${data.content}`
          }]);
          setIsLoading(false);
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
        setIsLoading(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsLoading(false);
      };

      wsRef.current = ws;
    } catch (error) {
      setIsConnected(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (!currentConversationId) {
        const newConvId = await createConversation(input);
        setCurrentConversationId(newConvId);
        await saveMessage(newConvId, 'user', input);
        await fetchConversations();
      } else {
        await saveMessage(currentConversationId, 'user', input);
      }
    } catch (error) {
      console.error('Failed to save message:', error);
    }

    wsRef.current.send(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleAudio = (messageId: string, audioUrl: string) => {
    if (playingAudioId === messageId) {
      audioRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audio.onended = () => setPlayingAudioId(null);
      audio.play();
      audioRef.current = audio;
      setPlayingAudioId(messageId);
    }
  };

  const startNewConversation = () => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: 'Welcome to San San Pond Sak Wetlands! Ask me anything about the wildlife, ecosystem, or share a description of an animal you\'ve seen.'
      }
    ]);
    setCurrentConversationId(null);
    setShowHistory(false);
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const msgs = await loadMessages(conversationId);
      const formattedMessages: Message[] = msgs.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        audioUrl: msg.audio_url,
        images: msg.images
      }));
      setMessages(formattedMessages);
      setCurrentConversationId(conversationId);
      setShowHistory(false);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      await fetchConversations();
      if (currentConversationId === conversationId) {
        startNewConversation();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const openLightbox = (images: ImageResult[], index: number) => {
    const formattedImages = images.map(img => ({
      url: img.fields.photo_image_url[0],
      description: img.fields.photo_description[0]
    }));
    setLightboxImages(formattedImages);
    setLightboxIndex(index);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <section id="explore" className="bg-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-4xl md:text-5xl text-stone-900">
              <span className="italic">Ask</span> Terratale
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 rounded-full hover:bg-stone-100 transition-colors"
                title="View conversation history"
              >
                <History className="w-5 h-5 text-stone-600" />
              </button>
              <button
                onClick={startNewConversation}
                className="p-2 rounded-full hover:bg-stone-100 transition-colors"
                title="Start new conversation"
              >
                <Plus className="w-5 h-5 text-stone-600" />
              </button>
            </div>
          </div>
          <p className="text-stone-600">
            Your AI guide to the San San Pond Sak Wetlands
          </p>
          {!isConnected && (
            <div className="mt-4 text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-lg inline-block">
              Connecting to backend...
            </div>
          )}
        </div>

        {showHistory && (
          <div className="mb-6 bg-stone-100 rounded-2xl p-6 max-h-64 overflow-y-auto">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Recent Conversations</h3>
            {conversations.length === 0 ? (
              <p className="text-stone-600 text-sm">No conversations yet</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between bg-white p-3 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => loadConversation(conv.id)}
                      className="flex-1 text-left"
                    >
                      <p className="text-stone-900 font-medium truncate">{conv.title}</p>
                      <p className="text-xs text-stone-500">
                        {new Date(conv.updated_at).toLocaleDateString()}
                      </p>
                    </button>
                    <button
                      onClick={() => handleDeleteConversation(conv.id)}
                      className="ml-2 text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-stone-50 rounded-2xl shadow-lg overflow-hidden">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    message.type === 'user'
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-900 shadow-sm'
                  }`}
                >
                  {message.type === 'images' && message.images ? (
                    <div>
                      <p className="mb-4">{message.content}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {message.images.map((img, index) => (
                          <div key={img._id} className="space-y-2">
                            <img
                              src={img.fields.photo_image_url[0]}
                              alt={img.fields.photo_description[0]}
                              className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => openLightbox(message.images!, index)}
                            />
                            <p className="text-xs text-stone-600">
                              {img.fields.photo_description[0]}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      {message.audioUrl && message.type === 'assistant' && (
                        <button
                          onClick={() => toggleAudio(message.id, message.audioUrl!)}
                          className="mt-3 flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors"
                        >
                          {playingAudioId === message.id ? (
                            <>
                              <VolumeX className="w-4 h-4" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-4 h-4" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-5 py-3 shadow-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-stone-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-stone-200 p-4 bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about wildlife or describe what you saw..."
                className="flex-1 px-5 py-3 border border-stone-300 rounded-full focus:outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all"
                disabled={!isConnected}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !isConnected || isLoading}
                className="bg-stone-900 text-white px-6 py-3 rounded-full hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {lightboxImages.length > 0 && (
          <ImageLightbox
            images={lightboxImages}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxImages([])}
            onNavigate={setLightboxIndex}
          />
        )}
      </div>
    </section>
  );
}

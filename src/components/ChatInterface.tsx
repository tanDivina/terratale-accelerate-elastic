import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, History, Plus, X, Mic, MicOff, Shield } from 'lucide-react';
import ImageLightbox from './ImageLightbox';
import { createConversation, saveMessage, loadConversations, loadMessages, deleteConversation } from '../lib/conversationService';
import type { Conversation } from '../lib/supabase';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'images';
  content: string;
  images?: ImageResult[];
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
  const [isRecording, setIsRecording] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<Array<{url: string, description: string}>>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setIsConnected(true);
    fetchConversations();
    initializeSpeechRecognition();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  };

  const fetchConversations = async () => {
    try {
      const data = await loadConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const sendChatMessage = async (message: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const functionUrl = `${supabaseUrl}/functions/v1/terratale-chat`;

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          message,
          conversationId: currentConversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.type === 'text') {
        const messageId = Date.now().toString();
        setMessages(prev => [...prev, {
          id: messageId,
          type: 'assistant',
          content: data.content
        }]);

        if (currentConversationId) {
          await saveMessage(currentConversationId, 'assistant', data.content);
        }
      } else if (data.type === 'image_search_results') {
        const newMessage = {
          id: Date.now().toString(),
          type: 'images' as const,
          content: 'Here are the images I found:',
          images: data.content
        };
        setMessages(prev => [...prev, newMessage]);

        if (currentConversationId) {
          await saveMessage(currentConversationId, 'images', newMessage.content, undefined, data.content);
        }
      } else if (data.type === 'error') {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'assistant',
          content: `Error: ${data.content}`
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !isConnected) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input
    };

    const messageToSend = input;
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      if (!currentConversationId) {
        const newConvId = await createConversation(messageToSend);
        setCurrentConversationId(newConvId);
        await saveMessage(newConvId, 'user', messageToSend);
        await fetchConversations();
      } else {
        await saveMessage(currentConversationId, 'user', messageToSend);
      }
    } catch (error) {
      console.error('Failed to save message:', error);
    }

    await sendChatMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
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


  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="View conversation history"
          >
            <History className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={startNewConversation}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Start new conversation"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {!isConnected && (
          <div className="text-sm text-amber-700 bg-amber-50 px-3 py-1 rounded-lg">
            Initializing...
          </div>
        )}
      </div>

      {showHistory && (
        <div className="p-4 bg-gray-50 border-b border-gray-200 max-h-64 overflow-y-auto">
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

      <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-emerald-700" />
          <span className="text-sm font-medium text-emerald-900">Conservation Status</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Critically Endangered', value: 'critically endangered', color: 'bg-red-700 hover:bg-red-800' },
            { label: 'Endangered', value: 'endangered', color: 'bg-orange-600 hover:bg-orange-700' },
            { label: 'Vulnerable', value: 'vulnerable', color: 'bg-amber-600 hover:bg-amber-700' },
            { label: 'Near Threatened', value: 'Near Threatened', color: 'bg-teal-600 hover:bg-teal-700' },
            { label: 'Threatened', value: 'threatened', color: 'bg-emerald-700 hover:bg-emerald-800' },
            { label: 'Declining', value: 'declining', color: 'bg-stone-600 hover:bg-stone-700' }
          ].map((status) => (
            <button
              key={status.value}
              onClick={() => setInput(`show me ${status.value} species`)}
              className={`${status.color} text-white text-xs px-3 py-1.5 rounded-full transition-all transform hover:scale-105 shadow-sm`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-5 py-3 shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex gap-3">
              <button
                onClick={toggleRecording}
                disabled={!isConnected || isLoading}
                className={`px-4 py-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  isRecording
                    ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
                title={isRecording ? 'Stop recording' : 'Start voice input'}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about wildlife or describe what you saw..."
                className="flex-1 px-5 py-3 border border-stone-300 rounded-full focus:outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all"
                disabled={!isConnected || isRecording}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !isConnected || isLoading || isRecording}
                className="bg-stone-900 text-white px-6 py-3 rounded-full hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
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
  );
}

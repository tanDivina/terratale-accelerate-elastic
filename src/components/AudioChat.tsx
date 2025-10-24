import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function AudioChat() {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      disconnectAudio();
    };
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const connectAudio = async () => {
    try {
      setError(null);

      const wsUrl = SUPABASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
      const ws = new WebSocket(`${wsUrl}/functions/v1/terratale-audio-live`);

      ws.onopen = () => {
        console.log('Connected to Live API');
        setIsConnected(true);
        startRecording();
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.setupComplete) {
            console.log('Setup complete');
          } else if (data.serverContent) {
            if (data.serverContent.modelTurn) {
              const parts = data.serverContent.modelTurn.parts || [];

              for (const part of parts) {
                if (part.text) {
                  setTranscript(prev => [...prev, `AI: ${part.text}`]);
                }

                if (part.inlineData && part.inlineData.mimeType === 'audio/pcm') {
                  await playAudioData(part.inlineData.data);
                }
              }
            }

            if (data.serverContent.turnComplete) {
              console.log('Turn complete');
            }
          }
        } catch (err) {
          console.error('Error processing message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Connection error. Please try again.');
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('Disconnected from Live API');
        setIsConnected(false);
        setIsRecording(false);
      };

      wsRef.current = ws;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      }

    } catch (err) {
      console.error('Connection error:', err);
      setError('Failed to connect. Please check your configuration.');
      setIsConnected(false);
    }
  };

  const disconnectAudio = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsRecording(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          const arrayBuffer = await event.data.arrayBuffer();
          const base64Audio = btoa(
            new Uint8Array(arrayBuffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          );

          const message = {
            realtimeInput: {
              mediaChunks: [{
                mimeType: 'audio/webm;codecs=opus',
                data: base64Audio
              }]
            }
          };

          wsRef.current.send(JSON.stringify(message));
        }
      };

      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Microphone access denied. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const playAudioData = async (base64Data: string) => {
    try {
      if (!audioContextRef.current) return;

      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = audioContextRef.current.createBuffer(
        1,
        float32Array.length,
        16000
      );
      audioBuffer.getChannelData(0).set(float32Array);

      if (!isMuted) {
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.start();
      }

    } catch (err) {
      console.error('Error playing audio:', err);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex justify-center py-8">
        <img
          src="/ezgif.com-animated-gif-maker.gif"
          alt="Manatee Animation"
          className="w-[280px] h-[280px]"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-2">
            Live Voice Conversation
          </h3>
          <p className="text-white/80 text-sm">
            Have a natural conversation with TerraTale AI about the San San Pond Sak Wetlands.
            Click the microphone to start.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-4 border border-red-500/50">
            <p className="text-white">{error}</p>
          </div>
        )}

        {transcript.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 space-y-2">
            <h4 className="text-white font-medium mb-2">Conversation:</h4>
            {transcript.map((text, idx) => (
              <p key={idx} className="text-white/90 text-sm">{text}</p>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-white/20 bg-white/5 backdrop-blur-md p-6">
        <div className="flex items-center justify-center gap-4">
          {!isConnected ? (
            <button
              onClick={connectAudio}
              className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium transition-colors shadow-lg"
            >
              <Mic className="w-5 h-5" />
              Start Voice Chat
            </button>
          ) : (
            <>
              <button
                onClick={disconnectAudio}
                className={`flex items-center gap-2 px-8 py-4 rounded-full font-medium transition-all shadow-lg ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                    : 'bg-gray-600 hover:bg-gray-700'
                } text-white`}
              >
                <MicOff className="w-5 h-5" />
                {isRecording ? 'End Call' : 'Disconnected'}
              </button>

              <button
                onClick={toggleMute}
                className={`p-4 rounded-full font-medium transition-colors shadow-lg ${
                  isMuted
                    ? 'bg-gray-600 hover:bg-gray-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                } text-white`}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>

        {isConnected && (
          <p className="text-center text-white/60 text-sm mt-4">
            {isRecording ? 'Listening... Speak naturally' : 'Connecting...'}
          </p>
        )}
      </div>
    </div>
  );
}

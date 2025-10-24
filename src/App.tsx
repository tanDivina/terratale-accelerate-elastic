 import { useState } from 'react';
import { MessageSquare, Mic } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import ChatInterface from './components/ChatInterface';
import AudioChat from './components/AudioChat';
import WildlifeGallery from './components/WildlifeGallery';
import AboutSection from './components/AboutSection';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

function App() {
  const [chatMode, setChatMode] = useState<'text' | 'audio'>('text');

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />

      <section id="voice-chat" className="py-20 relative" style={{ backgroundColor: '#F9FAFA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-8">
            <div className="flex flex-col items-center mb-2">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 text-center mb-4">
                Meet Mateo the Manatee!
              </h2>
              <img
                src="/ezgif.com-crop.gif"
                alt="Mateo the Manatee"
                className="w-80 h-80 gentle-bounce"
                style={{
                  backgroundColor: 'transparent'
                }}
              />
            </div>
            <p className="text-2xl text-gray-900 text-center mt-4">
              Have a LIVE voice chat with Mateo about the San San Pond Sak Wetlands!
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20" style={{ height: '600px' }}>
            <iframe
              src="https://san-san-pond-sak-wetlands-ai-guide-935853824529.us-west1.run.app"
              className="w-full h-full border-0"
              title="TerraTale AI Chat"
              allow="microphone"
            />
          </div>
        </div>
      </section>

      <section id="chat" className="py-20 relative" style={{ backgroundColor: '#8db9ca' }}>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Text Chat
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Ask questions and explore the wetlands using natural language. This chat section can show you images of over 60 types of fauna & flora that are found in the San San Pond Sak Wetlands!
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20" style={{ height: '600px' }}>
            <ChatInterface />
          </div>
        </div>
      </section>

      <WildlifeGallery />
      <AboutSection />
      <FAQ />
      <Footer />
    </div>
  );
}

export default App;

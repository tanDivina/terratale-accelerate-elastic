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

      <section id="chat" className="py-20 relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNiwgMTg1LCAxMjksIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Chat with Mateo the Manatee
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Choose your preferred way to explore the wetlands
            </p>

            <div className="inline-flex rounded-lg bg-white shadow-lg p-1 border border-gray-200">
              <button
                onClick={() => setChatMode('text')}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${
                  chatMode === 'text'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                Text Chat
              </button>
              <button
                onClick={() => setChatMode('audio')}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${
                  chatMode === 'audio'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Mic className="w-5 h-5" />
                Voice Chat
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20" style={{ height: '600px' }}>
            {chatMode === 'audio' ? (
              <AudioChat />
            ) : (
              <ChatInterface />
            )}
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

import Header from './components/Header';
import Hero from './components/Hero';
import ChatInterface from './components/ChatInterface';
import WildlifeGallery from './components/WildlifeGallery';
import AboutSection from './components/AboutSection';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <ChatInterface />
      <WildlifeGallery />
      <AboutSection />
      <FAQ />
      <Footer />
    </div>
  );
}

export default App;

import manateeIcon from '../assets/Generated Image October 24, 2025 - 9_42AM.png';

export default function Header() {
  return (
    <header className="bg-[#f5f3ed] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <img src={manateeIcon} alt="Manatee" className="w-8 h-8 object-contain" />
              <span className="text-xl font-light tracking-wide text-stone-900">TerraTale</span>
            </div>
            <p className="text-xs text-stone-600 ml-9 mt-0.5">A Conversational Eco-Guide for the San San Pond Sak Wetlands</p>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#explore" className="text-sm text-stone-700 hover:text-stone-900 transition-colors tracking-wide">EXPLORE</a>
            <a href="#wildlife" className="text-sm text-stone-700 hover:text-stone-900 transition-colors tracking-wide">WILDLIFE</a>
            <a href="#about" className="text-sm text-stone-700 hover:text-stone-900 transition-colors tracking-wide">ABOUT US</a>
            <a href="#resources" className="text-sm text-stone-700 hover:text-stone-900 transition-colors tracking-wide">RESOURCES</a>
          </nav>
        </div>
      </div>
    </header>
  );
}

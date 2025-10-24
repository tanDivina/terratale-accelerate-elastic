import { Leaf } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-[#f5f3ed] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3">
              <Leaf className="w-8 h-8 text-stone-900" />
              <span className="text-3xl font-light tracking-wide text-stone-900">TerraTale</span>
            </div>
            <p className="text-sm text-stone-600 mt-1">A Conversational Eco-Guide for the San San Pond Sak Wetlands</p>
          </div>
        </div>
      </div>
    </header>
  );
}

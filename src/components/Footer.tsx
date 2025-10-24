import { Leaf, Mail, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-5 h-5" />
              <span className="text-lg font-light tracking-wide">San San Pond Sak</span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Protecting and preserving the natural heritage of Bocas del Toro's wetlands
              for future generations.
            </p>
          </div>

          <div>
            <h3 className="text-white font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#explore" className="hover:text-white transition-colors">Explore</a></li>
              <li><a href="#wildlife" className="hover:text-white transition-colors">Wildlife</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#resources" className="hover:text-white transition-colors">Resources</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-medium mb-4">Connect</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a
                  href="https://www.linkedin.com/in/dorien-van-den-abbeele-136170b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  LinkedIn Profile
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Bocas del Toro, Panama</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-8 text-center text-sm text-stone-500">
          <p>© 2025 TerraTale by @DorienVibecodes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

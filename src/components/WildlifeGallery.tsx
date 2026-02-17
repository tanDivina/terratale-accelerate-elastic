import { useState, useEffect } from 'react';
import { Search, X, AlertCircle } from 'lucide-react';
import ImageLightbox from './ImageLightbox';
import type { WildlifeImage } from '../types/wildlife';

export default function WildlifeGallery() {
  const [images, setImages] = useState<WildlifeImage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<WildlifeImage | null>(null);

  useEffect(() => {
    if (searchTerm === '') {
      setImages([]);
      setError(null);
      return;
    }

    const debounceTimer = setTimeout(() => {
      fetchImages(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  async function fetchImages(query: string) {
    setSearching(true);
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const apiUrl = `${supabaseUrl}/functions/v1/wildlife-search?q=${encodeURIComponent(query)}`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed (${response.status})`);
      }

      const result = await response.json();
      setImages(result.images || []);
    } catch (err) {
      console.error('Error fetching wildlife images:', err);
      setError('Unable to load results. Please try again.');
      setImages([]);
    } finally {
      setSearching(false);
    }
  }

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <section id="wildlife" className="bg-[#f5f3ed] py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl text-stone-900 mb-4">
            <span className="italic">Experience</span> the Biodiversity
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-8">
            A sanctuary for endangered species and a vital ecosystem for the Caribbean coast
          </p>

          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by species name, description, or conservation status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-stone-300 focus:border-stone-500 focus:outline-none text-stone-900 placeholder-stone-400"
              aria-label="Search wildlife species"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {!searchTerm && images.length === 0 && !searching && (
            <p className="mt-4 text-stone-600 text-lg">
              Spotted something you'd like to identify? Browse our library with over 60 species found in San San Pond Sak!
            </p>
          )}
          {searchTerm && !searching && !error && (
            <p className="mt-4 text-stone-600" aria-live="polite">
              Found {images.length} {images.length === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>

        <div role="status" aria-live="polite" aria-label={searching ? 'Searching...' : ''}>
          {searching ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin" aria-hidden="true"></div>
              <p className="mt-4 text-stone-600">Searching...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 flex flex-col items-center gap-3">
              <AlertCircle className="w-8 h-8 text-stone-400" />
              <p className="text-stone-600 text-lg">{error}</p>
            </div>
          ) : images.length === 0 && searchTerm ? (
            <div className="text-center py-12">
              <p className="text-stone-600 text-lg">
                No species found matching your search.
              </p>
            </div>
          ) : images.length > 0 ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedImage(image)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${image.english_name || image.common_name}`}
                >
                  <div className="relative overflow-hidden rounded-xl mb-3 aspect-square bg-stone-100">
                    <img
                      src={image.photo_image_url}
                      alt={`${image.english_name || image.common_name} (${image.species_name})`}
                      className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {image.conservation_status && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-stone-700">
                        {image.conservation_status}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-stone-900 mb-1">
                    {image.english_name || image.common_name}
                  </h3>
                  <p className="text-sm text-stone-500 italic">{image.species_name}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {selectedImage && (
        <ImageLightbox
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </section>
  );
}

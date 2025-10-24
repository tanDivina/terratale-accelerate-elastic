import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import ImageLightbox from './ImageLightbox';

interface WildlifeImage {
  id: string;
  photo_image_url: string;
  photo_description: string;
  species_name: string;
  common_name: string;
  english_name?: string;
  location: string;
  conservation_status: string | null;
}

export default function WildlifeGallery() {
  const [images, setImages] = useState<WildlifeImage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<WildlifeImage | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    // Don't load images initially - only when user searches
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchImages(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  async function fetchImages(query: string) {
    if (query === '') {
      setLoading(true);
    } else {
      setSearching(true);
    }

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
        throw new Error(`Failed to fetch images: ${response.status}`);
      }

      const result = await response.json();
      setImages(result.images || []);
    } catch (error) {
      console.error('Error fetching wildlife images:', error);
      setImages([]);
    } finally {
      setLoading(false);
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by species name, description, or conservation status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-stone-300 focus:border-stone-500 focus:outline-none text-stone-900 placeholder-stone-400"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {!searchTerm && images.length === 0 && !loading && (
            <p className="mt-4 text-stone-600 text-lg">
              Spotted something you'd like to identify?
            </p>
          )}
          {searchTerm && !searching && (
            <p className="mt-4 text-stone-600">
              Found {images.length} {images.length === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>

        {loading || searching ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-stone-600">Searching...</p>
          </div>
        ) : images.length === 0 && searchTerm ? (
          <div className="text-center py-12">
            <p className="text-stone-600 text-lg">
              No species found matching your search.
            </p>
          </div>
        ) : images.length > 0 && (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="group cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <div className="relative overflow-hidden rounded-xl mb-3 aspect-square">
                  <img
                    src={image.photo_image_url}
                    alt={image.common_name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {image.conservation_status && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-stone-700">
                      {image.conservation_status}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-medium text-stone-900 mb-1">{image.common_name}</h3>
                {image.english_name && image.english_name !== image.common_name && (
                  <p className="text-sm text-stone-600">{image.english_name}</p>
                )}
                <p className="text-sm text-stone-500 italic">{image.species_name}</p>
              </div>
            ))}
          </div>
        )}
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

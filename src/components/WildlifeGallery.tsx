import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ImageLightbox from './ImageLightbox';

interface WildlifeImage {
  id: string;
  photo_image_url: string;
  photo_description: string;
  species_name: string;
  common_name: string;
  location: string;
  conservation_status: string | null;
}

export default function WildlifeGallery() {
  const [images, setImages] = useState<WildlifeImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<WildlifeImage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<WildlifeImage | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredImages(images);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = images.filter(img =>
        img.common_name.toLowerCase().includes(term) ||
        img.species_name.toLowerCase().includes(term) ||
        img.photo_description.toLowerCase().includes(term) ||
        (img.conservation_status && img.conservation_status.toLowerCase().includes(term))
      );
      setFilteredImages(filtered);
    }
  }, [searchTerm, images]);

  async function fetchImages() {
    try {
      const { data, error } = await supabase
        .from('wildlife_images')
        .select('*')
        .order('common_name');

      if (error) throw error;

      setImages(data || []);
      setFilteredImages(data || []);
    } catch (error) {
      console.error('Error fetching wildlife images:', error);
    } finally {
      setLoading(false);
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

          {searchTerm && (
            <p className="mt-4 text-stone-600">
              Found {filteredImages.length} {filteredImages.length === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-stone-600">Loading wildlife gallery...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-600 text-lg">
              {searchTerm ? 'No species found matching your search.' : 'No wildlife images available.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
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

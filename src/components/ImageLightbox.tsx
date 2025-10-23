import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

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

interface ImageLightboxProps {
  images?: Array<{
    url: string;
    description: string;
  }>;
  currentIndex?: number;
  onClose: () => void;
  onNavigate?: (index: number) => void;
  image?: WildlifeImage;
}

export default function ImageLightbox({ images, currentIndex = 0, onClose, onNavigate, image }: ImageLightboxProps) {
  const isSingleImage = !!image;
  const hasMultipleImages = !!images && images.length > 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (hasMultipleImages && onNavigate) {
        if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
        if (e.key === 'ArrowRight' && currentIndex < images!.length - 1) onNavigate(currentIndex + 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [currentIndex, images, onClose, onNavigate, hasMultipleImages]);

  if (isSingleImage) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-stone-300 transition-colors z-10"
        >
          <X className="w-8 h-8" />
        </button>

        <div
          className="max-w-7xl max-h-[90vh] flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={image.photo_image_url}
            alt={image.common_name}
            className="max-w-full max-h-[75vh] object-contain rounded-lg"
          />
          <div className="mt-6 px-8 py-4 bg-stone-900 bg-opacity-90 rounded-lg max-w-2xl">
            <h3 className="text-xl font-semibold text-white text-center mb-2">
              {image.common_name}
            </h3>
            {image.english_name && image.english_name !== image.common_name && (
              <p className="text-emerald-400 text-center mb-2">{image.english_name}</p>
            )}
            <p className="text-stone-300 text-center italic mb-3">{image.species_name}</p>
            <p className="text-white text-center">{image.photo_description}</p>
            {image.conservation_status && (
              <div className="mt-3 flex justify-center">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white">
                  {image.conservation_status}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!hasMultipleImages) return null;

  const currentImage = images![currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-stone-300 transition-colors z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {currentIndex > 0 && onNavigate && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex - 1);
          }}
          className="absolute left-4 text-white hover:text-stone-300 transition-colors z-10"
        >
          <ChevronLeft className="w-12 h-12" />
        </button>
      )}

      {currentIndex < images!.length - 1 && onNavigate && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex + 1);
          }}
          className="absolute right-4 text-white hover:text-stone-300 transition-colors z-10"
        >
          <ChevronRight className="w-12 h-12" />
        </button>
      )}

      <div
        className="max-w-7xl max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.url}
          alt={currentImage.description}
          className="max-w-full max-h-[80vh] object-contain"
        />
        <div className="mt-4 px-6 py-3 bg-stone-900 bg-opacity-80 rounded-lg max-w-2xl">
          <p className="text-white text-center">{currentImage.description}</p>
          <p className="text-stone-400 text-center text-sm mt-2">
            {currentIndex + 1} / {images!.length}
          </p>
        </div>
      </div>
    </div>
  );
}

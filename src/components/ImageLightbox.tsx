import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

interface ImageLightboxProps {
  images: Array<{
    url: string;
    description: string;
  }>;
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function ImageLightbox({ images, currentIndex, onClose, onNavigate }: ImageLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [currentIndex, images.length, onClose, onNavigate]);

  const currentImage = images[currentIndex];

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

      {currentIndex > 0 && (
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

      {currentIndex < images.length - 1 && (
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
            {currentIndex + 1} / {images.length}
          </p>
        </div>
      </div>
    </div>
  );
}

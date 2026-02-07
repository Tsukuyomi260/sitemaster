import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IMGS = [
  '/carroussel/IMG-20250927-WA0099.jpg',
  '/carroussel/IMG-20250927-WA0083.jpg',
  '/carroussel/IMG-20250927-WA0055.jpg',
  '/carroussel/IMG-20250927-WA0021.jpg',
  '/carroussel/IMG-20250927-WA0011.jpg',
  '/carroussel/IMG-20250904-WA0011.jpg',
  '/carroussel/IMG-20250904-WA0006.jpg',
  '/carroussel/IMG-20250904-WA0007.jpg',
  '/carroussel/IMG_20250904_084706.jpg'
];

interface RollingGalleryProps {
  autoplay?: boolean;
  pauseOnHover?: boolean;
  images?: string[];
}

const RollingGallery: React.FC<RollingGalleryProps> = ({ autoplay = true, pauseOnHover = true, images = [] }) => {
  const displayImages = images.length > 0 ? images : IMGS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isDragging, setIsDragging] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && !isDragging) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % displayImages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, isDragging, displayImages.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    setIsPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const _handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    const threshold = 50;
    
    if (info.offset.x > threshold) {
      prevSlide();
    } else if (info.offset.x < -threshold) {
      nextSlide();
    }
  };

  return (
    <div className="w-full py-6 sm:py-8 px-4">
      {/* Gallery Header */}
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          Découvrez notre écosystème académique
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          Explorez les différentes facettes de notre institution et les opportunités qui vous attendent
        </p>
      </div>

      {/* Mobile-First Gallery */}
      <div className="relative bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg">
        {/* Main Image Container */}
        <div className="relative h-[250px] sm:h-[300px] lg:h-[350px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img
                src={displayImages[currentIndex]}
                alt={`Galerie ${currentIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 z-10"
            aria-label="Image précédente"
          >
            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 z-10"
            aria-label="Image suivante"
          >
            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 z-10"
            aria-label={isPlaying ? "Pause" : "Lecture"}
          >
            {isPlaying ? (
              <svg className="w-4 h-4 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-slate-700">
            {currentIndex + 1} / {displayImages.length}
          </div>
        </div>

        {/* Thumbnail Strip */}
        <div className="p-4 bg-white/50 backdrop-blur-sm">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === currentIndex
                    ? 'border-slate-700 scale-105 shadow-md'
                    : 'border-white hover:border-slate-300 hover:scale-105'
                }`}
              >
                <img
                  src={image}
                  alt={`Miniature ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-white/30">
          <motion.div
            className="h-full bg-gradient-to-r from-slate-700 to-slate-500"
            initial={{ width: "0%" }}
            animate={{ width: isPlaying ? "100%" : "0%" }}
            transition={{ duration: 3, ease: "linear" }}
            key={currentIndex}
          />
        </div>
      </div>

    </div>
  );
};

export default RollingGallery;
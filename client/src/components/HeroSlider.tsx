import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroContent {
  id: number;
  title: string;
  genre: string;
  rating: string;
  year: string;
  type: "movie" | "tv";
  thumbnailUrl?: string;
}

interface HeroSliderProps {
  heroContent?: HeroContent[];
}

const HeroSlider = ({ heroContent = [] }: HeroSliderProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fallback content if no hero content provided
  const fallbackSlides = [
    {
      id: 1,
      title: "The Dark Knight",
      genre: "Action • Crime",
      rating: "PG-13",
      year: "2008",
      type: "movie" as const,
      thumbnailUrl: "https://images.unsplash.com/photo-1489599743460-33be6e9c9303?w=1200&h=675&fit=crop"
    },
    {
      id: 2,
      title: "Stranger Things",
      genre: "Sci-Fi • Horror",
      rating: "TV-14",
      year: "2023",
      type: "tv" as const,
      thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=675&fit=crop"
    }
  ];

  const slides = heroContent.length > 0 ? heroContent : fallbackSlides;

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (slides.length === 0) {
    return (
      <div className="relative h-[60vh] bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">No Hero Content Available</h2>
          <p className="text-muted-foreground">Upload content and mark it for "Home Hero" to display here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[60vh] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="relative h-full">
            <img
              src={slide.thumbnailUrl || `https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=675&fit=crop&q=80`}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-6">
                <div className="max-w-2xl text-white">
                  <h1 className="text-5xl font-bold mb-4">{slide.title}</h1>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="bg-red-600 px-2 py-1 text-xs font-bold rounded">
                      {slide.rating}
                    </span>
                    <span className="text-sm">{slide.year}</span>
                    <span className="text-sm">{slide.genre}</span>
                    <span className="text-sm capitalize">{slide.type}</span>
                  </div>
                  <div className="flex space-x-4">
                    <Button size="lg" className="bg-white text-black hover:bg-gray-200">
                      <Play className="w-5 h-5 mr-2" />
                      Play
                    </Button>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                      <Info className="w-5 h-5 mr-2" />
                      More Info
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSlider;
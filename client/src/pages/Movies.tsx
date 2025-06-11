import PremiumNavbar from "@/components/PremiumNavbar";
import SimplePremiumContentRow from "@/components/SimplePremiumContentRow";
import HeroSlider from "@/components/HeroSlider";
import { useQuery } from "@tanstack/react-query";

interface Movie {
  id: number;
  title: string;
  genre: string;
  rating: string;
  year: string;
  type: "movie" | "tv";
  videoUrl?: string;
  thumbnailUrl?: string;
}

const Movies = () => {
  const { data: contentLibrary = [] } = useQuery({
    queryKey: ['/api/content/published']
  });

  // Filter only movies and transform for display
  const moviesContent = contentLibrary
    .filter((item: any) => item.type === 'movie')
    .map((item: any) => ({
      id: item.id,
      title: item.title,
      genre: Array.isArray(item.genres) ? item.genres.join(" • ") : "Drama",
      rating: item.rating || "PG",
      year: item.releaseYear ? item.releaseYear.toString() : "2024",
      type: "movie" as const,
      videoUrl: item.videoUrl,
      thumbnailUrl: item.thumbnailUrl,
      featureIn: item.featureIn || []
    }));

  // Filter content by feature flags for movies
  const getMoviesByFeature = (feature: string, limit: number = 11): Movie[] => {
    return moviesContent
      .filter((item: any) => item.featureIn.includes(feature))
      .sort((a, b) => parseInt(b.year) - parseInt(a.year))
      .slice(0, limit);
  };

  // Filter movies by genre (allowing multiple genres in section)
  const getMoviesByGenre = (genreList: string[], limit: number = 11): Movie[] => {
    return moviesContent
      .filter((item: any) => {
        const itemGenres = item.genre.toLowerCase().split(' • ');
        return genreList.some(genre => 
          itemGenres.some(itemGenre => itemGenre.includes(genre.toLowerCase()))
        );
      })
      .sort((a, b) => parseInt(b.year) - parseInt(a.year))
      .slice(0, limit);
  };

  // Content sections for movies
  const heroMovies = getMoviesByFeature('Type Page Hero', 7);
  const newReleases = getMoviesByFeature('Type Page New Release');
  const popular = getMoviesByFeature('Type Page Popular');
  const actionAdventure = getMoviesByGenre(['action', 'adventure']);
  const comedy = getMoviesByGenre(['comedy']);
  const crime = getMoviesByGenre(['crime']);
  const drama = getMoviesByGenre(['drama']);
  const horror = getMoviesByGenre(['horror']);
  const mysteryThriller = getMoviesByGenre(['mystery', 'thriller']);
  const sciFi = getMoviesByGenre(['sci-fi']);

  const handleContentAction = (contentId: number, action: string) => {
    console.log(`${action} content with ID: ${contentId}`);
  };

  const handleSeeMore = (sectionTitle: string) => {
    console.log(`See more for section: ${sectionTitle}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <PremiumNavbar />

      <div className="pt-20">
        <HeroSlider heroContent={heroMovies} />

        <div className="container mx-auto pb-12">
          {newReleases.length > 0 && (
            <SimplePremiumContentRow 
              title="New Releases" 
              movies={newReleases}
              contentType="movie"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("New Releases")}
            />
          )}

          {popular.length > 0 && (
            <SimplePremiumContentRow 
              title="Popular" 
              movies={popular}
              contentType="movie"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Popular")}
            />
          )}

          {actionAdventure.length > 0 && (
            <SimplePremiumContentRow 
              title="Action & Adventure" 
              movies={actionAdventure}
              contentType="movie"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Action & Adventure")}
            />
          )}

          {comedy.length > 0 && (
            <SimplePremiumContentRow 
              title="Comedy" 
              movies={comedy}
              contentType="movie"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Comedy")}
            />
          )}

          {crime.length > 0 && (
            <SimplePremiumContentRow 
              title="Crime" 
              movies={crime}
              contentType="movie"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Crime")}
            />
          )}

          {drama.length > 0 && (
            <SimplePremiumContentRow 
              title="Drama" 
              movies={drama}
              contentType="movie"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Drama")}
            />
          )}

          {horror.length > 0 && (
            <SimplePremiumContentRow 
              title="Horror" 
              movies={horror}
              contentType="movie"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Horror")}
            />
          )}

          {mysteryThriller.length > 0 && (
            <SimplePremiumContentRow 
              title="Mystery & Thriller" 
              movies={mysteryThriller}
              contentType="movie"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Mystery & Thriller")}
            />
          )}

          {sciFi.length > 0 && (
            <SimplePremiumContentRow 
              title="Sci-Fi" 
              movies={sciFi}
              contentType="movie"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Sci-Fi")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Movies;
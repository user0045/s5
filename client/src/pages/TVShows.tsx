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

const TVShows = () => {
  const { data: contentLibrary = [] } = useQuery({
    queryKey: ['/api/content/published']
  });

  // Filter only TV shows and transform for display
  const tvShowsContent = contentLibrary
    .filter((item: any) => item.type === 'tv_show')
    .map((item: any) => ({
      id: item.id,
      title: item.title,
      genre: Array.isArray(item.genres) ? item.genres.join(" • ") : "Drama",
      rating: item.rating || "TV-14",
      year: item.releaseYear ? item.releaseYear.toString() : "2024",
      type: "tv" as const,
      videoUrl: item.videoUrl,
      thumbnailUrl: item.thumbnailUrl,
      featureIn: item.featureIn || []
    }));

  // Filter content by feature flags for TV shows
  const getTVShowsByFeature = (feature: string, limit: number = 11): Movie[] => {
    return tvShowsContent
      .filter((item: any) => item.featureIn.includes(feature))
      .sort((a, b) => parseInt(b.year) - parseInt(a.year))
      .slice(0, limit);
  };

  // Filter TV shows by genre (allowing multiple genres in section)
  const getTVShowsByGenre = (genreList: string[], limit: number = 11): Movie[] => {
    return tvShowsContent
      .filter((item: any) => {
        const itemGenres = item.genre.toLowerCase().split(' • ');
        return genreList.some(genre => 
          itemGenres.some(itemGenre => itemGenre.includes(genre.toLowerCase()))
        );
      })
      .sort((a, b) => parseInt(b.year) - parseInt(a.year))
      .slice(0, limit);
  };

  // Content sections for TV shows
  const heroTVShows = getTVShowsByFeature('Type Page Hero', 7);
  const newReleases = getTVShowsByFeature('Type Page New Release');
  const popular = getTVShowsByFeature('Type Page Popular');
  const actionAdventure = getTVShowsByGenre(['action', 'adventure']);
  const comedy = getTVShowsByGenre(['comedy']);
  const crime = getTVShowsByGenre(['crime']);
  const drama = getTVShowsByGenre(['drama']);
  const horror = getTVShowsByGenre(['horror']);
  const mysteryThriller = getTVShowsByGenre(['mystery', 'thriller']);
  const sciFi = getTVShowsByGenre(['sci-fi']);

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
        <HeroSlider heroContent={heroTVShows} />

        <div className="container mx-auto pb-12">
          {newReleases.length > 0 && (
            <SimplePremiumContentRow 
              title="New Releases" 
              movies={newReleases}
              contentType="tv"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("New Releases")}
            />
          )}

          {popular.length > 0 && (
            <SimplePremiumContentRow 
              title="Popular" 
              movies={popular}
              contentType="tv"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Popular")}
            />
          )}

          {actionAdventure.length > 0 && (
            <SimplePremiumContentRow 
              title="Action & Adventure" 
              movies={actionAdventure}
              contentType="tv"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Action & Adventure")}
            />
          )}

          {comedy.length > 0 && (
            <SimplePremiumContentRow 
              title="Comedy" 
              movies={comedy}
              contentType="tv"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Comedy")}
            />
          )}

          {crime.length > 0 && (
            <SimplePremiumContentRow 
              title="Crime" 
              movies={crime}
              contentType="tv"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Crime")}
            />
          )}

          {drama.length > 0 && (
            <SimplePremiumContentRow 
              title="Drama" 
              movies={drama}
              contentType="tv"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Drama")}
            />
          )}

          {horror.length > 0 && (
            <SimplePremiumContentRow 
              title="Horror" 
              movies={horror}
              contentType="tv"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Horror")}
            />
          )}

          {mysteryThriller.length > 0 && (
            <SimplePremiumContentRow 
              title="Mystery & Thriller" 
              movies={mysteryThriller}
              contentType="tv"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Mystery & Thriller")}
            />
          )}

          {sciFi.length > 0 && (
            <SimplePremiumContentRow 
              title="Sci-Fi" 
              movies={sciFi}
              contentType="tv"
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

export default TVShows;
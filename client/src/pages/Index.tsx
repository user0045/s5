
import PremiumNavbar from "@/components/PremiumNavbar";
import HeroSlider from "@/components/HeroSlider";
import SimplePremiumContentRow from "@/components/SimplePremiumContentRow";
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

const Index = () => {
  const { data: contentLibrary = [] } = useQuery({
    queryKey: ['/api/content/published']
  });

  // Transform content for display
  const contentToUse = contentLibrary.map((item: any) => ({
    id: item.id,
    title: item.title,
    genre: Array.isArray(item.genres) ? item.genres.join(" • ") : "Drama",
    rating: item.rating || "PG",
    year: item.releaseYear ? item.releaseYear.toString() : "2024",
    type: item.type === "tv_show" ? "tv" as const : "movie" as const,
    videoUrl: item.videoUrl,
    thumbnailUrl: item.thumbnailUrl,
    featureIn: item.featureIn || []
  }));

  // Filter content by feature flags
  const getContentByFeature = (feature: string, limit: number = 11): Movie[] => {
    return contentToUse
      .filter((item: any) => item.featureIn.includes(feature))
      .sort((a, b) => parseInt(b.year) - parseInt(a.year))
      .slice(0, limit);
  };

  // Filter content by genre (allowing multiple genres in section)
  const getContentByGenre = (genreList: string[], limit: number = 11): Movie[] => {
    return contentToUse
      .filter((item: any) => {
        const itemGenres = item.genre.toLowerCase().split(' • ');
        return genreList.some(genre => 
          itemGenres.some(itemGenre => itemGenre.includes(genre.toLowerCase()))
        );
      })
      .sort((a, b) => parseInt(b.year) - parseInt(a.year))
      .slice(0, limit);
  };

  // Content sections
  const heroContent = getContentByFeature('Home Hero', 7);
  const newReleases = getContentByFeature('Home New Release');
  const popular = getContentByFeature('Home Popular');
  const actionAdventure = getContentByGenre(['action', 'adventure']);
  const comedy = getContentByGenre(['comedy']);
  const crime = getContentByGenre(['crime']);
  const drama = getContentByGenre(['drama']);
  const horror = getContentByGenre(['horror']);
  const mysteryThriller = getContentByGenre(['mystery', 'thriller']);
  const sciFi = getContentByGenre(['sci-fi']);

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
        <HeroSlider heroContent={heroContent} />
        
        <div className="container mx-auto pb-12">
          {newReleases.length > 0 && (
            <SimplePremiumContentRow 
              title="New Releases" 
              movies={newReleases}
              contentType="all"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("New Releases")}
            />
          )}
          
          {popular.length > 0 && (
            <SimplePremiumContentRow 
              title="Popular" 
              movies={popular}
              contentType="all"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Popular")}
            />
          )}
          
          {actionAdventure.length > 0 && (
            <SimplePremiumContentRow 
              title="Action & Adventure" 
              movies={actionAdventure}
              contentType="all"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Action & Adventure")}
            />
          )}
          
          {comedy.length > 0 && (
            <SimplePremiumContentRow 
              title="Comedy" 
              movies={comedy}
              contentType="all"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Comedy")}
            />
          )}
          
          {crime.length > 0 && (
            <SimplePremiumContentRow 
              title="Crime" 
              movies={crime}
              contentType="all"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Crime")}
            />
          )}
          
          {drama.length > 0 && (
            <SimplePremiumContentRow 
              title="Drama" 
              movies={drama}
              contentType="all"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Drama")}
            />
          )}
          
          {horror.length > 0 && (
            <SimplePremiumContentRow 
              title="Horror" 
              movies={horror}
              contentType="all"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Horror")}
            />
          )}
          
          {mysteryThriller.length > 0 && (
            <SimplePremiumContentRow 
              title="Mystery & Thriller" 
              movies={mysteryThriller}
              contentType="all"
              onMoviePlay={(id) => handleContentAction(id, "Play")}
              onMovieMoreInfo={(id) => handleContentAction(id, "More info")}
              onSeeMore={() => handleSeeMore("Mystery & Thriller")}
            />
          )}
          
          {sciFi.length > 0 && (
            <SimplePremiumContentRow 
              title="Sci-Fi" 
              movies={sciFi}
              contentType="all"
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

export default Index;

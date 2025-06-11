
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const genres = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", 
  "Drama", "Family", "Fantasy", "Horror", "Mystery", "Romance", 
  "Sci-Fi", "Thriller", "War", "Western"
];

const ratingTypes = ["G", "PG", "PG-13", "R", "NC-17", "TV-Y", "TV-Y7", "TV-G", "TV-PG", "TV-14", "TV-MA"];

interface Season {
  seasonNumber: number;
  seasonDescription: string;
  releaseYear: number;
  ratingType: string;
  rating: number;
  director: string;
  writer: string;
  cast: string[];
  thumbnailUrl: string;
  trailerUrl: string;
  homeHero: boolean;
  typePageHero: boolean;
  homeNewRelease: boolean;
  typePageNewRelease: boolean;
  homePopular: boolean;
  typePagePopular: boolean;
  episodes: Episode[];
}

interface Episode {
  episodeNumber: number;
  title: string;
  duration: string;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
}

const ContentUploadForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    contentType: "",
    description: "",
    releaseYear: new Date().getFullYear(),
    ratingType: "PG",
    rating: 7.0,
    director: "",
    writer: "",
    cast: [] as string[],
    thumbnailUrl: "",
    trailerUrl: "",
    videoUrl: "", // For movies only
    homeHero: false,
    typePageHero: false,
    homeNewRelease: false,
    typePageNewRelease: false,
    homePopular: false,
    typePagePopular: false,
  });

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [customGenre, setCustomGenre] = useState("");
  const [newCastMember, setNewCastMember] = useState("");
  const [seasons, setSeasons] = useState<Season[]>([]);

  const createContentMutation = useMutation({
    mutationFn: async (data: any) => {
      let contentId: number;
      
      if (data.contentType === 'movie') {
        // Create movie
        const { data: movieData, error: movieError } = await supabase
          .from('movies')
          .insert({
            description: data.description,
            release_year: data.releaseYear,
            rating_type: data.ratingType,
            rating: Math.round(data.rating * 10),
            director: data.director,
            writer: data.writer,
            cast: data.cast,
            thumbnail_url: data.thumbnailUrl,
            trailer_url: data.trailerUrl,
            video_url: data.videoUrl,
            feature_in: [
              ...(data.homeHero ? ['Home Hero'] : []),
              ...(data.typePageHero ? ['Type Page Hero'] : []),
              ...(data.homeNewRelease ? ['Home New Release'] : []),
              ...(data.typePageNewRelease ? ['Type Page New Release'] : []),
              ...(data.homePopular ? ['Home Popular'] : []),
              ...(data.typePagePopular ? ['Type Page Popular'] : [])
            ]
          })
          .select()
          .single();

        if (movieError) throw movieError;
        contentId = movieData.content_id;
      } else {
        // Create TV show
        const { data: tvShowData, error: tvShowError } = await supabase
          .from('tv_shows')
          .insert({})
          .select()
          .single();

        if (tvShowError) throw tvShowError;
        contentId = tvShowData.content_id;

        // Create seasons
        for (const season of data.seasons) {
          const { data: seasonData, error: seasonError } = await supabase
            .from('seasons')
            .insert({
              season_description: season.seasonDescription,
              release_year: season.releaseYear,
              rating_type: season.ratingType,
              rating: Math.round(season.rating * 10),
              director: season.director,
              writer: season.writer,
              cast: season.cast,
              thumbnail_url: season.thumbnailUrl,
              trailer_url: season.trailerUrl,
              feature_in: [
                ...(season.homeHero ? ['Home Hero'] : []),
                ...(season.typePageHero ? ['Type Page Hero'] : []),
                ...(season.homeNewRelease ? ['Home New Release'] : []),
                ...(season.typePageNewRelease ? ['Type Page New Release'] : []),
                ...(season.homePopular ? ['Home Popular'] : []),
                ...(season.typePagePopular ? ['Type Page Popular'] : [])
              ]
            })
            .select()
            .single();

          if (seasonError) throw seasonError;

          // Create episodes
          for (const episode of season.episodes) {
            await supabase
              .from('episodes')
              .insert({
                title: episode.title,
                duration: episode.duration,
                video_url: episode.videoUrl,
                thumbnail_url: episode.thumbnailUrl,
                description: episode.description
              });
          }
        }
      }

      // Create upload content entry
      const { data: uploadData, error: uploadError } = await supabase
        .from('upload_content')
        .insert({
          title: data.title,
          content_type: data.contentType,
          genres: data.genres,
          content_id: contentId
        })
        .select()
        .single();

      if (uploadError) throw uploadError;
      return uploadData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.invalidateQueries({ queryKey: ['/api/content/published'] });
      toast({
        title: "Success",
        description: "Content uploaded successfully!"
      });
      // Reset form
      setFormData({
        title: "",
        contentType: "",
        description: "",
        releaseYear: new Date().getFullYear(),
        ratingType: "PG",
        rating: 7.0,
        director: "",
        writer: "",
        cast: [],
        thumbnailUrl: "",
        trailerUrl: "",
        videoUrl: "",
        homeHero: false,
        typePageHero: false,
        homeNewRelease: false,
        typePageNewRelease: false,
        homePopular: false,
        typePagePopular: false,
      });
      setSelectedGenres([]);
      setSeasons([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload content",
        variant: "destructive"
      });
    }
  });

  const handleInputChange = (field: string, value: string | number | boolean | string[]) => {
    setFormData({ ...formData, [field]: value });
  };

  const addGenre = (genre: string) => {
    if (genre && !selectedGenres.includes(genre)) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const removeGenre = (genre: string) => {
    setSelectedGenres(selectedGenres.filter(g => g !== genre));
  };

  const addCustomGenre = () => {
    if (customGenre.trim() && !selectedGenres.includes(customGenre.trim())) {
      setSelectedGenres([...selectedGenres, customGenre.trim()]);
      setCustomGenre("");
    }
  };

  const addCastMember = () => {
    if (newCastMember.trim() && !formData.cast.includes(newCastMember.trim())) {
      setFormData({
        ...formData,
        cast: [...formData.cast, newCastMember.trim()]
      });
      setNewCastMember("");
    }
  };

  const removeCastMember = (member: string) => {
    setFormData({
      ...formData,
      cast: formData.cast.filter(m => m !== member)
    });
  };

  const addSeason = () => {
    const newSeason: Season = {
      seasonNumber: seasons.length + 1,
      seasonDescription: "",
      releaseYear: new Date().getFullYear(),
      ratingType: "TV-PG",
      rating: 7.0,
      director: "",
      writer: "",
      cast: [],
      thumbnailUrl: "",
      trailerUrl: "",
      homeHero: false,
      typePageHero: false,
      homeNewRelease: false,
      typePageNewRelease: false,
      homePopular: false,
      typePagePopular: false,
      episodes: [{
        episodeNumber: 1,
        title: "Episode 1",
        duration: "60 min",
        videoUrl: "",
        thumbnailUrl: "",
        description: ""
      }]
    };
    setSeasons([...seasons, newSeason]);
  };

  const updateSeason = (index: number, field: string, value: any) => {
    const updatedSeasons = [...seasons];
    updatedSeasons[index] = { ...updatedSeasons[index], [field]: value };
    setSeasons(updatedSeasons);
  };

  const removeSeason = (index: number) => {
    setSeasons(seasons.filter((_, i) => i !== index));
  };

  const addEpisode = (seasonIndex: number) => {
    const updatedSeasons = [...seasons];
    const newEpisode = {
      episodeNumber: updatedSeasons[seasonIndex].episodes.length + 1,
      title: `Episode ${updatedSeasons[seasonIndex].episodes.length + 1}`,
      duration: "60 min",
      videoUrl: "",
      thumbnailUrl: "",
      description: ""
    };
    updatedSeasons[seasonIndex].episodes.push(newEpisode);
    setSeasons(updatedSeasons);
  };

  const updateEpisode = (seasonIndex: number, episodeIndex: number, field: string, value: string) => {
    const updatedSeasons = [...seasons];
    updatedSeasons[seasonIndex].episodes[episodeIndex] = {
      ...updatedSeasons[seasonIndex].episodes[episodeIndex],
      [field]: value
    };
    setSeasons(updatedSeasons);
  };

  const removeEpisode = (seasonIndex: number, episodeIndex: number) => {
    const updatedSeasons = [...seasons];
    updatedSeasons[seasonIndex].episodes = updatedSeasons[seasonIndex].episodes.filter((_, i) => i !== episodeIndex);
    setSeasons(updatedSeasons);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.contentType) {
      toast({
        title: "Error",
        description: "Content type is required",
        variant: "destructive"
      });
      return;
    }

    if (selectedGenres.length === 0) {
      toast({
        title: "Error",
        description: "At least one genre is required",
        variant: "destructive"
      });
      return;
    }

    if (formData.contentType === "tv_show" && seasons.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one season for TV shows",
        variant: "destructive"
      });
      return;
    }

    if (formData.contentType === "tv_show" && seasons.some(season => season.episodes.length === 0)) {
      toast({
        title: "Error",
        description: "Each season must have at least one episode",
        variant: "destructive"
      });
      return;
    }

    const data = {
      ...formData,
      genres: selectedGenres,
      seasons: seasons
    };

    createContentMutation.mutate(data);
  };

  const renderFeatureCheckboxes = (prefix = "", seasonIndex?: number) => {
    const isMovie = formData.contentType === "movie";
    const movieLabel = isMovie ? "Movies" : "TV Shows";

    const getValue = (field: string) => {
      if (seasonIndex !== undefined) {
        return seasons[seasonIndex]?.[field as keyof Season] as boolean;
      }
      return formData[field as keyof typeof formData] as boolean;
    };

    const setValue = (field: string, value: boolean) => {
      if (seasonIndex !== undefined) {
        updateSeason(seasonIndex, field, value);
      } else {
        handleInputChange(field, value);
      }
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">Feature In</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${prefix}homeHero`}
              checked={getValue("homeHero")}
              onCheckedChange={(checked) => setValue("homeHero", !!checked)}
            />
            <label htmlFor={`${prefix}homeHero`} className="text-sm">Home Page Hero Slider</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${prefix}typePageHero`}
              checked={getValue("typePageHero")}
              onCheckedChange={(checked) => setValue("typePageHero", !!checked)}
            />
            <label htmlFor={`${prefix}typePageHero`} className="text-sm">{movieLabel} Page Hero Slider</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${prefix}homeNewRelease`}
              checked={getValue("homeNewRelease")}
              onCheckedChange={(checked) => setValue("homeNewRelease", !!checked)}
            />
            <label htmlFor={`${prefix}homeNewRelease`} className="text-sm">Home New Release</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${prefix}typePageNewRelease`}
              checked={getValue("typePageNewRelease")}
              onCheckedChange={(checked) => setValue("typePageNewRelease", !!checked)}
            />
            <label htmlFor={`${prefix}typePageNewRelease`} className="text-sm">{movieLabel} New Release</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${prefix}homePopular`}
              checked={getValue("homePopular")}
              onCheckedChange={(checked) => setValue("homePopular", !!checked)}
            />
            <label htmlFor={`${prefix}homePopular`} className="text-sm">Home Popular</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${prefix}typePagePopular`}
              checked={getValue("typePagePopular")}
              onCheckedChange={(checked) => setValue("typePagePopular", !!checked)}
            />
            <label htmlFor={`${prefix}typePagePopular`} className="text-sm">{movieLabel} Popular</label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          Upload Content
        </CardTitle>
        <CardDescription>Add new movies or TV shows to your platform</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content Type *</label>
              <Select value={formData.contentType} onValueChange={(value) => handleInputChange("contentType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="movie">Movie</SelectItem>
                  <SelectItem value="tv_show">TV Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm font-medium mb-2">Genres *</label>
            <div className="space-y-2">
              <Select onValueChange={addGenre}>
                <SelectTrigger>
                  <SelectValue placeholder="Select genres" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  placeholder="Add custom genre"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomGenre())}
                />
                <Button type="button" onClick={addCustomGenre} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedGenres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                    <button type="button" onClick={() => removeGenre(genre)} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Movie-specific fields */}
          {formData.contentType === "movie" && (
            <>
              {/* Description and Release Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Release Year</label>
                  <Input
                    type="number"
                    value={formData.releaseYear}
                    onChange={(e) => handleInputChange("releaseYear", parseInt(e.target.value))}
                    min="1900"
                    max="2030"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating Type</label>
                  <Select value={formData.ratingType} onValueChange={(value) => handleInputChange("ratingType", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ratingTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rating (0-10)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.rating}
                    onChange={(e) => handleInputChange("rating", parseFloat(e.target.value))}
                  />
                </div>
              </div>

              {/* Director and Writer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Director</label>
                  <Input
                    value={formData.director}
                    onChange={(e) => handleInputChange("director", e.target.value)}
                    placeholder="Enter director name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Writer</label>
                  <Input
                    value={formData.writer}
                    onChange={(e) => handleInputChange("writer", e.target.value)}
                    placeholder="Enter writer name"
                  />
                </div>
              </div>

              {/* Cast */}
              <div>
                <label className="block text-sm font-medium mb-2">Cast</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newCastMember}
                    onChange={(e) => setNewCastMember(e.target.value)}
                    placeholder="Add cast member"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCastMember())}
                  />
                  <Button type="button" onClick={addCastMember} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.cast.map((member) => (
                    <Badge key={member} variant="secondary">
                      {member}
                      <button type="button" onClick={() => removeCastMember(member)} className="ml-2">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
                  <Input
                    value={formData.thumbnailUrl}
                    onChange={(e) => handleInputChange("thumbnailUrl", e.target.value)}
                    placeholder="Enter thumbnail URL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Trailer URL</label>
                  <Input
                    value={formData.trailerUrl}
                    onChange={(e) => handleInputChange("trailerUrl", e.target.value)}
                    placeholder="Enter trailer URL"
                  />
                </div>
              </div>

              {/* Movie Video URL */}
              <div>
                <label className="block text-sm font-medium mb-2">Video URL *</label>
                <Input
                  value={formData.videoUrl}
                  onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                  placeholder="Enter video URL"
                  required
                />
              </div>

              {/* Movie Feature Options */}
              {renderFeatureCheckboxes()}
            </>
          )}

          {/* TV Show Seasons */}
          {formData.contentType === "tv_show" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium">Seasons *</label>
                <Button type="button" onClick={addSeason}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Season
                </Button>
              </div>

              {seasons.map((season, seasonIndex) => (
                <Card key={seasonIndex} className="mb-4">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Season {season.seasonNumber}</CardTitle>
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removeSeason(seasonIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Season basic fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Season Description</label>
                        <Textarea
                          value={season.seasonDescription}
                          onChange={(e) => updateSeason(seasonIndex, "seasonDescription", e.target.value)}
                          placeholder="Enter season description"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Release Year</label>
                        <Input
                          type="number"
                          value={season.releaseYear}
                          onChange={(e) => updateSeason(seasonIndex, "releaseYear", parseInt(e.target.value))}
                          min="1900"
                          max="2030"
                        />
                      </div>
                    </div>

                    {/* Season Feature Options */}
                    {renderFeatureCheckboxes(`season-${seasonIndex}-`, seasonIndex)}

                    {/* Episodes */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium">Episodes *</label>
                        <Button type="button" onClick={() => addEpisode(seasonIndex)} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Episode
                        </Button>
                      </div>

                      {season.episodes.map((episode, episodeIndex) => (
                        <Card key={episodeIndex} className="mb-2">
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">Episode {episode.episodeNumber}</h4>
                              <Button 
                                type="button" 
                                variant="destructive" 
                                size="sm"
                                onClick={() => removeEpisode(seasonIndex, episodeIndex)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Title *</label>
                                <Input
                                  value={episode.title}
                                  onChange={(e) => updateEpisode(seasonIndex, episodeIndex, "title", e.target.value)}
                                  placeholder="Enter episode title"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Duration</label>
                                <Input
                                  value={episode.duration}
                                  onChange={(e) => updateEpisode(seasonIndex, episodeIndex, "duration", e.target.value)}
                                  placeholder="e.g., 60 min"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Video URL *</label>
                                <Input
                                  value={episode.videoUrl}
                                  onChange={(e) => updateEpisode(seasonIndex, episodeIndex, "videoUrl", e.target.value)}
                                  placeholder="Enter video URL"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
                                <Input
                                  value={episode.thumbnailUrl}
                                  onChange={(e) => updateEpisode(seasonIndex, episodeIndex, "thumbnailUrl", e.target.value)}
                                  placeholder="Enter thumbnail URL"
                                />
                              </div>
                            </div>
                            <div className="mt-2">
                              <label className="block text-sm font-medium mb-1">Description</label>
                              <Textarea
                                value={episode.description}
                                onChange={(e) => updateEpisode(seasonIndex, episodeIndex, "description", e.target.value)}
                                placeholder="Enter episode description"
                                rows={2}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={createContentMutation.isPending}
          >
            {createContentMutation.isPending ? "Uploading..." : "Upload Content"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContentUploadForm;

import { useState } from "react";
import { Calendar, Save, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UpcomingUploadFormProps {
  onSuccess?: () => void;
}

const UpcomingUploadForm = ({ onSuccess }: UpcomingUploadFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    genres: [] as string[],
    episodes: null as number | null,
    releaseDate: "",
    description: "",
    ratingType: "",
    rating: 0,
    thumbnailUrl: "",
    trailerUrl: "",
    sectionOrder: 1
  });

  const [newGenre, setNewGenre] = useState("");

  const handleInputChange = (field: string, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addGenre = () => {
    if (newGenre.trim() && !formData.genres.includes(newGenre.trim())) {
      setFormData(prev => ({
        ...prev,
        genres: [...prev.genres, newGenre.trim()]
      }));
      setNewGenre("");
    }
  };

  const removeGenre = (genreToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter(genre => genre !== genreToRemove)
    }));
  };

  const createUpcomingContentMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: upcomingData, error } = await supabase
        .from('upcoming_content')
        .insert({
          title: data.title,
          type: data.type, // Keep as is since upcoming_content uses 'movie'/'tv'
          genres: data.genres,
          episodes: data.episodes,
          release_date: data.releaseDate,
          description: data.description,
          rating_type: data.ratingType,
          rating: data.rating,
          thumbnail_url: data.thumbnailUrl || null,
          trailer_url: data.trailerUrl || null,
          section_order: data.sectionOrder,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return upcomingData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-content'] });
      toast({
        title: "Success",
        description: "Upcoming content created successfully!"
      });
      // Reset form
      setFormData({
        title: "",
        type: "",
        genres: [],
        episodes: null,
        releaseDate: "",
        description: "",
        ratingType: "",
        rating: 0,
        thumbnailUrl: "",
        trailerUrl: "",
        sectionOrder: 1
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create upcoming content",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.genres.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one genre",
        variant: "destructive"
      });
      return;
    }

    if (formData.type === "tv_show" && (!formData.episodes || formData.episodes <= 0)) {
      toast({
        title: "Error",
        description: "Please enter the number of episodes for TV shows",
        variant: "destructive"
      });
      return;
    }

    if (!formData.ratingType) {
      toast({
        title: "Error",
        description: "Please select a rating type",
        variant: "destructive"
      });
      return;
    }

    if (formData.rating < 0 || formData.rating > 10) {
      toast({
        title: "Error",
        description: "Rating must be between 0.0 and 10.0",
        variant: "destructive"
      });
      return;
    }

    const data = {
      title: formData.title,
      type: formData.type,
      genres: formData.genres,
      episodes: formData.type === "tv_show" ? formData.episodes : null,
      releaseDate: new Date(formData.releaseDate).toISOString(),
      description: formData.description,
      ratingType: formData.ratingType,
      rating: Math.round(formData.rating * 10), // Convert to integer (multiply by 10)
      thumbnailUrl: formData.thumbnailUrl || null,
      trailerUrl: formData.trailerUrl || null,
      sectionOrder: formData.sectionOrder
    };

    createUpcomingContentMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Add Upcoming Content
        </CardTitle>
        <CardDescription>
          Add new upcoming movies or TV shows to be displayed in the upcoming section
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter title"
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleInputChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="movie">Movie</SelectItem>
                <SelectItem value="tv_show">TV Show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Episodes (only for TV shows) */}
          {formData.type === "tv_show" && (
            <div className="space-y-2">
              <Label htmlFor="episodes">Number of Episodes *</Label>
              <Input
                id="episodes"
                type="number"
                min="1"
                value={formData.episodes?.toString() || ""}
                onChange={(e) => handleInputChange("episodes", parseInt(e.target.value) || null)}
                placeholder="Enter number of episodes"
                required
              />
            </div>
          )}

          {/* Genres */}
          <div className="space-y-2">
            <Label>Genres *</Label>
            <div className="flex gap-2 mb-2">
              <Select 
                value="" 
                onValueChange={(value) => {
                  if (value && !formData.genres.includes(value)) {
                    setFormData(prev => ({
                      ...prev,
                      genres: [...prev.genres, value]
                    }));
                  }
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Action">Action</SelectItem>
                  <SelectItem value="Adventure">Adventure</SelectItem>
                  <SelectItem value="Animation">Animation</SelectItem>
                  <SelectItem value="Biography">Biography</SelectItem>
                  <SelectItem value="Comedy">Comedy</SelectItem>
                  <SelectItem value="Crime">Crime</SelectItem>
                  <SelectItem value="Documentary">Documentary</SelectItem>
                  <SelectItem value="Drama">Drama</SelectItem>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Fantasy">Fantasy</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Horror">Horror</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                  <SelectItem value="Musical">Musical</SelectItem>
                  <SelectItem value="Mystery">Mystery</SelectItem>
                  <SelectItem value="Romance">Romance</SelectItem>
                  <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                  <SelectItem value="Sport">Sport</SelectItem>
                  <SelectItem value="Thriller">Thriller</SelectItem>
                  <SelectItem value="War">War</SelectItem>
                  <SelectItem value="Western">Western</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                placeholder="Or add custom genre"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addGenre();
                  }
                }}
              />
              <Button type="button" onClick={addGenre} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.genres.map((genre, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {genre}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeGenre(genre)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Release Date */}
          <div className="space-y-2">
            <Label htmlFor="releaseDate">Release Date *</Label>
            <Input
              id="releaseDate"
              type="date"
              value={formData.releaseDate}
              onChange={(e) => handleInputChange("releaseDate", e.target.value)}
              required
            />
          </div>

          {/* Rating Type and Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ratingType">Rating Type *</Label>
              <Select 
                value={formData.ratingType} 
                onValueChange={(value) => handleInputChange("ratingType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="G">G</SelectItem>
                  <SelectItem value="PG">PG</SelectItem>
                  <SelectItem value="PG-13">PG-13</SelectItem>
                  <SelectItem value="R">R</SelectItem>
                  <SelectItem value="NC-17">NC-17</SelectItem>
                  <SelectItem value="TV-Y">TV-Y</SelectItem>
                  <SelectItem value="TV-Y7">TV-Y7</SelectItem>
                  <SelectItem value="TV-G">TV-G</SelectItem>
                  <SelectItem value="TV-PG">TV-PG</SelectItem>
                  <SelectItem value="TV-14">TV-14</SelectItem>
                  <SelectItem value="TV-MA">TV-MA</SelectItem>
                  <SelectItem value="Not Rated">Not Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0.0 - 10.0) *</Label>
              <Input
                id="rating"
                type="number"
                min="0.0"
                max="10.0"
                step="0.1"
                value={formData.rating}
                onChange={(e) => handleInputChange("rating", parseFloat(e.target.value) || 0)}
                placeholder="Enter rating between 0.0 and 10.0"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter description"
              rows={4}
              required
            />
          </div>

          {/* Thumbnail URL */}
          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input
              id="thumbnailUrl"
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) => handleInputChange("thumbnailUrl", e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>

          {/* Trailer URL */}
          <div className="space-y-2">
            <Label htmlFor="trailerUrl">Trailer URL</Label>
            <Input
              id="trailerUrl"
              type="url"
              value={formData.trailerUrl}
              onChange={(e) => handleInputChange("trailerUrl", e.target.value)}
              placeholder="https://example.com/trailer.mp4"
            />
          </div>

          {/* Section Order */}
          <div className="space-y-2">
            <Label htmlFor="sectionOrder">Section Order</Label>
            <Input
              id="sectionOrder"
              type="number"
              min="0"
              value={formData.sectionOrder}
              onChange={(e) => handleInputChange("sectionOrder", parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button 
              type="submit" 
              disabled={createUpcomingContentMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {createUpcomingContentMutation.isPending ? "Creating..." : "Create Content"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UpcomingUploadForm;
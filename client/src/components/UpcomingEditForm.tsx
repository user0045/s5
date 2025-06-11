
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UpcomingContent {
  id: string;
  title: string;
  genres: string[];
  episodes: number | null;
  release_date: string;
  description: string;
  type: "movie" | "tv";
  rating_type: string;
  rating: number;
  thumbnail_url: string | null;
  trailer_url: string | null;
  section_order: number;
}

interface UpcomingEditFormProps {
  contentId: string;
  onCancel: () => void;
  onSave: () => void;
}

const UpcomingEditForm = ({ contentId, onCancel, onSave }: UpcomingEditFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<UpcomingContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newGenre, setNewGenre] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from('upcoming_content')
        .select('*')
        .eq('id', contentId)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load upcoming content",
          variant: "destructive"
        });
        return;
      }

      // Properly convert the JSONB genres field to string array
      const genres = Array.isArray(data.genres) ? data.genres as string[] : [];

      const typedData: UpcomingContent = {
        id: data.id,
        title: data.title,
        type: data.type as "movie" | "tv",
        genres: genres,
        episodes: data.episodes,
        release_date: data.release_date,
        description: data.description,
        rating_type: data.rating_type,
        rating: data.rating / 10, // Convert from integer back to decimal
        thumbnail_url: data.thumbnail_url,
        trailer_url: data.trailer_url,
        section_order: data.section_order
      };

      setFormData(typedData);
      setIsLoading(false);
    };

    fetchContent();
  }, [contentId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    if (formData.genres.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one genre",
        variant: "destructive"
      });
      return;
    }

    if (!formData.rating_type) {
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

    if (formData.section_order < 1 || formData.section_order > 20) {
      toast({
        title: "Error",
        description: "Section order must be between 1 and 20",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('upcoming_content')
      .update({
        title: formData.title,
        type: formData.type,
        genres: formData.genres,
        episodes: formData.type === "tv" ? formData.episodes : null,
        release_date: formData.release_date,
        description: formData.description,
        rating_type: formData.rating_type,
        rating: Math.round(formData.rating * 10), // Convert to integer
        thumbnail_url: formData.thumbnail_url,
        trailer_url: formData.trailer_url,
        section_order: formData.section_order,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update upcoming content",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Success",
      description: "Upcoming content updated successfully!"
    });
    
    onSave();
  };

  const handleInputChange = (field: keyof UpcomingContent, value: string | number | string[]) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const addGenre = () => {
    if (newGenre.trim() && formData && !formData.genres.includes(newGenre.trim())) {
      setFormData({
        ...formData,
        genres: [...formData.genres, newGenre.trim()]
      });
      setNewGenre("");
    }
  };

  const removeGenre = (genreToRemove: string) => {
    if (formData) {
      setFormData({
        ...formData,
        genres: formData.genres.filter(genre => genre !== genreToRemove)
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!formData) {
    return <div>Content not found</div>;
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Edit Upcoming Content</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "movie" | "tv") => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="movie">Movie</SelectItem>
                  <SelectItem value="tv">TV Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Genres *</Label>
            <div className="flex gap-2 mb-2">
              <Select 
                value="" 
                onValueChange={(value) => {
                  if (value && formData && !formData.genres.includes(value)) {
                    setFormData({
                      ...formData,
                      genres: [...formData.genres, value]
                    });
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
              <Button type="button" onClick={addGenre} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.genres.map((genre) => (
                <Badge key={genre} variant="secondary" className="flex items-center gap-1">
                  {genre}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeGenre(genre)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.type === "tv" && (
              <div className="space-y-2">
                <Label htmlFor="episodes">Number of Episodes</Label>
                <Input
                  id="episodes"
                  type="number"
                  min="1"
                  value={formData.episodes || ""}
                  onChange={(e) => handleInputChange("episodes", e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="release_date">Release Date</Label>
              <Input
                id="release_date"
                type="date"
                value={formData.release_date}
                onChange={(e) => handleInputChange("release_date", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="section_order">Section Order</Label>
              <Input
                id="section_order"
                type="number"
                min="1"
                max="20"
                value={formData.section_order}
                onChange={(e) => handleInputChange("section_order", parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating_type">Rating Type</Label>
              <Select
                value={formData.rating_type}
                onValueChange={(value: string) => handleInputChange("rating_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
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
              <Label htmlFor="rating">Rating (0.0 - 10.0)</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={formData.rating || ""}
                onChange={(e) => handleInputChange("rating", e.target.value ? parseFloat(e.target.value) : 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
              <Input
                id="thumbnail_url"
                value={formData.thumbnail_url || ""}
                onChange={(e) => handleInputChange("thumbnail_url", e.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="trailer_url">Trailer URL</Label>
            <Input
              id="trailer_url"
              value={formData.trailer_url || ""}
              onChange={(e) => handleInputChange("trailer_url", e.target.value)}
              placeholder="https://example.com/trailer.mp4"
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UpcomingEditForm;

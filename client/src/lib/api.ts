
import { supabase } from "@/integrations/supabase/client";

// API endpoints to match existing queryClient usage
export const apiEndpoints = {
  '/api/content': async () => {
    const { data, error } = await supabase
      .from('upload_content')
      .select(`
        *,
        movies!inner(*),
        tv_shows!inner(*, seasons(*, episodes(*)))
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      title: item.title,
      type: item.content_type,
      genres: item.genres,
      createdAt: item.created_at,
      // Movie specific fields
      description: item.movies?.description,
      releaseYear: item.movies?.release_year,
      rating: item.movies?.rating_type,
      numericalRating: item.movies?.rating ? item.movies.rating / 10 : 0,
      director: item.movies?.director,
      writer: item.movies?.writer,
      cast: item.movies?.cast || [],
      thumbnailUrl: item.movies?.thumbnail_url,
      videoUrl: item.movies?.video_url,
      trailerUrl: item.movies?.trailer_url,
      featureIn: item.movies?.feature_in || [],
      // TV Show specific fields
      seasons: item.tv_shows?.seasons || []
    }));
  },

  '/api/content/published': async () => {
    const { data, error } = await supabase
      .from('upload_content')
      .select(`
        *,
        movies(*),
        tv_shows(*, seasons(*, episodes(*)))
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(item => {
      const isMovie = item.content_type === 'movie';
      const contentData = isMovie ? item.movies : item.tv_shows?.seasons?.[0];
      
      return {
        id: item.id,
        title: item.title,
        type: item.content_type,
        genres: item.genres,
        createdAt: item.created_at,
        description: contentData?.description || contentData?.season_description,
        releaseYear: contentData?.release_year,
        rating: contentData?.rating_type,
        numericalRating: contentData?.rating ? contentData.rating / 10 : 0,
        director: contentData?.director,
        writer: contentData?.writer,
        cast: contentData?.cast || [],
        thumbnailUrl: contentData?.thumbnail_url,
        videoUrl: isMovie ? contentData?.video_url : null,
        trailerUrl: contentData?.trailer_url,
        featureIn: contentData?.feature_in || [],
        seasons: item.tv_shows?.seasons || []
      };
    });
  },

  '/api/upcoming-content': async () => {
    const { data, error } = await supabase
      .from('upcoming_content')
      .select('*')
      .order('section_order', { ascending: true });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      title: item.title,
      type: item.content_type,
      genres: item.genres,
      episodes: item.number_of_episodes,
      releaseDate: item.release_date,
      description: item.description,
      thumbnailUrl: item.thumbnail_url,
      trailerUrl: item.trailer_url,
      sectionOrder: item.section_order,
      rating: item.rating_type,
      numericalRating: item.rating / 10
    }));
  },

  '/api/analytics': async () => {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// Mock the apiRequest function to use our Supabase endpoints
export const apiRequest = async (endpoint: string, options?: any) => {
  if (endpoint in apiEndpoints) {
    return { data: await apiEndpoints[endpoint as keyof typeof apiEndpoints]() };
  }
  
  // Handle DELETE requests
  if (options?.method === 'DELETE' && endpoint.startsWith('/api/content/')) {
    const id = endpoint.split('/').pop();
    const { error } = await supabase
      .from('upload_content')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { data: { success: true } };
  }
  
  // Handle POST requests for analytics
  if (endpoint === '/api/analytics' && options?.method === 'POST') {
    const data = JSON.parse(options.body);
    const { data: result, error } = await supabase
      .from('analytics')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return { data: result };
  }
  
  throw new Error(`Endpoint ${endpoint} not implemented`);
};

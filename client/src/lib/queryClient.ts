
import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Create a query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// API request function that uses Supabase
export const apiRequest = async (endpoint: string, options?: any) => {
  // Handle content endpoints
  if (endpoint === '/api/content' && options?.method === 'POST') {
    const data = JSON.parse(options.body);
    const { data: result, error } = await supabase
      .from('content')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return { data: result };
  }
  
  if (endpoint === '/api/upcoming-content' && options?.method === 'POST') {
    const data = JSON.parse(options.body);
    const { data: result, error } = await supabase
      .from('upcoming_content')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return { data: result };
  }
  
  // Handle DELETE requests
  if (options?.method === 'DELETE' && endpoint.startsWith('/api/content/')) {
    const id = endpoint.split('/').pop();
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { data: { success: true } };
  }
  
  throw new Error(`Endpoint ${endpoint} not implemented`);
};

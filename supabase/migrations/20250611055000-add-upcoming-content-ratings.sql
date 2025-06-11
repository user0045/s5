
-- Add rating_type and rating columns to upcoming_content table
ALTER TABLE public.upcoming_content 
ADD COLUMN rating_type TEXT NOT NULL DEFAULT 'PG',
ADD COLUMN rating INTEGER NOT NULL DEFAULT 0;

-- Add check constraint for rating range (0-100, representing 0.0-10.0)
ALTER TABLE public.upcoming_content 
ADD CONSTRAINT upcoming_content_rating_range CHECK (rating >= 0 AND rating <= 100);

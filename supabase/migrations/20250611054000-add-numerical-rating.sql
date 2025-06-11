
-- Add new numerical rating column and rename existing rating column
ALTER TABLE public.content 
ADD COLUMN rating_numeric INTEGER,
ADD COLUMN rating_type TEXT;

-- Copy existing rating values to rating_type
UPDATE public.content SET rating_type = rating;

-- Add constraints
ALTER TABLE public.content 
ALTER COLUMN rating_type SET NOT NULL,
ALTER COLUMN rating_numeric SET NOT NULL DEFAULT 0;

-- Add check constraint for rating range (0-100, representing 0.0-10.0)
ALTER TABLE public.content 
ADD CONSTRAINT content_rating_range CHECK (rating_numeric >= 0 AND rating_numeric <= 100);

-- Drop old rating column and rename new columns
ALTER TABLE public.content DROP COLUMN rating;
ALTER TABLE public.content RENAME COLUMN rating_numeric TO rating;

-- Do the same for seasons table if it exists
ALTER TABLE IF EXISTS public.seasons 
ADD COLUMN rating_numeric INTEGER,
ADD COLUMN rating_type TEXT;

UPDATE public.seasons SET rating_type = rating WHERE rating IS NOT NULL;

ALTER TABLE IF EXISTS public.seasons 
ALTER COLUMN rating_type SET NOT NULL DEFAULT 'PG',
ALTER COLUMN rating_numeric SET NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS public.seasons 
ADD CONSTRAINT seasons_rating_range CHECK (rating_numeric >= 0 AND rating_numeric <= 100);

ALTER TABLE IF EXISTS public.seasons DROP COLUMN IF EXISTS rating;
ALTER TABLE IF EXISTS public.seasons RENAME COLUMN rating_numeric TO rating;

-- Do the same for episodes table if it exists  
ALTER TABLE IF EXISTS public.episodes 
ADD COLUMN rating_numeric INTEGER,
ADD COLUMN rating_type TEXT;

UPDATE public.episodes SET rating_type = rating WHERE rating IS NOT NULL;

ALTER TABLE IF EXISTS public.episodes 
ALTER COLUMN rating_numeric SET NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS public.episodes 
ADD CONSTRAINT episodes_rating_range CHECK (rating_numeric >= 0 AND rating_numeric <= 100);

ALTER TABLE IF EXISTS public.episodes DROP COLUMN IF EXISTS rating;
ALTER TABLE IF EXISTS public.episodes RENAME COLUMN rating_numeric TO rating;

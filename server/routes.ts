
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUploadContentSchema, 
  insertUpcomingContentSchema, 
  insertMovieSchema,
  insertTvShowSchema,
  insertSeasonSchema,
  insertEpisodeSchema,
  insertAnalyticsSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload Content routes
  app.get('/api/upload-content', async (req, res) => {
    try {
      const content = await storage.getAllUploadContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch upload content' });
    }
  });

  app.get('/api/upload-content/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const content = await storage.getUploadContentById(id);
      if (!content) {
        return res.status(404).json({ error: 'Upload content not found' });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch upload content' });
    }
  });

  app.post('/api/upload-content', async (req, res) => {
    try {
      const validatedData = insertUploadContentSchema.parse(req.body);
      const content = await storage.createUploadContent(validatedData);
      res.json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create upload content' });
    }
  });

  app.put('/api/upload-content/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertUploadContentSchema.partial().parse(req.body);
      const content = await storage.updateUploadContent(id, validatedData);
      if (!content) {
        return res.status(404).json({ error: 'Upload content not found' });
      }
      res.json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update upload content' });
    }
  });

  app.delete('/api/upload-content/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUploadContent(id);
      if (!success) {
        return res.status(404).json({ error: 'Upload content not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete upload content' });
    }
  });

  // Upcoming content routes
  app.get('/api/upcoming-content', async (req, res) => {
    try {
      const content = await storage.getAllUpcomingContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch upcoming content' });
    }
  });

  app.get('/api/upcoming-content/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const content = await storage.getUpcomingContentById(id);
      if (!content) {
        return res.status(404).json({ error: 'Upcoming content not found' });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch upcoming content' });
    }
  });

  app.post('/api/upcoming-content', async (req, res) => {
    try {
      const data = {
        ...req.body,
        releaseDate: new Date(req.body.releaseDate)
      };
      const content = await storage.createUpcomingContent(data);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create upcoming content' });
    }
  });

  app.put('/api/upcoming-content/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertUpcomingContentSchema.partial().parse(req.body);
      const content = await storage.updateUpcomingContent(id, validatedData);
      if (!content) {
        return res.status(404).json({ error: 'Upcoming content not found' });
      }
      res.json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update upcoming content' });
    }
  });

  app.delete('/api/upcoming-content/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUpcomingContent(id);
      if (!success) {
        return res.status(404).json({ error: 'Upcoming content not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete upcoming content' });
    }
  });

  // Movies routes
  app.get('/api/movies', async (req, res) => {
    try {
      const movies = await storage.getAllMovies();
      res.json(movies);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch movies' });
    }
  });

  app.get('/api/movies/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const movie = await storage.getMovieById(id);
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      res.json(movie);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch movie' });
    }
  });

  app.post('/api/movies', async (req, res) => {
    try {
      const validatedData = insertMovieSchema.parse(req.body);
      const movie = await storage.createMovie(validatedData);
      res.json(movie);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create movie' });
    }
  });

  app.put('/api/movies/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMovieSchema.partial().parse(req.body);
      const movie = await storage.updateMovie(id, validatedData);
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      res.json(movie);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update movie' });
    }
  });

  app.delete('/api/movies/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMovie(id);
      if (!success) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete movie' });
    }
  });

  // TV Shows routes
  app.get('/api/tv-shows', async (req, res) => {
    try {
      const tvShows = await storage.getAllTvShows();
      res.json(tvShows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch TV shows' });
    }
  });

  app.post('/api/tv-shows', async (req, res) => {
    try {
      const validatedData = insertTvShowSchema.parse(req.body);
      const tvShow = await storage.createTvShow(validatedData);
      res.json(tvShow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create TV show' });
    }
  });

  // Seasons routes
  app.get('/api/seasons', async (req, res) => {
    try {
      const seasons = await storage.getAllSeasons();
      res.json(seasons);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch seasons' });
    }
  });

  app.post('/api/seasons', async (req, res) => {
    try {
      const validatedData = insertSeasonSchema.parse(req.body);
      const season = await storage.createSeason(validatedData);
      res.json(season);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create season' });
    }
  });

  // Episodes routes
  app.get('/api/episodes', async (req, res) => {
    try {
      const episodes = await storage.getAllEpisodes();
      res.json(episodes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch episodes' });
    }
  });

  app.post('/api/episodes', async (req, res) => {
    try {
      const validatedData = insertEpisodeSchema.parse(req.body);
      const episode = await storage.createEpisode(validatedData);
      res.json(episode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create episode' });
    }
  });

  // Analytics routes
  app.post('/api/analytics', async (req, res) => {
    try {
      const validatedData = insertAnalyticsSchema.parse(req.body);
      const event = await storage.createAnalyticsEvent(validatedData);
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create analytics event' });
    }
  });

  app.get('/api/analytics', async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  app.get('/api/analytics/:contentId', async (req, res) => {
    try {
      const contentId = parseInt(req.params.contentId);
      const analytics = await storage.getAnalyticsByContentId(contentId);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch content analytics' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

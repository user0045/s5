
import { pgTable, text, serial, integer, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Upload Content table
export const uploadContent = pgTable("upload_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  contentType: text("content_type").notNull(), // "movie" or "tv_show"
  genres: text("genres").array().notNull(),
  contentId: integer("content_id").notNull(), // Foreign key to movies or tv_shows
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Upcoming Content table
export const upcomingContent = pgTable("upcoming_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  contentType: text("content_type").notNull(), // "movie" or "tv_show"
  genres: text("genres").array().notNull(),
  releaseDate: timestamp("release_date").notNull(),
  sectionOrder: integer("section_order").notNull(),
  ratingType: text("rating_type").notNull(),
  rating: integer("rating").notNull(), // stored as integer (multiplied by 10)
  thumbnailUrl: text("thumbnail_url"),
  description: text("description").notNull(),
  trailerUrl: text("trailer_url"),
  numberOfEpisodes: integer("number_of_episodes"), // N/A if contentType="movie"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Movies table
export const movies = pgTable("movies", {
  contentId: serial("content_id").primaryKey(),
  description: text("description"),
  releaseYear: integer("release_year"),
  ratingType: text("rating_type").notNull(),
  rating: integer("rating").notNull(), // stored as integer (multiplied by 10)
  director: text("director"),
  writer: text("writer"),
  cast: text("cast").array(),
  thumbnailUrl: text("thumbnail_url"),
  trailerUrl: text("trailer_url"),
  videoUrl: text("video_url"),
  featureIn: text("feature_in").array(), // can be multiple
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// TV Shows table
export const tvShows = pgTable("tv_shows", {
  contentId: serial("content_id").primaryKey(),
  seasonIdList: integer("season_id_list").array(), // collection of foreign keys
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Seasons table
export const seasons = pgTable("seasons", {
  seasonId: serial("season_id").primaryKey(),
  seasonDescription: text("season_description"),
  releaseYear: integer("release_year"),
  ratingType: text("rating_type").notNull(),
  rating: integer("rating").notNull(), // stored as integer (multiplied by 10)
  director: text("director"),
  writer: text("writer"),
  cast: text("cast").array(),
  thumbnailUrl: text("thumbnail_url"),
  trailerUrl: text("trailer_url"),
  featureIn: text("feature_in").array(), // can be multiple
  episodeIdList: integer("episode_id_list").array(), // collection of foreign keys
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Episodes table
export const episodes = pgTable("episodes", {
  episodeId: serial("episode_id").primaryKey(),
  title: text("title").notNull(),
  duration: text("duration"),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Analytics table
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id"),
  eventType: text("event_type").notNull(), // "view", "play", "like", "add_to_list"
  userId: integer("user_id").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: json("metadata"), // Additional event data
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertUploadContentSchema = createInsertSchema(uploadContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUpcomingContentSchema = createInsertSchema(upcomingContent).omit({
  id: true,
  createdAt: true,
}).extend({
  releaseDate: z.string().transform((str) => new Date(str))
});

export const insertMovieSchema = createInsertSchema(movies).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertTvShowSchema = createInsertSchema(tvShows).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertSeasonSchema = createInsertSchema(seasons).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertEpisodeSchema = createInsertSchema(episodes).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UploadContent = typeof uploadContent.$inferSelect;
export type InsertUploadContent = z.infer<typeof insertUploadContentSchema>;

export type UpcomingContent = typeof upcomingContent.$inferSelect;
export type InsertUpcomingContent = z.infer<typeof insertUpcomingContentSchema>;

export type Movie = typeof movies.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;

export type TvShow = typeof tvShows.$inferSelect;
export type InsertTvShow = z.infer<typeof insertTvShowSchema>;

export type Season = typeof seasons.$inferSelect;
export type InsertSeason = z.infer<typeof insertSeasonSchema>;

export type Episode = typeof episodes.$inferSelect;
export type InsertEpisode = z.infer<typeof insertEpisodeSchema>;

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

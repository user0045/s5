import { db } from "./db";
import { 
  uploadContent, 
  upcomingContent, 
  movies, 
  tvShows, 
  seasons, 
  episodes, 
  analytics,
  type InsertUploadContent,
  type InsertUpcomingContent,
  type InsertMovie,
  type InsertTvShow,
  type InsertSeason,
  type InsertEpisode,
  type InsertAnalytics
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export const storage = {
  // Upload Content operations
  async getAllUploadContent() {
    return db.select().from(uploadContent).orderBy(desc(uploadContent.createdAt));
  },

  async getUploadContentById(id: number) {
    const result = await db.select().from(uploadContent).where(eq(uploadContent.id, id));
    return result[0] || null;
  },

  async createUploadContent(data: InsertUploadContent) {
    const result = await db.insert(uploadContent).values(data).returning();
    return result[0];
  },

  async updateUploadContent(id: number, data: Partial<InsertUploadContent>) {
    const result = await db.update(uploadContent)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(uploadContent.id, id))
      .returning();
    return result[0] || null;
  },

  async deleteUploadContent(id: number) {
    const result = await db.delete(uploadContent).where(eq(uploadContent.id, id)).returning();
    return result.length > 0;
  },

  // Upcoming Content operations
  async getAllUpcomingContent() {
    return db.select().from(upcomingContent).orderBy(upcomingContent.sectionOrder);
  },

  async getUpcomingContentById(id: number) {
    const result = await db.select().from(upcomingContent).where(eq(upcomingContent.id, id));
    return result[0] || null;
  },

  async createUpcomingContent(data: InsertUpcomingContent) {
    const result = await db.insert(upcomingContent).values(data).returning();
    return result[0];
  },

  async updateUpcomingContent(id: number, data: Partial<InsertUpcomingContent>) {
    const result = await db.update(upcomingContent)
      .set(data)
      .where(eq(upcomingContent.id, id))
      .returning();
    return result[0] || null;
  },

  async deleteUpcomingContent(id: number) {
    const result = await db.delete(upcomingContent).where(eq(upcomingContent.id, id)).returning();
    return result.length > 0;
  },

  // Movies operations
  async getAllMovies() {
    return db.select().from(movies).orderBy(desc(movies.createdAt));
  },

  async getMovieById(contentId: number) {
    const result = await db.select().from(movies).where(eq(movies.contentId, contentId));
    return result[0] || null;
  },

  async createMovie(data: InsertMovie) {
    const result = await db.insert(movies).values(data).returning();
    return result[0];
  },

  async updateMovie(contentId: number, data: Partial<InsertMovie>) {
    const result = await db.update(movies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(movies.contentId, contentId))
      .returning();
    return result[0] || null;
  },

  async deleteMovie(contentId: number) {
    const result = await db.delete(movies).where(eq(movies.contentId, contentId)).returning();
    return result.length > 0;
  },

  // TV Shows operations
  async getAllTvShows() {
    return db.select().from(tvShows).orderBy(desc(tvShows.createdAt));
  },

  async getTvShowById(contentId: number) {
    const result = await db.select().from(tvShows).where(eq(tvShows.contentId, contentId));
    return result[0] || null;
  },

  async createTvShow(data: InsertTvShow) {
    const result = await db.insert(tvShows).values(data).returning();
    return result[0];
  },

  async updateTvShow(contentId: number, data: Partial<InsertTvShow>) {
    const result = await db.update(tvShows)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tvShows.contentId, contentId))
      .returning();
    return result[0] || null;
  },

  async deleteTvShow(contentId: number) {
    const result = await db.delete(tvShows).where(eq(tvShows.contentId, contentId)).returning();
    return result.length > 0;
  },

  // Seasons operations
  async getAllSeasons() {
    return db.select().from(seasons).orderBy(desc(seasons.createdAt));
  },

  async getSeasonById(seasonId: number) {
    const result = await db.select().from(seasons).where(eq(seasons.seasonId, seasonId));
    return result[0] || null;
  },

  async createSeason(data: InsertSeason) {
    const result = await db.insert(seasons).values(data).returning();
    return result[0];
  },

  async updateSeason(seasonId: number, data: Partial<InsertSeason>) {
    const result = await db.update(seasons)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(seasons.seasonId, seasonId))
      .returning();
    return result[0] || null;
  },

  async deleteSeason(seasonId: number) {
    const result = await db.delete(seasons).where(eq(seasons.seasonId, seasonId)).returning();
    return result.length > 0;
  },

  // Episodes operations
  async getAllEpisodes() {
    return db.select().from(episodes).orderBy(desc(episodes.createdAt));
  },

  async getEpisodeById(episodeId: number) {
    const result = await db.select().from(episodes).where(eq(episodes.episodeId, episodeId));
    return result[0] || null;
  },

  async createEpisode(data: InsertEpisode) {
    const result = await db.insert(episodes).values(data).returning();
    return result[0];
  },

  async updateEpisode(episodeId: number, data: Partial<InsertEpisode>) {
    const result = await db.update(episodes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(episodes.episodeId, episodeId))
      .returning();
    return result[0] || null;
  },

  async deleteEpisode(episodeId: number) {
    const result = await db.delete(episodes).where(eq(episodes.episodeId, episodeId)).returning();
    return result.length > 0;
  },

  // Analytics operations
  async createAnalyticsEvent(data: InsertAnalytics) {
    const result = await db.insert(analytics).values(data).returning();
    return result[0];
  },

  async getAnalytics() {
    return db.select().from(analytics).orderBy(desc(analytics.timestamp));
  },

  async getAnalyticsByContentId(contentId: number) {
    return db.select().from(analytics).where(eq(analytics.contentId, contentId)).orderBy(desc(analytics.timestamp));
  },
};
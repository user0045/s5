CREATE TABLE "analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" integer,
	"event_type" text NOT NULL,
	"user_id" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE "content" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"genres" text[] NOT NULL,
	"description" text,
	"release_year" integer,
	"rating_type" text NOT NULL,
	"rating" integer NOT NULL,
	"director" text,
	"writer" text,
	"cast" text[],
	"thumbnail_url" text,
	"trailer_url" text,
	"video_url" text,
	"views" integer DEFAULT 0,
	"home_hero" boolean DEFAULT false,
	"type_page_hero" boolean DEFAULT false,
	"home_new_release" boolean DEFAULT false,
	"type_page_new_release" boolean DEFAULT false,
	"home_popular" boolean DEFAULT false,
	"type_page_popular" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "episodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"season_id" integer NOT NULL,
	"episode_number" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"duration" text,
	"video_url" text,
	"thumbnail_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" integer NOT NULL,
	"season_number" integer NOT NULL,
	"description" text,
	"release_year" integer,
	"rating_type" text NOT NULL,
	"rating" integer NOT NULL,
	"director" text,
	"writer" text,
	"cast" text[],
	"thumbnail_url" text,
	"trailer_url" text,
	"home_hero" boolean DEFAULT false,
	"type_page_hero" boolean DEFAULT false,
	"home_new_release" boolean DEFAULT false,
	"type_page_new_release" boolean DEFAULT false,
	"home_popular" boolean DEFAULT false,
	"type_page_popular" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "upcoming_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"genres" text[] NOT NULL,
	"episodes" integer,
	"release_date" timestamp NOT NULL,
	"description" text NOT NULL,
	"thumbnail_url" text,
	"trailer_url" text,
	"section_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE no action ON UPDATE no action;
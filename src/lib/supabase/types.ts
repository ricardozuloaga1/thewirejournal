// Database types for Supabase
// These match the schema defined in schema.sql

export type ArticleStatus = 'draft' | 'published' | 'discarded';
export type ImageType = 'extracted' | 'licensed' | 'ai_generated';
export type AgentRunStatus = 'success' | 'error' | 'running';
export type Section = 'politics' | 'economics' | 'opinion' | 'world' | 'business' | 'tech';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  section: Section;
  image_id: string | null;
  sources: ArticleSource[];
  quality_score: number;
  status: ArticleStatus;
  slug: string;
  author: string;
  read_time: string;
  created_at: string;
  updated_at: string;
}

export interface ArticleSource {
  url: string;
  title: string;
  snippet?: string;
}

export interface Image {
  id: string;
  article_id: string | null;
  image_type: ImageType;
  url: string;
  origin_url: string | null;
  prompt: string | null;
  alt_text: string;
  created_at: string;
}

export interface AgentRun {
  id: string;
  agent_name: string;
  run_time: string;
  articles_created: number;
  status: AgentRunStatus;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Supabase Database type for type-safe queries
export interface Database {
  public: {
    Tables: {
      articles: {
        Row: Article;
        Insert: Omit<Article, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Article, 'id' | 'created_at'>>;
      };
      images: {
        Row: Image;
        Insert: Omit<Image, 'id' | 'created_at'>;
        Update: Partial<Omit<Image, 'id' | 'created_at'>>;
      };
      agent_runs: {
        Row: AgentRun;
        Insert: Omit<AgentRun, 'id' | 'created_at'>;
        Update: Partial<Omit<AgentRun, 'id' | 'created_at'>>;
      };
    };
  };
}



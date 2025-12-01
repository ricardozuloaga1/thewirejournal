/**
 * Article fetching utilities for the public website
 */

import { supabase, isSupabaseConfigured } from './supabase/client';
import type { Article } from './supabase/types';

export interface PublishedArticle {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  section: string;
  slug: string;
  author: string;
  readTime: string;
  createdAt: string;
  imageUrl?: string;
}

const MOCK_ARTICLES: PublishedArticle[] = [
  {
    id: 'mock-1',
    title: 'Global Markets Rally as Inflation Shows Signs of Cooling',
    excerpt: 'Investors are increasingly optimistic that central banks may soon pause interest rate hikes as new data points to easing price pressures across major economies.',
    body: 'Full article content would go here...',
    section: 'economics',
    slug: 'global-markets-rally-inflation-cooling',
    author: 'Markets Team',
    readTime: '5 min read',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    title: 'Tech Giants Race to Integrate AI into Core Products',
    excerpt: 'Silicon Valley leaders are pivoting strategies to prioritize generative AI, sparking a new wave of competition and innovation in the sector.',
    body: 'Full article content would go here...',
    section: 'tech',
    slug: 'tech-giants-race-integrate-ai',
    author: 'Tech Reporter',
    readTime: '4 min read',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    title: 'New Policy Shifts Reshape Energy Landscape',
    excerpt: 'Recent legislative changes are driving a surge in renewable energy investments while traditional energy sectors face new regulatory challenges.',
    body: 'Full article content would go here...',
    section: 'business',
    slug: 'policy-shifts-reshape-energy',
    author: 'Energy Bureau',
    readTime: '6 min read',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-4',
    title: 'Geopolitical Tensions Rise in Eastern Europe',
    excerpt: 'Diplomatic efforts intensify as border disputes escalate, drawing attention from international leaders and organizations.',
    body: 'Full article content would go here...',
    section: 'world',
    slug: 'geopolitical-tensions-eastern-europe',
    author: 'Foreign Desk',
    readTime: '5 min read',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-5',
    title: 'The Future of Remote Work: Hybrid Models Prevail',
    excerpt: 'Companies are finding a middle ground with hybrid work policies, balancing flexibility with the need for in-person collaboration.',
    body: 'Full article content would go here...',
    section: 'business',
    slug: 'future-remote-work-hybrid',
    author: 'Workplace Reporter',
    readTime: '3 min read',
    createdAt: new Date().toISOString(),
  },
    {
    id: 'mock-6',
    title: 'Opinion: The Case for Economic Optimism',
    excerpt: 'Despite headwinds, the fundamentals of the global economy remain more resilient than critics suggest.',
    body: 'Full article content would go here...',
    section: 'opinion',
    slug: 'opinion-case-economic-optimism',
    author: 'Guest Contributor',
    readTime: '4 min read',
    createdAt: new Date().toISOString(),
  }
];

/**
 * Get published articles for the homepage
 */
export async function getPublishedArticles(limit = 20): Promise<PublishedArticle[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_ARTICLES.slice(0, limit);
  }

  // Join with images table to get image URL
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      images!articles_image_id_fkey (url)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch articles:', error);
    return [];
  }

  return (data || []).map(mapArticleWithImage);
}

/**
 * Get articles by section
 */
export async function getArticlesBySection(
  section: string,
  limit = 10
): Promise<PublishedArticle[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_ARTICLES.filter(a => a.section === section).slice(0, limit);
  }

  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      images!articles_image_id_fkey (url)
    `)
    .eq('status', 'published')
    .eq('section', section)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch articles:', error);
    return [];
  }

  return (data || []).map(mapArticleWithImage);
}

/**
 * Get the lead story (designated or highest quality)
 */
export async function getLeadStory(): Promise<PublishedArticle | null> {
  if (!isSupabaseConfigured()) {
    return MOCK_ARTICLES[0];
  }

  // First, check if there's a designated lead article
  const { data: settings } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'lead_article_id')
    .single();

  if (settings?.value) {
    // Get the designated lead article with image
    const { data: leadArticle } = await supabase
      .from('articles')
      .select(`
        *,
        images!articles_image_id_fkey (url)
      `)
      .eq('id', settings.value)
      .eq('status', 'published')
      .single();

    if (leadArticle) {
      return mapArticleWithImage(leadArticle);
    }
  }

  // Fallback: get highest quality recent article with image
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      images!articles_image_id_fkey (url)
    `)
    .eq('status', 'published')
    .order('quality_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return mapArticleWithImage(data);
}

/**
 * Get article by slug
 */
export async function getArticleBySlug(slug: string): Promise<PublishedArticle | null> {
  if (!isSupabaseConfigured()) {
     return MOCK_ARTICLES.find(a => a.slug === slug) || null;
  }

  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      images!articles_image_id_fkey (url)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    return null;
  }

  return mapArticleWithImage(data);
}

/**
 * Get opinion articles
 */
export async function getOpinionArticles(limit = 4): Promise<PublishedArticle[]> {
  return getArticlesBySection('opinion', limit);
}

/**
 * Get latest news headlines (for What's News sidebar)
 */
export async function getLatestHeadlines(limit = 8): Promise<{ title: string; section: string; slug: string }[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_ARTICLES.map(a => ({ title: a.title, section: a.section, slug: a.slug })).slice(0, limit);
  }

  const { data, error } = await supabase
    .from('articles')
    .select('title, section, slug')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return data || [];
}


// Helper to map DB article to frontend format (without image join)
function mapArticle(article: Article): PublishedArticle {
  return {
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    body: article.body,
    section: article.section,
    slug: article.slug,
    author: article.author,
    readTime: article.read_time,
    createdAt: article.created_at,
  };
}

// Helper to map DB article with joined image data
interface ArticleWithImage extends Article {
  images?: { url: string } | null;
}

function mapArticleWithImage(article: ArticleWithImage): PublishedArticle {
  return {
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    body: article.body,
    section: article.section,
    slug: article.slug,
    author: article.author,
    readTime: article.read_time,
    createdAt: article.created_at,
    imageUrl: article.images?.url || undefined,
  };
}


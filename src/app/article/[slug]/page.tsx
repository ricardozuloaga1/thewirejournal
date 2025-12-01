import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getArticleBySlug } from '@/lib/articles';
import { markdownToHtml } from '@/lib/markdown';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Category */}
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {article.section}
        </span>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight mt-2 mb-4">
          {article.title}
        </h1>

        {/* Excerpt */}
        <p className="text-xl font-serif text-gray-600 leading-relaxed mb-6 border-l-4 border-gray-300 pl-4 italic">
          {article.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
          <span className="font-semibold">{article.author}</span>
          <span>•</span>
          <span>{article.readTime}</span>
          <span>•</span>
          <time dateTime={article.createdAt}>
            {new Date(article.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
        </div>

        {/* Article Image */}
        {article.imageUrl ? (
          <div className="w-full h-64 md:h-96 mb-8 rounded overflow-hidden">
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-64 md:h-96 bg-gray-200 flex items-center justify-center mb-8 rounded">
            <span className="text-gray-400 italic">Article Image</span>
          </div>
        )}

        {/* Body */}
        <div 
          className="prose prose-lg prose-stone max-w-none"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(article.body) }}
        />

        {/* Share / Actions */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-500 uppercase">Share:</span>
            <button className="text-gray-400 hover:text-blue-500 transition">
              Twitter
            </button>
            <button className="text-gray-400 hover:text-blue-700 transition">
              LinkedIn
            </button>
            <button className="text-gray-400 hover:text-green-600 transition">
              Email
            </button>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}


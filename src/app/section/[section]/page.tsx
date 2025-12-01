import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getArticlesBySection } from '@/lib/articles';

interface SectionPageProps {
  params: Promise<{ section: string }>;
}

const VALID_SECTIONS = ['politics', 'economics', 'world', 'business', 'tech', 'opinion'];

const SECTION_TITLES: Record<string, { title: string; description: string }> = {
  politics: {
    title: 'Politics',
    description: 'Coverage of U.S. politics, elections, legislation, and government affairs',
  },
  economics: {
    title: 'Economy',
    description: 'Economic indicators, Federal Reserve policy, markets, and fiscal policy',
  },
  world: {
    title: 'World News',
    description: 'International news, geopolitics, and global affairs',
  },
  business: {
    title: 'Business',
    description: 'Corporate news, mergers, earnings, and industry trends',
  },
  tech: {
    title: 'Technology',
    description: 'Tech companies, innovation, AI, and digital transformation',
  },
  opinion: {
    title: 'Opinion',
    description: 'Editorials, commentary, and analysis',
  },
};

export default async function SectionPage({ params }: SectionPageProps) {
  const { section } = await params;

  // Validate section
  if (!VALID_SECTIONS.includes(section)) {
    notFound();
  }

  const sectionInfo = SECTION_TITLES[section];
  const articles = await getArticlesBySection(section, 20);

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Section Header */}
        <div className="border-b-4 border-double border-gray-300 pb-6 mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            {sectionInfo.title}
          </h1>
          <p className="text-gray-600 text-lg font-serif italic">
            {sectionInfo.description}
          </p>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No articles published yet in this section.</p>
            <Link 
              href="/" 
              className="text-blue-600 hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {articles.map((article, index) => (
              <article 
                key={article.id}
                className={`pb-8 ${index !== articles.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <Link href={`/article/${article.slug}`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Image */}
                    {article.imageUrl && (
                      <div className="md:col-span-1">
                        <div className="aspect-video w-full overflow-hidden">
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className={article.imageUrl ? 'md:col-span-2' : 'md:col-span-3'}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          {article.section}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-xs text-gray-500">
                          {new Date(article.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      
                      <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3 hover:underline">
                        {article.title}
                      </h2>
                      
                      <p className="font-serif text-gray-700 text-lg leading-relaxed mb-4">
                        {article.excerpt}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="font-bold">{article.author}</span>
                        <span>|</span>
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

// Generate static params for known sections
export function generateStaticParams() {
  return VALID_SECTIONS.map((section) => ({
    section,
  }));
}



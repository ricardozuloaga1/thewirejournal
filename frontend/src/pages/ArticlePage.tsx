import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { articlesApi } from '../services/api'
import Header from '../components/Header'
import Footer from '../components/Footer'

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      loadArticle()
    }
  }, [slug])

  const loadArticle = async () => {
    try {
      const data = await articlesApi.getArticleBySlug(slug!)
      setArticle(data)
    } catch (error) {
      console.error('Failed to load article:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="text-xl">Loading article...</div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
          <Link to="/" className="text-blue-600 hover:underline">
            Go back to home
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Article Content */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-4">
          <Link 
            to={`/section/${article.section}`}
            className="text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-black"
          >
            {article.section}
          </Link>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight mb-4">
          {article.title}
        </h1>

        <p className="text-xl font-serif text-gray-700 leading-relaxed mb-6">
          {article.excerpt}
        </p>

        <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider space-x-2 mb-8 pb-8 border-b border-gray-300">
          <span>{article.author}</span>
          <span className="text-gray-300">|</span>
          <span>{article.read_time}</span>
          <span className="text-gray-300">|</span>
          <span>{new Date(article.created_at).toLocaleDateString()}</span>
        </div>

        {article.image_url && (
          <figure className="mb-8">
            <div className="relative h-96 w-full overflow-hidden rounded">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
            {article.image_caption && (
              <figcaption className="mt-2 text-sm text-gray-600 italic">
                {article.image_caption}
              </figcaption>
            )}
          </figure>
        )}

        <div className="article-body font-serif text-lg text-gray-800 leading-relaxed">
          {article.body.split('\n\n').map((paragraph: string, index: number) => (
            <p key={index} className="mb-6">
              {paragraph}
            </p>
          ))}
        </div>

        {article.sources && article.sources.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-300">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Sources</h3>
            <ul className="space-y-2">
              {article.sources.map((source: any, index: number) => (
                <li key={index} className="text-sm">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:underline"
                  >
                    {source.title || source.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-gray-300">
          <Link to="/" className="text-sm font-bold text-gray-700 hover:text-black uppercase tracking-wider">
            ← Back to Home
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  )
}

export default ArticlePage


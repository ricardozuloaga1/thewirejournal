import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { articlesApi } from '../services/api'
import Header from '../components/Header'
import Footer from '../components/Footer'

const SectionPage = () => {
  const { section } = useParams<{ section: string }>()
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (section) {
      loadArticles()
    }
  }, [section])

  const loadArticles = async () => {
    try {
      const data = await articlesApi.getArticlesBySection(section!, 20)
      setArticles(data)
    } catch (error) {
      console.error('Failed to load articles:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-8 capitalize border-b-4 border-double border-gray-300 pb-4">
          {section}
        </h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl">Loading articles...</div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 font-serif text-lg">No articles in this section yet.</p>
            <Link to="/" className="inline-block mt-4 text-sm font-bold text-gray-700 hover:text-black uppercase">
              ← Back to Home
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {articles.map((article) => (
              <article
                key={article.id}
                className="border-b border-gray-200 pb-8 last:border-b-0"
              >
                <Link to={`/article/${article.slug}`}>
                  <div className="flex flex-col md:flex-row gap-4">
                    {article.image_url && (
                      <div className="md:w-1/3 h-48 overflow-hidden rounded">
                        <img 
                          src={article.image_url} 
                          alt={article.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className={article.image_url ? 'md:w-2/3' : 'w-full'}>
                      <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2 hover:text-blue-700 cursor-pointer">
                        {article.title}
                      </h2>
                      <p className="font-serif text-gray-700 leading-relaxed mb-4">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider space-x-2">
                        <span>{article.author}</span>
                        <span className="text-gray-300">|</span>
                        <span>{article.read_time}</span>
                        <span className="text-gray-300">|</span>
                        <span>{new Date(article.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-gray-300">
          <Link to="/" className="text-sm font-bold text-gray-700 hover:text-black uppercase tracking-wider">
            ← Back to Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default SectionPage


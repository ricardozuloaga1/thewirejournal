import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { articlesApi, usersApi } from '../services/api'

const DashboardPage = () => {
  const { user } = useAuth()
  const [articles, setArticles] = useState<any[]>([])
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [articlesData, bookmarksData] = await Promise.all([
        articlesApi.getPersonalizedArticles(10),
        user ? usersApi.getBookmarks(user.id) : Promise.resolve([])
      ])
      setArticles(articlesData)
      setBookmarks(bookmarksData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-3xl font-serif font-bold">
              The Wire Journal
            </Link>
            <nav className="flex gap-4">
              <Link to="/dashboard" className="text-blue-600 font-semibold">Dashboard</Link>
              <Link to="/profile" className="hover:text-blue-600">Profile</Link>
              <Link to="/admin" className="hover:text-blue-600">Admin</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
        <p className="text-gray-600 mb-8">Your personalized news feed</p>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl">Loading your feed...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4">For You</h2>
              
              {articles.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-600 mb-4">No articles yet.</p>
                  <Link
                    to="/admin"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Generate Articles
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/article/${article.slug}`}
                      className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="text-sm text-blue-600 uppercase mb-2">
                        {article.section}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{article.title}</h3>
                      <p className="text-gray-600 mb-4">{article.excerpt}</p>
                      <div className="text-sm text-gray-500">
                        {article.author} · {article.read_time}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Bookmarks</h2>
              
              {bookmarks.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">No bookmarks yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookmarks.map((bookmark) => (
                    <Link
                      key={bookmark.bookmark_id}
                      to={`/article/${bookmark.article.slug}`}
                      className="block bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
                    >
                      <h4 className="font-bold mb-1">{bookmark.article.title}</h4>
                      <div className="text-sm text-gray-500">
                        {bookmark.article.section}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default DashboardPage


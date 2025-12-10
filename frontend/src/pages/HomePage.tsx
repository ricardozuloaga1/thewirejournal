import { useEffect, useState } from 'react'
import { articlesApi } from '../services/api'
import Header from '../components/Header'
import MarketTicker from '../components/MarketTicker'
import LeadStory from '../components/LeadStory'
import WhatsNews from '../components/WhatsNews'
import OpinionSidebar from '../components/OpinionSidebar'
import Footer from '../components/Footer'
import SecondaryStories from '../components/SecondaryStories'

const HomePage = () => {
  const [leadStory, setLeadStory] = useState<any>(null)
  const [articles, setArticles] = useState<any[]>([])
  const [opinions, setOpinions] = useState<any[]>([])
  const [satireArticles, setSatireArticles] = useState<any[]>([])
  const [headlines, setHeadlines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = async () => {
    try {
      const [lead, allArticles, opinionArticles, satire, latestHeadlines] = await Promise.all([
        articlesApi.getLeadArticle(),
        articlesApi.getArticles({ limit: 12 }),
        articlesApi.getArticles({ section: 'opinion', limit: 8 }),
        articlesApi.getArticles({ section: 'satire', limit: 4 }),
        articlesApi.getArticles({ limit: 10 }),
      ])

      setLeadStory(lead)
      setArticles(allArticles)
      setOpinions(opinionArticles)
      setSatireArticles(satire)
      setHeadlines(latestHeadlines)
    } catch (error) {
      console.error('Failed to load articles:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get secondary stories (exclude lead story) - show 6 stories
  const secondaryStories = articles
    .filter(a => a.id !== leadStory?.id)
    .slice(0, 6)

  // Split headlines for What's News
  const businessNews = headlines
    .filter(h => ['economics', 'business', 'tech'].includes(h.section))
    .slice(0, 4)
    .map(h => ({ title: h.title, slug: h.slug }))
  
  const worldNews = headlines
    .filter(h => ['politics', 'world', 'opinion'].includes(h.section))
    .slice(0, 4)
    .map(h => ({ title: h.title, slug: h.slug }))

  return (
    <main className="min-h-screen bg-white pb-0">
      <Header />
      <MarketTicker />
      
      <div className="container mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-0">
          
          {/* Left Column: What's News */}
          <div className="lg:col-span-2 border-r border-gray-200 pr-4 hidden lg:block">
             <WhatsNews 
               businessNews={businessNews.length > 0 ? businessNews : undefined}
               worldNews={worldNews.length > 0 ? worldNews : undefined}
             />
          </div>

          {/* Middle Column: Lead Story & Main Feed */}
          <div className="lg:col-span-7 lg:px-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-xl">Loading...</div>
              </div>
            ) : leadStory ? (
              <LeadStory 
                category={leadStory.section.charAt(0).toUpperCase() + leadStory.section.slice(1)}
                headline={leadStory.title}
                summary={leadStory.excerpt}
                author={leadStory.author}
                readTime={leadStory.read_time}
                imageUrl={leadStory.image_url}
                imageCaption={leadStory.image_caption}
                slug={leadStory.slug}
              />
            ) : (
              <LeadStory 
                category="Welcome"
                headline="Your AI Newsroom is Ready"
                summary="No articles have been published yet. Go to the Admin Dashboard and click 'Run Agents' to generate your first articles, then publish them to see them here."
                author="The Wire"
                readTime="1 min read"
              />
            )}
            
            {/* Secondary Stories Grid */}
            <SecondaryStories stories={secondaryStories} />
          </div>

          {/* Right Column: Opinion & Satire (combined) */}
          <div className="lg:col-span-3 lg:pl-4 lg:border-l border-gray-200 mt-8 lg:mt-0">
             <OpinionSidebar 
               opinions={opinions.length > 0 ? opinions.map(op => ({
                 title: op.title,
                 author: op.author,
                 slug: op.slug,
               })) : undefined}
               satire={satireArticles.length > 0 ? satireArticles.map(s => ({
                 title: s.title,
                 author: s.author,
                 slug: s.slug,
               })) : undefined}
             />
          </div>

        </div>
        
        {/* Mobile What's News (shown below main content on mobile) */}
        <div className="lg:hidden mt-10 border-t border-gray-200 pt-6">
           <WhatsNews 
             businessNews={businessNews.length > 0 ? businessNews : undefined}
             worldNews={worldNews.length > 0 ? worldNews : undefined}
           />
        </div>
      </div>
      
      <Footer />
    </main>
  )
}

export default HomePage

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: async (email: string, password: string, name: string) => {
    const { data } = await api.post('/auth/register', { email, password, name })
    return data
  },
  
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },
  
  logout: async () => {
    const { data } = await api.post('/auth/logout')
    return data
  },
  
  getCurrentUser: async () => {
    const { data } = await api.get('/auth/me')
    return data
  },
}

// Articles API
export const articlesApi = {
  getArticles: async (params?: { section?: string; limit?: number; status?: string }) => {
    const { data } = await api.get('/articles', { params })
    return data.articles
  },
  
  getDrafts: async () => {
    const { data } = await api.get('/articles', { params: { status: 'draft' } })
    return data.articles
  },
  
  getPersonalizedArticles: async (limit?: number) => {
    const { data } = await api.get('/articles/personalized', { params: { limit } })
    return data.articles
  },
  
  getArticle: async (id: string) => {
    const { data } = await api.get(`/articles/${id}`)
    return data.article
  },
  
  getArticleBySlug: async (slug: string) => {
    const { data } = await api.get(`/articles/slug/${slug}`)
    return data.article
  },
  
  getLeadArticle: async () => {
    const { data } = await api.get('/articles/lead')
    return data.article
  },
  
  getLeadArticleId: async () => {
    try {
      const { data } = await api.get('/settings/lead-article')
      return data.leadArticleId
    } catch {
      return null
    }
  },
  
  getArticlesBySection: async (section: string, limit?: number) => {
    const { data } = await api.get(`/articles/sections/${section}`, { params: { limit } })
    return data.articles
  },
  
  trackReading: async (articleId: string, progress?: number) => {
    const { data } = await api.post(`/articles/${articleId}/read`, { progress })
    return data
  },
  
  updateArticle: async (articleId: string, updates: Record<string, unknown>) => {
    const { data } = await api.patch(`/articles/${articleId}`, updates)
    return data
  },
  
  editArticleWithAI: async (articleId: string, action: string, customPrompt?: string) => {
    const { data } = await api.post(`/articles/${articleId}/edit`, { action, customPrompt })
    return data
  },
  
  publishArticle: async (articleId: string) => {
    const { data } = await api.post(`/articles/${articleId}/publish`)
    return data
  },
  
  setAsLeadStory: async (articleId: string) => {
    const { data } = await api.post(`/articles/${articleId}/set-lead`)
    return data
  },
  
  searchArticles: async (query: string, limit?: number) => {
    const { data } = await api.get('/articles/search', { params: { q: query, limit } })
    return data
  },
}

// Users API
export const usersApi = {
  getUser: async (userId: string) => {
    const { data } = await api.get(`/users/${userId}`)
    return data.user
  },
  
  updateUser: async (userId: string, updates: any) => {
    const { data } = await api.put(`/users/${userId}`, updates)
    return data.user
  },
  
  deleteUser: async (userId: string) => {
    const { data } = await api.delete(`/users/${userId}`)
    return data
  },
  
  getPreferences: async (userId: string) => {
    const { data } = await api.get(`/users/${userId}/preferences`)
    return data.preferences
  },
  
  updatePreferences: async (userId: string, preferences: any) => {
    const { data } = await api.put(`/users/${userId}/preferences`, { preferences })
    return data.preferences
  },
  
  getBookmarks: async (userId: string) => {
    const { data } = await api.get(`/users/${userId}/bookmarks`)
    return data.bookmarks
  },
  
  addBookmark: async (userId: string, articleId: string) => {
    const { data } = await api.post(`/users/${userId}/bookmarks/${articleId}`)
    return data
  },
  
  removeBookmark: async (userId: string, articleId: string) => {
    const { data } = await api.delete(`/users/${userId}/bookmarks/${articleId}`)
    return data
  },
}

// Agents API (Admin)
export const agentsApi = {
  runAgent: async (section: string, wordCount?: number, writingStyle?: string, topic?: string) => {
    const { data } = await api.post('/agents/run', { 
      section, 
      word_count: wordCount, 
      writing_style: writingStyle, 
      topic 
    })
    return data
  },
  
  runAllAgents: async (wordCount?: number, writingStyle?: string) => {
    const { data } = await api.post('/agents/run-all', { 
      word_count: wordCount, 
      writing_style: writingStyle 
    })
    return data
  },
  
  getAgentStatus: async () => {
    const { data } = await api.get('/agents/status')
    return data.runs
  },
}

// Images API (Admin)
export const imagesApi = {
  generateImages: async (title: string, excerpt: string, section: string, sources?: Array<{url: string; title?: string}>) => {
    const { data } = await api.post('/images/generate', { title, excerpt, section, sources })
    return data
  },
  
  saveImage: async (articleId: string, imageData: Record<string, unknown>) => {
    const { data } = await api.post(`/articles/${articleId}/image`, { imageData })
    return data
  },
}

export default api


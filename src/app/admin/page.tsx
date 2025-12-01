'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Zap, Loader2, Send, Trash2, ChevronRight, Image, Check, X, Star,
  Sparkles, Scissors, Expand, Target, MessageSquare, BarChart3, Quote,
  Scale, FileText, Flame, Brain, Users, Edit3, ExternalLink, RefreshCw
} from 'lucide-react';
import { markdownToHtml } from '@/lib/markdown';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  section: string;
  quality_score: number;
  status: string;
  author: string;
  read_time: string;
  created_at: string;
  image_id?: string;
  sources?: { url: string; title?: string }[];
}

interface GeneratedImage {
  id: string;
  base64?: string;
  url?: string;
  prompt?: string;
  source: 'extracted' | 'gemini' | 'dalle';
  sourceDomain?: string;
}

const SECTIONS = [
  { id: 'politics', label: 'Politics' },
  { id: 'economics', label: 'Economics' },
  { id: 'world', label: 'World' },
  { id: 'business', label: 'Business' },
  { id: 'tech', label: 'Tech' },
  { id: 'opinion', label: 'Opinion' },
];

const QUICK_EDITS = [
  { id: 'punch-headline', label: 'Punch Up Headline', icon: Sparkles, color: 'text-amber-600' },
  { id: 'shorten', label: 'Shorten', icon: Scissors, color: 'text-blue-600' },
  { id: 'expand', label: 'Expand', icon: Expand, color: 'text-green-600' },
  { id: 'strengthen-lead', label: 'Strengthen Lead', icon: Target, color: 'text-purple-600' },
  { id: 'add-data', label: 'Add Data', icon: BarChart3, color: 'text-indigo-600' },
  { id: 'add-quotes', label: 'Add Quotes', icon: Quote, color: 'text-pink-600' },
  { id: 'balance', label: 'Balance Views', icon: Scale, color: 'text-teal-600' },
];

const TONE_OPTIONS = [
  { id: 'formal', label: 'More Formal', icon: FileText },
  { id: 'urgent', label: 'More Urgent', icon: Flame },
  { id: 'analytical', label: 'More Analytical', icon: Brain },
  { id: 'accessible', label: 'More Accessible', icon: Users },
];

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [runningAgents, setRunningAgents] = useState(false);
  const [runningSection, setRunningSection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [customTopic, setCustomTopic] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('politics');
  const [wordCount, setWordCount] = useState<string>('800');
  
  // Image state
  const [generatingImages, setGeneratingImages] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  
  // Lead story state
  const [leadArticleId, setLeadArticleId] = useState<string | null>(null);
  
  // Edit state
  const [editingAction, setEditingAction] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingExcerpt, setEditingExcerpt] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [tempExcerpt, setTempExcerpt] = useState('');
  const [showSources, setShowSources] = useState(false);

  // Load articles
  async function loadArticles() {
    setLoading(true);
    setError(null);
    setStatus('Loading drafts...');
    try {
      const res = await fetch('/api/articles?status=draft');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setArticles(data.articles || []);
      
      try {
        const leadRes = await fetch('/api/settings/lead-article');
        const leadData = await leadRes.json();
        setLeadArticleId(leadData.leadArticleId);
      } catch { /* ignore */ }
      
      setStatus(`Loaded ${data.articles?.length || 0} drafts`);
    } catch (err) {
      setError(`Failed to load: ${err}`);
      setStatus('');
    } finally {
      setLoading(false);
    }
  }

  // Run all agents
  async function runAllAgents() {
    setRunningAgents(true);
    setError(null);
    setStatus('Running all agents... This takes 2-3 minutes');
    try {
      const res = await fetch('/api/run-agents', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordCount: parseInt(wordCount) })
      });
      const data = await res.json();
      if (data.success) {
        setStatus(`Generated ${data.articlesCreated} articles`);
        loadArticles();
      } else {
        setError(data.message || data.error);
        setStatus('');
      }
    } catch (err) {
      setError(`Failed: ${err}`);
    } finally {
      setRunningAgents(false);
    }
  }

  // Run section agent
  async function runSectionAgent(section: string, topic?: string) {
    setRunningSection(section);
    setError(null);
    setStatus(`Running ${section} agent${topic ? ` for "${topic}"` : ''}...`);
    try {
      const res = await fetch('/api/run-agent', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, topic, wordCount: parseInt(wordCount) })
      });
      const data = await res.json();
      if (data.success) {
        setStatus(`Generated ${data.articlesCreated} article(s)`);
        setCustomTopic('');
        loadArticles();
      } else {
        setError(data.message || data.error);
      }
    } catch (err) {
      setError(`Failed: ${err}`);
    } finally {
      setRunningSection(null);
    }
  }

  // AI Edit action
  async function performEdit(action: string, prompt?: string) {
    if (!selectedArticle) return;
    
    setEditingAction(action);
    setStatus(`Applying edit: ${action}...`);
    
    try {
      const res = await fetch(`/api/articles/${selectedArticle.id}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, customPrompt: prompt }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSelectedArticle(data.article);
        setArticles(prev => prev.map(a => a.id === data.article.id ? data.article : a));
        setStatus(`Edit applied: ${data.changes.join(', ')} updated`);
        setShowCustomPrompt(false);
        setCustomPrompt('');
      } else {
        setError(data.error || 'Edit failed');
      }
    } catch (err) {
      setError(`Edit failed: ${err}`);
    } finally {
      setEditingAction(null);
    }
  }

  // Save inline edit
  async function saveInlineEdit(field: 'title' | 'excerpt') {
    if (!selectedArticle) return;
    
    const value = field === 'title' ? tempTitle : tempExcerpt;
    
    try {
      const res = await fetch(`/api/articles/${selectedArticle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      
      if (res.ok) {
        const updated = { ...selectedArticle, [field]: value };
        setSelectedArticle(updated);
        setArticles(prev => prev.map(a => a.id === updated.id ? updated : a));
        setStatus(`${field} updated`);
      }
    } catch (err) {
      setError(`Failed to save: ${err}`);
    }
    
    setEditingTitle(false);
    setEditingExcerpt(false);
  }

  // Generate images
  async function generateImages() {
    if (!selectedArticle) return;
    
    setGeneratingImages(true);
    setGeneratedImages([]);
    setSelectedImageIndex(null);
    setStatus('Getting images: Extracting → Gemini → DALL-E');
    
    try {
      const res = await fetch('/api/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedArticle.title,
          excerpt: selectedArticle.excerpt,
          section: selectedArticle.section,
          sources: selectedArticle.sources || [],
        }),
      });
      
      const data = await res.json();
      
      if (data.success && data.images) {
        setGeneratedImages(data.images);
        setShowImageModal(true);
        const b = data.breakdown || {};
        setStatus(`Got ${data.images.length} images (${b.extracted || 0} extracted, ${b.gemini || 0} Gemini, ${b.dalle || 0} DALL-E)`);
      } else {
        setError(data.message || 'Failed to generate images');
      }
    } catch (err) {
      setError(`Failed: ${err}`);
    } finally {
      setGeneratingImages(false);
    }
  }

  // Save selected image
  async function saveSelectedImage() {
    if (!selectedArticle || selectedImageIndex === null) return;
    
    const selectedImage = generatedImages[selectedImageIndex];
    
    try {
      const res = await fetch(`/api/articles/${selectedArticle.id}/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: selectedImage }),
      });
      
      if (res.ok) {
        setStatus('Image saved');
        setShowImageModal(false);
        setGeneratedImages([]);
        setSelectedImageIndex(null);
        setArticles(prev => prev.map(a => 
          a.id === selectedArticle.id ? { ...a, image_id: 'saved' } : a
        ));
        setSelectedArticle(prev => prev ? { ...prev, image_id: 'saved' } : null);
      }
    } catch (err) {
      setError(`Failed: ${err}`);
    }
  }

  // Publish
  async function publishArticle(id: string) {
    try {
      await fetch(`/api/articles/${id}/publish`, { method: 'POST' });
      setArticles(prev => prev.filter(a => a.id !== id));
      setSelectedArticle(null);
      setStatus('Article published');
    } catch {
      setError('Failed to publish');
    }
  }

  // Discard
  async function discardArticle(id: string) {
    if (!confirm('Discard this article?')) return;
    try {
      await fetch(`/api/articles/${id}`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'discarded' })
      });
      setArticles(prev => prev.filter(a => a.id !== id));
      setSelectedArticle(null);
      setStatus('Article discarded');
    } catch {
      setError('Failed to discard');
    }
  }

  // Set lead story
  async function setAsLeadStory(articleId: string) {
    try {
      const res = await fetch(`/api/articles/${articleId}/set-lead`, { method: 'POST' });
      if (res.ok) {
        setLeadArticleId(articleId);
        setStatus('Lead story updated');
      }
    } catch (err) {
      setError(`Failed: ${err}`);
    }
  }

  const isAnyAgentRunning = runningAgents || runningSection !== null;
  const isEditing = editingAction !== null;

  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      {/* The Wire Journal Header */}
      <header className="border-b-4 border-double border-gray-300 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="block">
                <h1 className="font-serif text-2xl md:text-3xl tracking-tight">
                  THE WIRE JOURNAL.
                </h1>
              </Link>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">
                Editorial Dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadArticles}
                disabled={loading}
                className="px-4 py-2 text-sm font-bold border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load Drafts'}
              </button>
              <button
                onClick={runAllAgents}
                disabled={isAnyAgentRunning}
                className="flex items-center gap-2 bg-black text-white px-5 py-2 text-sm font-bold hover:bg-gray-800 disabled:opacity-50"
              >
                {runningAgents ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {runningAgents ? 'Running...' : 'Run All Agents'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Status/Error Bar */}
      {(status || error) && (
        <div className={`px-4 py-2 text-sm font-medium text-center ${error ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'}`}>
          {error || status}
          {error && <button onClick={() => setError(null)} className="ml-4 underline">Dismiss</button>}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Generate by Category */}
        <div className="bg-white border border-gray-200 p-4 mb-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Generate by Section</h2>
          
          {/* Word Count Selector */}
          <div className="mb-4 flex items-center gap-3">
            <label className="text-sm font-bold text-gray-700">Target Word Count:</label>
            <select
              value={wordCount}
              onChange={(e) => setWordCount(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 focus:border-black focus:outline-none"
            >
              <option value="500">Short (~500 words)</option>
              <option value="800">Medium (~800 words)</option>
              <option value="1200">Long (~1,200 words)</option>
              <option value="1500">Extended (~1,500 words)</option>
              <option value="2000">In-Depth (~2,000 words)</option>
            </select>
            <span className="text-xs text-gray-500">Opinion pieces will be longer</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => runSectionAgent(section.id)}
                disabled={isAnyAgentRunning}
                className={`px-4 py-2 text-sm font-bold border transition ${
                  runningSection === section.id 
                    ? 'border-black bg-black text-white' 
                    : 'border-gray-300 hover:border-black'
                } disabled:opacity-50`}
              >
                {runningSection === section.id && <Loader2 className="w-3 h-3 animate-spin inline mr-2" />}
                {section.label}
              </button>
            ))}
          </div>
          
          {/* Custom Topic */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Or enter a specific topic..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 focus:border-black focus:outline-none"
            />
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300"
            >
              {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <button
              onClick={() => customTopic && runSectionAgent(selectedSection, customTopic)}
              disabled={!customTopic || isAnyAgentRunning}
              className="px-4 py-2 text-sm font-bold bg-black text-white hover:bg-gray-800 disabled:opacity-50"
            >
              Generate
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Article List */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Drafts ({articles.length})
                </h2>
              </div>
              
              {articles.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  <p>No drafts loaded</p>
                  <p className="text-xs mt-2">Click "Load Drafts" or generate new articles</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {articles.map(article => (
                    <button
                      key={article.id}
                      onClick={() => {
                        setSelectedArticle(article);
                        setShowSources(false);
                      }}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                        selectedArticle?.id === article.id ? 'bg-amber-50 border-l-4 border-black' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{article.section}</span>
                        {article.image_id && <span className="text-[10px] bg-gray-200 px-1">IMG</span>}
                        {leadArticleId === article.id && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                      </div>
                      <h3 className="font-serif text-sm font-bold leading-tight line-clamp-2 mb-1">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold ${
                          article.quality_score >= 8 ? 'bg-green-100 text-green-700' :
                          article.quality_score >= 6 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {article.quality_score}/10
                        </span>
                        <span>{article.read_time}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Article Editor */}
          <div className="lg:col-span-8">
            {selectedArticle ? (
              <div className="bg-white border border-gray-200">
                {/* Editor Toolbar */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{selectedArticle.section}</span>
                      {leadArticleId === selectedArticle.id && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 font-bold">LEAD STORY</span>
                      )}
                      {selectedArticle.image_id && (
                        <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> IMAGE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={generateImages}
                        disabled={generatingImages}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold border border-gray-300 hover:border-black disabled:opacity-50"
                      >
                        {generatingImages ? <Loader2 className="w-3 h-3 animate-spin" /> : <Image className="w-3 h-3" />}
                        Images
                      </button>
                      <button
                        onClick={() => setAsLeadStory(selectedArticle.id)}
                        disabled={leadArticleId === selectedArticle.id}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold ${
                          leadArticleId === selectedArticle.id
                            ? 'bg-amber-100 text-amber-800'
                            : 'border border-gray-300 hover:border-black'
                        }`}
                      >
                        <Star className="w-3 h-3" />
                        Lead
                      </button>
                      <button
                        onClick={() => discardArticle(selectedArticle.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 hover:border-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => publishArticle(selectedArticle.id)}
                        className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold bg-black text-white hover:bg-gray-800"
                      >
                        <Send className="w-3 h-3" /> Publish
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Edit Actions */}
                <div className="px-4 py-3 border-b border-gray-100 bg-white">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mr-2">Quick Edits:</span>
                    {QUICK_EDITS.map(edit => (
                      <button
                        key={edit.id}
                        onClick={() => performEdit(edit.id)}
                        disabled={isEditing}
                        className={`flex items-center gap-1 px-2 py-1 text-xs font-medium border border-gray-200 hover:border-gray-400 rounded transition ${edit.color} disabled:opacity-50`}
                      >
                        {editingAction === edit.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <edit.icon className="w-3 h-3" />
                        )}
                        {edit.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone Options */}
                <div className="px-4 py-2 border-b border-gray-100 bg-white">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mr-2">Tone:</span>
                    {TONE_OPTIONS.map(tone => (
                      <button
                        key={tone.id}
                        onClick={() => performEdit(tone.id)}
                        disabled={isEditing}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 border border-gray-200 hover:border-gray-400 rounded disabled:opacity-50"
                      >
                        {editingAction === tone.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <tone.icon className="w-3 h-3" />
                        )}
                        {tone.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Prompt */}
                <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                  {showCustomPrompt ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="e.g., Focus more on the economic impact..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 focus:border-black focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => customPrompt && performEdit('custom', customPrompt)}
                        disabled={!customPrompt || isEditing}
                        className="px-4 py-2 text-xs font-bold bg-black text-white disabled:opacity-50"
                      >
                        {editingAction === 'custom' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
                      </button>
                      <button
                        onClick={() => { setShowCustomPrompt(false); setCustomPrompt(''); }}
                        className="px-2 py-2 text-gray-500 hover:text-black"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCustomPrompt(true)}
                      className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-black"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Custom edit instruction...
                    </button>
                  )}
                </div>

                {/* Article Content */}
                <div className="p-6 max-h-[500px] overflow-y-auto">
                  {/* Editable Title */}
                  {editingTitle ? (
                    <div className="mb-4">
                      <input
                        type="text"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        className="w-full font-serif text-2xl font-bold border-b-2 border-black focus:outline-none pb-1"
                        autoFocus
                        onBlur={() => saveInlineEdit('title')}
                        onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit('title')}
                      />
                    </div>
                  ) : (
                    <h1 
                      className="font-serif text-2xl md:text-3xl font-bold leading-tight mb-4 cursor-pointer hover:bg-amber-50 transition group"
                      onClick={() => { setEditingTitle(true); setTempTitle(selectedArticle.title); }}
                    >
                      {selectedArticle.title}
                      <Edit3 className="w-4 h-4 text-gray-300 inline ml-2 opacity-0 group-hover:opacity-100" />
                    </h1>
                  )}

                  {/* Editable Excerpt */}
                  {editingExcerpt ? (
                    <div className="mb-6">
                      <textarea
                        value={tempExcerpt}
                        onChange={(e) => setTempExcerpt(e.target.value)}
                        className="w-full font-serif text-lg text-gray-600 italic border-l-4 border-gray-300 pl-4 focus:outline-none resize-none"
                        rows={3}
                        autoFocus
                        onBlur={() => saveInlineEdit('excerpt')}
                      />
                    </div>
                  ) : (
                    <p 
                      className="font-serif text-lg text-gray-600 italic border-l-4 border-gray-300 pl-4 mb-6 cursor-pointer hover:bg-amber-50 transition group"
                      onClick={() => { setEditingExcerpt(true); setTempExcerpt(selectedArticle.excerpt); }}
                    >
                      {selectedArticle.excerpt}
                      <Edit3 className="w-4 h-4 text-gray-300 inline ml-2 opacity-0 group-hover:opacity-100" />
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 pb-4 border-b border-gray-200">
                    <span className="font-bold">{selectedArticle.author}</span>
                    <span>|</span>
                    <span>{selectedArticle.read_time}</span>
                    <span>|</span>
                    <span>Quality: {selectedArticle.quality_score}/10</span>
                    {selectedArticle.sources && selectedArticle.sources.length > 0 && (
                      <>
                        <span>|</span>
                        <button
                          onClick={() => setShowSources(!showSources)}
                          className="flex items-center gap-1 hover:text-black"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {selectedArticle.sources.length} sources
                        </button>
                      </>
                    )}
                  </div>

                  {/* Sources Panel */}
                  {showSources && selectedArticle.sources && (
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 text-xs">
                      <h4 className="font-bold text-gray-500 uppercase mb-2">Sources</h4>
                      <ul className="space-y-1">
                        {selectedArticle.sources.map((source, i) => (
                          <li key={i}>
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {source.title || source.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Body */}
                  <div 
                    className="font-serif text-gray-800 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(selectedArticle.body) }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 p-12 text-center">
                <div className="text-gray-300 mb-4">
                  <FileText className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="font-serif text-lg text-gray-500">Select an article to edit</h3>
                <p className="text-xs text-gray-400 mt-2">Choose from drafts on the left</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-serif font-bold">Select Image</h2>
              <button onClick={() => setShowImageModal(false)} className="p-1 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generatedImages.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-video overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-black ring-2 ring-black/20' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {(img.url || img.base64) ? (
                      <img 
                        src={img.url || `data:image/png;base64,${img.base64}`} 
                        alt={`Option ${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xs text-gray-400">No preview</span>
                      </div>
                    )}
                    {selectedImageIndex === index && (
                      <div className="absolute top-2 right-2 bg-black text-white rounded-full p-1">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className={`text-[10px] px-2 py-0.5 font-bold ${
                        img.source === 'extracted' ? 'bg-green-500 text-white' :
                        img.source === 'gemini' ? 'bg-purple-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {img.source === 'extracted' ? img.sourceDomain || 'Extracted' :
                         img.source === 'gemini' ? 'Gemini' : 'DALL-E'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button 
                onClick={() => setShowImageModal(false)} 
                className="px-4 py-2 text-sm font-bold border border-gray-300 hover:border-black"
              >
                Cancel
              </button>
              <button
                onClick={saveSelectedImage}
                disabled={selectedImageIndex === null}
                className="px-4 py-2 text-sm font-bold bg-black text-white hover:bg-gray-800 disabled:opacity-50"
              >
                Use Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

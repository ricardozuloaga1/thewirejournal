import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, User, X, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { articlesApi } from "../services/api";

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  section: string;
  author: string;
  image_url?: string;
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Focus input when search opens
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await articlesApi.searchArticles(searchQuery, 8);
        setSearchResults(result.articles || []);
        setShowDropdown(true);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  const handleResultClick = (slug: string) => {
    setShowSearch(false);
    setShowDropdown(false);
    setSearchQuery("");
    navigate(`/article/${slug}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSearch(false);
      setShowDropdown(false);
    } else if (e.key === "Enter" && searchResults.length > 0) {
      handleResultClick(searchResults[0].slug);
    }
  };

  return (
    <header className="border-b border-gray-300 font-sans relative">
      {/* Main Header */}
      <div className="flex flex-col md:grid md:grid-cols-3 items-center px-4 py-4 md:py-6 gap-4">
        {/* Left: Menu & Search */}
        <div className="flex items-center w-full md:w-auto justify-between md:justify-start md:space-x-6">
          <button className="flex items-center text-sm font-bold uppercase tracking-wider hover:text-gray-600">
            <Menu className="w-6 h-6 mr-2" />
            <span className="hidden md:inline">Menu</span>
          </button>
          
          {/* Search Button / Input */}
          <div ref={searchContainerRef} className="relative">
            {showSearch ? (
              <div className="flex items-center">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search articles..."
                    className="w-48 md:w-64 px-3 py-1.5 text-sm border border-gray-300 rounded-l focus:outline-none focus:border-black"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery("");
                    setShowDropdown(false);
                  }}
                  className="px-2 py-1.5 bg-gray-100 border border-l-0 border-gray-300 rounded-r hover:bg-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {/* Search Results Dropdown */}
                {showDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-80 md:w-96 bg-white border border-gray-200 shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <>
                        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                          </span>
                        </div>
                        {searchResults.map((article) => (
                          <button
                            key={article.id}
                            onClick={() => handleResultClick(article.slug)}
                            className="w-full px-3 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex gap-3"
                          >
                            {article.image_url && (
                              <img
                                src={article.image_url}
                                alt=""
                                className="w-16 h-12 object-cover rounded flex-shrink-0"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-bold text-gray-500 uppercase block mb-0.5">
                                {article.section}
                              </span>
                              <h4 className="text-sm font-serif font-bold text-gray-900 line-clamp-2">
                                {article.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                {article.author}
                              </p>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : searchQuery.length >= 2 && !isSearching ? (
                      <div className="px-4 py-6 text-center text-gray-500">
                        <p className="text-sm">No articles found for "{searchQuery}"</p>
                        <p className="text-xs mt-1">Try different keywords</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center text-sm font-bold uppercase tracking-wider hover:text-gray-600 text-gray-400 md:text-black"
              >
                <Search className="w-5 h-5 md:mr-2" />
                <span className="hidden md:inline">Search</span>
              </button>
            )}
          </div>
          
          {/* Mobile only: User */}
          <button className="md:hidden">
            <User className="w-6 h-6" />
          </button>
        </div>

        {/* Center: Logo */}
        <div className="flex justify-center w-full">
          <Link to="/" className="text-center">
             <h1 className="font-serif text-3xl md:text-5xl leading-tight text-black tracking-tight whitespace-nowrap">
               THE WIRE JOURNAL.
             </h1>
          </Link>
        </div>

        {/* Right: Actions (Desktop) */}
        <div className="hidden md:flex justify-end items-center space-x-4">
          {user ? (
            <>
              <Link to="/profile" className="text-xs font-bold text-gray-600 hover:text-black uppercase">
                {user.name}
              </Link>
              <button
                onClick={logout}
                className="bg-black text-white text-sm px-4 py-2 font-bold hover:bg-gray-800"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="text-xs font-bold text-gray-600 hover:text-black uppercase">
                Subscribe
              </Link>
              <Link
                to="/login"
                className="bg-black text-white text-sm px-4 py-2 font-bold hover:bg-gray-800"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="border-t border-gray-300 border-b-4 border-double border-gray-200 py-2">
        <ul className="flex justify-center space-x-6 overflow-x-auto px-4 text-sm font-bold text-gray-700 whitespace-nowrap scrollbar-hide">
          <li>
            <Link to="/" className="hover:text-black hover:underline decoration-2 underline-offset-4">
              Home
            </Link>
          </li>
          <li>
            <Link to="/section/world" className="hover:text-black hover:underline decoration-2 underline-offset-4">
              World
            </Link>
          </li>
          <li>
            <Link to="/section/politics" className="hover:text-black hover:underline decoration-2 underline-offset-4">
              Politics
            </Link>
          </li>
          <li>
            <Link to="/section/economics" className="hover:text-black hover:underline decoration-2 underline-offset-4">
              Economy
            </Link>
          </li>
          <li>
            <Link to="/section/business" className="hover:text-black hover:underline decoration-2 underline-offset-4">
              Business
            </Link>
          </li>
          <li>
            <Link to="/section/tech" className="hover:text-black hover:underline decoration-2 underline-offset-4">
              Tech
            </Link>
          </li>
          <li>
            <Link to="/section/opinion" className="hover:text-black hover:underline decoration-2 underline-offset-4">
              Opinion
            </Link>
          </li>
          <li>
            <Link to="/admin" className="hover:text-black hover:underline decoration-2 underline-offset-4">
              Admin
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

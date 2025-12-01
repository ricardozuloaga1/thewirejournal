import Link from "next/link";
import { Menu, Search, User } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-gray-300 font-sans">
      {/* Top Strip */}
      <div className="hidden md:flex justify-between items-center px-4 py-1 text-xs font-medium text-gray-600 border-b border-gray-200">
        <div className="flex space-x-4">
          <Link href="#" className="hover:text-black">English Edition</Link>
          <Link href="#" className="hover:text-black">Print Edition</Link>
          <Link href="#" className="hover:text-black">Video</Link>
          <Link href="#" className="hover:text-black">Audio</Link>
          <Link href="#" className="hover:text-black">Latest</Link>
          <Link href="#" className="hover:text-black">Magazines</Link>
        </div>
        <div className="flex space-x-4">
          <Link href="#" className="hover:text-black">Subscribe</Link>
          <Link href="#" className="hover:text-black">Sign In</Link>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex flex-col md:grid md:grid-cols-3 items-center px-4 py-4 md:py-6 gap-4">
        {/* Left: Menu & Search */}
        <div className="flex items-center w-full md:w-auto justify-between md:justify-start md:space-x-6">
          <button className="flex items-center text-sm font-bold uppercase tracking-wider hover:text-gray-600">
            <Menu className="w-6 h-6 mr-2" />
            <span className="hidden md:inline">Menu</span>
          </button>
          <button className="flex items-center text-sm font-bold uppercase tracking-wider hover:text-gray-600 text-gray-400 md:text-black">
             <Search className="w-5 h-5 md:mr-2" />
             <span className="hidden md:inline">Search</span>
          </button>
          {/* Mobile only: User */}
           <button className="md:hidden">
             <User className="w-6 h-6" />
           </button>
        </div>

        {/* Center: Logo */}
        <div className="flex justify-center w-full">
          <Link href="/" className="text-center">
             <h1 className="font-serif text-3xl md:text-5xl leading-tight text-black tracking-tight whitespace-nowrap">
               THE WIRE JOURNAL.
             </h1>
          </Link>
        </div>

        {/* Right: Actions (Desktop) */}
        <div className="hidden md:flex justify-end items-center space-x-4">
           <button className="text-xs font-bold text-gray-600 hover:text-black uppercase">
             Subscribe
           </button>
           <button className="bg-black text-white text-sm px-4 py-2 font-bold hover:bg-gray-800">
             Sign In
           </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="border-t border-gray-300 border-b-4 border-double border-gray-200 py-2">
        <ul className="flex justify-center space-x-6 overflow-x-auto px-4 text-sm font-bold text-gray-700 whitespace-nowrap scrollbar-hide">
          <li>
            <Link href="/" className="hover:text-black hover:underline decoration-2 underline-offset-4">
              Home
            </Link>
          </li>
          <li>
            <Link href="/section/world" className="hover:text-black hover:underline decoration-2 underline-offset-4">
              World
            </Link>
          </li>
          <li>
            <Link href="/section/politics" className="hover:text-black hover:underline decoration-2 underline-offset-4">
              Politics
            </Link>
          </li>
          <li>
            <Link href="/section/economics" className="hover:text-black hover:underline decoration-2 underline-offset-4">
              Economy
            </Link>
          </li>
          <li>
            <Link href="/section/business" className="hover:text-black hover:underline decoration-2 underline-offset-4">
              Business
            </Link>
          </li>
          <li>
            <Link href="/section/tech" className="hover:text-black hover:underline decoration-2 underline-offset-4">
              Tech
            </Link>
          </li>
          <li>
            <Link href="/section/opinion" className="hover:text-black hover:underline decoration-2 underline-offset-4">
              Opinion
            </Link>
          </li>
          <li>
            <Link href="/admin" className="hover:text-black hover:underline decoration-2 underline-offset-4">
              Admin
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}


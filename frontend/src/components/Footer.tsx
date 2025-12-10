import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
           <div>
              <h4 className="font-serif text-xl font-bold mb-4">The Wire Journal</h4>
              <p className="text-sm text-gray-400">
                Breaking news and analysis from the U.S. and around the world.
              </p>
           </div>
           <div>
              <h5 className="font-bold mb-2 text-sm uppercase text-gray-500">Subscribe</h5>
              <ul className="space-y-2 text-sm">
                 <li><Link to="/register" className="hover:underline">Subscribe Now</Link></li>
                 <li><Link to="/login" className="hover:underline">Sign In</Link></li>
              </ul>
           </div>
           <div>
              <h5 className="font-bold mb-2 text-sm uppercase text-gray-500">About Us</h5>
              <ul className="space-y-2 text-sm">
                 <li><Link to="/" className="hover:underline">News Corp</Link></li>
                 <li><Link to="/" className="hover:underline">Dow Jones</Link></li>
                 <li><Link to="/" className="hover:underline">Privacy Policy</Link></li>
                 <li><Link to="/" className="hover:underline">Cookie Policy</Link></li>
              </ul>
           </div>
        </div>
        <div className="border-t border-gray-800 pt-4 text-center text-xs text-gray-500">
           Copyright © {new Date().getFullYear()} Dow Jones & Company, Inc. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}


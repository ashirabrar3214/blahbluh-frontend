import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-20 bg-[#0e0e0f]/80 backdrop-blur-xl border-b border-white/5">
      <div className="px-4 h-16 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="https://pub-43e3d36a956c411fb92f0c0771910642.r2.dev/logo-yellow.svg" alt="blahbluh" className="w-10 h-10 object-contain rounded-xl" />
            <span className="text-xl font-bold text-white tracking-tight ml-2">blahbluh</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
             <Link to="/" className="text-sm font-medium text-[#fefefe]/60 hover:text-[#fefefe] transition-colors">Home</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
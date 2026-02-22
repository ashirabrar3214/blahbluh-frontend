import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-10 mt-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-lg font-bold text-indigo-600 tracking-tight">Blahbluh</Link>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              Connect through text without the pressure. The place for low-stakes social interaction.
            </p>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-xs text-gray-500 hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-xs text-gray-500 hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/blog" className="text-xs text-gray-500 hover:text-indigo-600 transition-colors">Blog</Link></li>
              <li><Link to="/faq" className="text-xs text-gray-500 hover:text-indigo-600 transition-colors">FAQ</Link></li>
              <li><Link to="/trust-safety" className="text-xs text-gray-500 hover:text-indigo-600 transition-colors">Trust & Safety</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-xs text-gray-500 hover:text-indigo-600 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-xs text-gray-500 hover:text-indigo-600 transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Blahbluh. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
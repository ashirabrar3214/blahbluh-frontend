import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const TABS = [
  { id: 'gifs', label: 'GIFs' },
  { id: 'stickers', label: 'Stickers' }
];

const QUICK_TAGS = ["Haha", "Love", "Sad", "Wow", "Yes", "No"];

const MediaKeyboard = ({ onSelect, onClose }) => {
  const [activeTab, setActiveTab] = useState('gifs'); // 'gifs' or 'stickers'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const loadTrending = useCallback(async () => {
    setLoading(true);
    try {
      let data = [];
      if (activeTab === 'gifs') {
        data = await api.getTrendingGifs();
      } else {
        data = await api.getTrendingStickers();
      }
      setItems(data);
    } catch (err) {
      console.error("Failed to load media", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const performSearch = useCallback(async (term) => {
    setLoading(true);
    try {
      let data = [];
      if (activeTab === 'gifs') {
        data = await api.searchGifs(term);
      } else {
        data = await api.searchStickers(term);
      }
      setItems(data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Debounce search slightly to avoid flickering while typing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        performSearch(searchTerm);
      } else {
        loadTrending();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, activeTab, loadTrending, performSearch]);

  return (
    <div className="flex flex-col h-full w-full bg-zinc-900 border-t border-zinc-800 shadow-2xl">
      {/* 1. Tab Bar (Instagram Style) */}
      <div className="flex items-center border-b border-white/5">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
              activeTab === tab.id 
                ? 'text-white border-b-2 border-blue-500 bg-white/5' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
        {/* Close Button (Mobile convenience) */}
        <button 
          onClick={onClose} 
          className="px-4 py-3 text-zinc-500 hover:text-white md:hidden"
        >
          ✕
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="p-2 space-y-2">
        <input 
          type="text" 
          placeholder={`Search ${activeTab}...`} 
          className="w-full bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-zinc-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
        {/* Quick Tags Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
           <button 
             onClick={() => setSearchTerm('')} 
             className="whitespace-nowrap px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
           >
             🔥 Trending
           </button>
           {QUICK_TAGS.map(tag => (
             <button 
               key={tag} 
               onClick={() => setSearchTerm(tag)}
               className="whitespace-nowrap px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
             >
               {tag}
             </button>
           ))}
        </div>
      </div>

      {/* 3. Grid Content */}
      <div className="flex-1 overflow-y-auto p-2 min-h-0">
        {loading ? (
          <div className="flex justify-center items-center h-full text-zinc-500 text-sm animate-pulse">
            Loading {activeTab}...
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {items.map((item) => (
              <div 
                key={item.id} 
                onClick={() => onSelect(item.url, activeTab === 'stickers' ? 'sticker' : 'gif')}
                className="cursor-pointer relative group aspect-square flex items-center justify-center bg-zinc-800/50 rounded-lg overflow-hidden"
              >
                <img 
                  src={item.preview} 
                  alt={item.title}
                  className="w-full h-full object-contain hover:scale-110 transition-transform duration-200"
                  loading="lazy"
                />
              </div>
            ))}
            {items.length === 0 && !loading && (
               <div className="col-span-full text-center text-zinc-500 text-sm py-4">
                 No results found
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaKeyboard;
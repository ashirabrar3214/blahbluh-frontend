import React, { useState, useEffect } from 'react';
import { api } from '../api';

const QUICK_TAGS = ["Hello", "Sad", "Laughing", "Wow", "No"];

const GifPicker = ({ onSelect, onClose }) => {
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Initial Load (Trending)
  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    setLoading(true);
    try {
      const data = await api.getTrendingGifs();
      setGifs(data);
    } catch (err) {
      console.error("Failed to load GIFs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent page reload
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const data = await api.searchGifs(searchTerm);
      setGifs(data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTag = (tag) => {
    setSearchTerm(tag);
    // Directly trigger search logic for the tag
    setLoading(true);
    api.searchGifs(tag).then(setGifs).finally(() => setLoading(false));
  };

  return (
    <div className="absolute bottom-16 left-2 right-2 md:left-auto md:right-0 md:w-96 h-[45vh] min-h-[250px] md:h-96 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden transition-all">
      {/* Header */}
      <div className="p-3 border-b border-zinc-800 flex gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input 
            type="text" 
            placeholder="Search GIFs..." 
            className="flex-1 bg-zinc-800 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="text-blue-400 text-xs font-bold uppercase">Go</button>
        </form>
        <button onClick={onClose} className="text-zinc-500 hover:text-white px-2">✕</button>
      </div>

      {/* Quick Tags */}
      <div className="flex gap-2 p-2 overflow-x-auto bg-zinc-900/50 scrollbar-hide">
        <button onClick={loadTrending} className="whitespace-nowrap px-3 py-1 rounded-full bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700">
           🔥 Trending
        </button>
        {QUICK_TAGS.map(tag => (
          <button 
            key={tag} 
            onClick={() => handleQuickTag(tag)}
            className="whitespace-nowrap px-3 py-1 rounded-full bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex justify-center items-center h-full text-zinc-500 text-sm">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif) => (
              <img 
                key={gif.id}
                src={gif.preview} 
                alt={gif.title}
                onClick={() => onSelect(gif.url)}
                className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GifPicker;
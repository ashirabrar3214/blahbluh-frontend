import React, { useState } from 'react';

const SimpleReelPlayer = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [embedSrc, setEmbedSrc] = useState(null);
  const [error, setError] = useState('');

  const handleLoad = () => {
    setError('');
    setEmbedSrc(null);

    const cleanUrl = inputUrl.trim();
    
    // 1. EXTRACT ID: This regex grabs the ID from /reel/ID, /p/ID, or /reels/ID
    // It allows dots, dashes, and underscores in the ID.
    const match = cleanUrl.match(/\/(?:p|reel|reels)\/([\w-.]+)/);

    if (!match || !match[1]) {
      setError('Could not find a valid ID in that link.');
      return;
    }

    const id = match[1];

    // 2. CONSTRUCT EMBED URL:
    // We force it to be a "/p/" (Post) type, which is the most stable player.
    // We use "/embed/" (not /embed/captioned/) to strip the comments/header.
    const finalUrl = `https://www.instagram.com/p/${id}/embed/?cr=1&v=14&wp=540`;

    setEmbedSrc(finalUrl);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-10 font-sans">
      <h1 className="text-2xl font-bold mb-6">Simple Reel Tester</h1>

      {/* INPUT SECTION */}
      <div className="flex gap-2 w-full max-w-md mb-8">
        <input 
          type="text" 
          placeholder="Paste Instagram Link here..." 
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-blue-500 text-white"
        />
        <button 
          onClick={handleLoad}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors"
        >
          Load
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-4 text-red-400 bg-red-900/20 px-4 py-2 rounded border border-red-500/50">
          {error}
        </div>
      )}

      {/* PLAYER SECTION */}
      {embedSrc && (
        <div className="flex flex-col items-center gap-2">
          
          {/* THE PLAYER CONTAINER */}
          <div 
            className="w-[300px] bg-black rounded-2xl overflow-hidden border border-zinc-700 shadow-2xl relative"
            style={{ aspectRatio: '9/16' }} // Forces vertical shape
          >
            <iframe
              src={embedSrc}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              scrolling="no"
              allowFullScreen
              title="Insta Test"
            />
          </div>

          {/* DEBUG INFO (Shows what link we actually generated) */}
          <div className="mt-4 p-4 bg-zinc-800 rounded-lg text-xs font-mono text-zinc-400 max-w-md break-all">
            <strong>Generated Embed URL:</strong><br/>
            {embedSrc}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleReelPlayer;
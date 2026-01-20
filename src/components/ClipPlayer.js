import React, { useState, useEffect, useMemo } from 'react';
import { getEmbedConfig } from '../utils/embedUtils';

const ClipPlayer = ({ url, onPlay }) => {
  const config = useMemo(() => getEmbedConfig(url), [url]);
  const [title, setTitle] = useState(null);

  useEffect(() => {
    if (!config) return;

    const fetchTitle = async () => {
      try {
        // Attempt to fetch title via oEmbed
        const provider = config.type === 'tiktok' 
          ? `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
          : `https://noembed.com/embed?url=${encodeURIComponent(url)}`;

        const res = await fetch(provider);
        const data = await res.json();
        if (data && data.title) setTitle(data.title);
      } catch (e) {
        // Ignore errors, fallback to default text
      }
    };
    fetchTitle();
  }, [url, config]);

  // If invalid, fallback to generic link
  if (!config) {
    return (
      <div className="mt-1 p-3 bg-red-900/20 border border-red-500/30 rounded-xl text-red-200 text-xs">
        Invalid Link
      </div>
    );
  }

  // PREVIEW CARD (Thumbnail style)
  return (
    <div 
      onClick={() => onPlay(config)}
      className="mt-2 w-[240px] cursor-pointer group relative overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all active:scale-95"
    >
      {/* Video Preview (Iframe) */}
      <div className="relative w-full bg-black" style={{ aspectRatio: '9/16' }}>
        <iframe
          src={config.src}
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          style={{ clipPath: 'inset(20px 0 50px 0)' }}
          frameBorder="0"
          scrolling="no"
          tabIndex="-1"
          title="Clip Preview"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        />
        
        {/* Click Overlay */}
        <div className="absolute inset-0 z-10" />
      </div>

      {/* Meta Info */}
      <div className="p-3 bg-zinc-900 relative z-20">
        <p className="text-white text-sm font-bold truncate">
          {title || (config.type === 'instagram' ? 'Instagram Reel' : 
           config.type === 'tiktok' ? 'TikTok Video' : 'Snapchat Clip')}
        </p>
        <p className="text-zinc-500 text-xs mt-0.5 truncate">{url}</p>
        <div className="mt-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
          Click to Watch
        </div>
      </div>
    </div>
  );
};

export default ClipPlayer;
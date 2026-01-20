import React from 'react';
import { getEmbedConfig } from '../utils/embedUtils';

const ClipPlayer = ({ url, onPlay }) => {
  const config = getEmbedConfig(url);

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
          frameBorder="0"
          scrolling="no"
          tabIndex="-1"
          title="Clip Preview"
        />
        
        {/* Click Overlay & Play Button */}
        <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors flex items-center justify-center z-10">
           <div className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform shadow-xl">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M5 3l14 9-14 9V3z" /></svg>
           </div>
        </div>
      </div>

      {/* Meta Info */}
      <div className="p-3 bg-zinc-900 relative z-20">
        <p className="text-white text-sm font-bold truncate">
          {config.type === 'instagram' ? 'Instagram Reel' : 
           config.type === 'tiktok' ? 'TikTok Video' : 'Snapchat Clip'}
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
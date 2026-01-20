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
      {/* Platform Banner */}
      <div className={`h-24 flex items-center justify-center 
        ${config.type === 'instagram' ? 'bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600' : ''}
        ${config.type === 'tiktok' ? 'bg-[#000000]' : ''}
        ${config.type === 'snapchat' ? 'bg-[#FFFC00]' : ''}
      `}>
        {/* Play Icon */}
        <div className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M5 3l14 9-14 9V3z" /></svg>
        </div>
      </div>

      {/* Meta Info */}
      <div className="p-3 bg-zinc-900">
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
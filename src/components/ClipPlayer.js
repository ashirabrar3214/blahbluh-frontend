import React, { useState, useEffect, useRef } from 'react';
import { getEmbedConfig } from '../utils/embedUtils';

const ClipPlayer = ({ url }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const containerRef = useRef(null);
  const config = getEmbedConfig(url);

  // LAZY LOADING: Only load the iframe when the user scrolls near it
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // --- FIX 1: Show a Link Card if embed fails (instead of invisible null) ---
  if (!config) {
    return <FallbackCard url={url} />;
  }

  return (
    <div 
        ref={containerRef}
        // --- FIX 2: Force aspect ratio via style (fixes 0px height issue) ---
        style={{ aspectRatio: '9/16' }} 
        className="mt-2 w-full max-w-[280px] sm:max-w-[300px] bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group transform transition-all hover:scale-[1.01]"
    >
      {/* 1. LOADING SKELETON (Shows while waiting for Iframe) */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
           <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 animate-pulse
             ${config.type === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : ''}
             ${config.type === 'tiktok' ? 'bg-[#00f2ea]' : ''}
             ${config.type === 'snapchat' ? 'bg-yellow-400 text-black' : ''}
           `}>
              {/* Play Triangle Icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                  <path d="M5 3l14 9-14 9V3z" /> 
              </svg>
           </div>
           <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
             Loading {config.type}...
           </span>
        </div>
      )}

      {/* 2. THE IFRAME (Only renders if in view) */}
      {inView && (
          <iframe
            src={config.src}
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            frameBorder="0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            scrolling="no"
            onLoad={() => setIsLoaded(true)}
            title={`${config.type} embed`}
          />
      )}
    </div>
  );
};

// --- FALLBACK COMPONENT ---
// Ensures users can still click the link if the video doesn't load
const FallbackCard = ({ url }) => {
  let hostname = "Link";
  try { hostname = new URL(url).hostname.replace('www.', ''); } catch(e){}

  return (
    <div className="mt-1 max-w-[280px]">
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-zinc-900 p-3 rounded-xl border border-zinc-700 hover:bg-zinc-800 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shrink-0">
                 {/* Clip Icon */}
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            </div>
            <div className="flex-1 overflow-hidden min-w-0">
                <p className="text-xs text-zinc-400 font-bold uppercase truncate">{hostname}</p>
                <p className="text-sm text-blue-400 truncate underline decoration-blue-400/30">Open Link</p>
            </div>
        </a>
    </div>
  );
};

export default ClipPlayer;
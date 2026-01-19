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

  if (!config) return null; // Fallback handled by parent

  return (
    <div 
        ref={containerRef}
        className="mt-2 w-full max-w-[280px] sm:max-w-[300px] aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group transform transition-all hover:scale-[1.01]"
    >
      {/* 1. LOADING SKELETON (Shows while waiting for Iframe) */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
           {/* Logo Pulse */}
           <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 animate-pulse
             ${config.type === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : ''}
             ${config.type === 'tiktok' ? 'bg-[#00f2ea]' : ''}
             ${config.type === 'snapchat' ? 'bg-yellow-400 text-black' : ''}
           `}>
              {/* Simple Icon based on type */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                  <path d="M5 3l14 9-14 9V3z" /> {/* Play Triangle */}
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

      {/* 3. CLICK SHIELD (Optional) */}
      {/* Keeps the user on your site by preventing accidental clicks on the 'View on Instagram' buttons 
          (Note: This might block play controls depending on the platform) */}
      {/* <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" /> */}
    </div>
  );
};

export default ClipPlayer;
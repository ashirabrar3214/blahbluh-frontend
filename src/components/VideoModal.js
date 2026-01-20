import React from 'react';

const VideoModal = ({ src, url, type, onClose }) => {
  if (!src) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-zinc-800/50 hover:bg-zinc-700 rounded-full text-white transition-colors z-50"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      {/* THE VIEWER */}
      <div 
        className="relative w-full max-w-[350px] bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800"
        style={{ aspectRatio: '9/16' }}
      >
        {/* BLOCKERS 
            1. Kept top at 60px.
            2. Reduced bottom to 80px (was 100px) to reduce risk of covering play controls on small screens.
        */}
        {type === 'instagram' && (
          <>
            <div className="absolute top-0 left-0 w-full h-[60px] z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-[80px] z-20 pointer-events-none" />
          </>
        )}

        {/* IFRAME - FIXED */}
        {isIOS ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 bg-zinc-900 z-30">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="w-full text-center p-3 rounded-xl bg-zinc-800 text-white font-bold border border-zinc-700 hover:bg-zinc-700 transition-colors"
            >
              Open Video
            </a>
          </div>
        ) : (
          <iframe
            src={src}
            className="absolute inset-0 w-full h-full z-10"
            frameBorder="0"
            scrolling="no"
            allowFullScreen
            // CRITICAL FIX: Explicit permissions are required for mobile playback
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            title="Clip Viewer"
          />
        )}
      </div>
    </div>
  );
};

export default VideoModal;
import React from 'react';

const VideoModal = ({ src, type, onClose }) => {
  if (!src) return null;

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
        {/* BLOCKERS - Adjusted for Mobile
            We reduced the bottom blocker height slightly and added pointer-events-auto
            to ensure they actually block clicks, but you might want to remove them entirely 
            if they block the 'Unmute' button on specific phones. 
        */}
        {type === 'instagram' && (
          <>
            <div className="absolute top-0 left-0 w-full h-[60px] z-20 bg-transparent cursor-default" />
            <div className="absolute bottom-0 left-0 w-full h-[80px] z-20 bg-transparent cursor-default" /> 
          </>
        )}

        {/* IFRAME - Added 'allow' attribute */}
        <iframe
          src={src}
          className="absolute inset-0 w-full h-full z-10"
          frameBorder="0"
          scrolling="no"
          allowFullScreen
          // CRITICAL FIX: Explicit permissions for mobile playback
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          title="Clip Viewer"
        />
      </div>
    </div>
  );
};

export default VideoModal;
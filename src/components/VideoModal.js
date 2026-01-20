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

      {/* THE VIEWER (Replicating test.html structure) */}
      <div 
        className="relative w-full max-w-[350px] bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800"
        style={{ aspectRatio: '9/16' }}
      >
        {/* BLOCKERS (From test.html) - Prevent clicking header/footer */}
        {type === 'instagram' && (
          <>
            <div className="absolute top-0 left-0 w-full h-[60px] z-20 bg-transparent cursor-default" />
            <div className="absolute bottom-0 left-0 w-full h-[100px] z-20 bg-transparent cursor-default" />
          </>
        )}

        {/* IFRAME */}
        <iframe
          src={src}
          className="absolute inset-0 w-full h-full z-10"
          frameBorder="0"
          scrolling="no"
          allowFullScreen
          title="Clip Viewer"
        />
      </div>
    </div>
  );
};

export default VideoModal;
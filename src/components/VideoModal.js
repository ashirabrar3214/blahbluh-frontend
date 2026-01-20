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
          <div className="absolute inset-0 z-30 bg-zinc-900 relative overflow-hidden">
            {/* Blurred Background Thumbnail */}
            <div className="absolute inset-0 pointer-events-none opacity-60">
               <iframe
                 src={src}
                 className="w-full h-full scale-110 blur-lg"
                 frameBorder="0"
                 scrolling="no"
                 tabIndex="-1"
                 title="Background"
               />
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 bg-black/20 backdrop-blur-[2px]">
               <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-5 border border-white/20 shadow-2xl">
                  <svg className="w-8 h-8 text-white ml-1" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
               </div>
               
               <h3 className="text-white font-bold text-xl mb-2">View in App</h3>
               <p className="text-white/70 text-sm mb-6 text-center max-w-[240px]">
                 Watch this video on {type === 'tiktok' ? 'TikTok' : type === 'instagram' ? 'Instagram' : 'Snapchat'}
               </p>

               <a
                 href={url}
                 target="_blank"
                 rel="noreferrer"
                 className="px-8 py-3.5 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-100 transition-transform active:scale-95 shadow-lg"
               >
                 Open Video
               </a>
            </div>
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
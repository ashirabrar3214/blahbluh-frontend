import React, { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';

const VideoModal = ({ src, url, type, onClose }) => {
  const [loading, setLoading] = useState(true);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!src) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
      
      {loading && <LoadingScreen message="Loading video..." />}

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-zinc-800/50 hover:bg-zinc-700 rounded-full text-white transition-colors z-[110]"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      {/* THE VIEWER */}
      <div 
        className="relative w-full max-w-[350px] md:max-w-none md:w-auto md:h-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800"
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
        {isIOS || type === 'snapchat' ? (
          <div className="absolute inset-0 z-30 bg-zinc-900 overflow-hidden">
            {/* Blurred Background Thumbnail */}
            <div className="absolute inset-0 pointer-events-none opacity-60">
               <iframe
                 src={src}
                 className="w-full h-full blur"
                 frameBorder="0"
                 scrolling="no"
                 tabIndex="-1"
                 title="Background"
                 onLoad={() => setLoading(false)}
               />
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 bg-black/20 backdrop-blur-[2px]">
               <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-5 border border-white/20 shadow-2xl">
                  {type === 'snapchat' ? (
                    <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.03 2.01c-3.4 0-5.93 2.25-6.2 5.5l-.02.37c-.03.5-.2 1.03-.5 1.48-.32.47-.75.75-1.2.75-.3 0-.5.12-.5.37 0 .3.3.5.5.5.8 0 1.5.5 1.8 1.2.3.8.1 1.7-.5 2.4-.4.5-.6 1-.6 1.5 0 .4.3.8.7 1 .5.3 1 .8 1 1.5 0 .5-.2 1-.5 1.4-.2.3-.4.6-.4 1 0 .5.5.9 1.2 1 .5.1 1 .3 1.2.6.2.3.2.6.2.9 0 .4.4.7.9.7h.1c.4 0 .8-.2 1.1-.5.4-.4.9-.6 1.4-.6.5 0 1 .2 1.4.6.3.3.7.5 1.1.5h.1c.5 0 .9-.3.9-.7 0-.3 0-.6.2-.9.2-.3.7-.5 1.2-.6.7-.1 1.2-.5 1.2-1 0-.4-.2-.7-.4-1-.3-.4-.5-.9-.5-1.4 0-.7.5-1.2 1-1.5.4-.2.7-.6.7-1 0-.5-.2-1-.6-1.5-.6-.7-.8-1.6-.5-2.4.3-.7 1-1.2 1.8-1.2.2 0 .5-.2.5-.5 0-.2-.2-.37-.5-.37-.45 0-.88-.28-1.2-.75-.3-.45-.47-.98-.5-1.48l-.02-.37c-.27-3.25-2.8-5.5-6.2-5.5z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white ml-1" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  )}
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
            onLoad={() => setLoading(false)}
          />
        )}
      </div>
    </div>
  );
};

export default VideoModal;
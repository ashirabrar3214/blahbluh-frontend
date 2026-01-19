import React, { useState } from 'react';
import { extractClipUrl, getEmbedConfig } from '../utils/embedUtils';

const ClipKeyboard = ({ onSend, onClose }) => {
  const [status, setStatus] = useState('idle'); // idle, reading, success, error
  const [feedback, setFeedback] = useState('');

  // --- CLIPBOARD LOGIC ---
  const handlePaste = async () => {
    // 1. Immediate UI feedback
    setStatus('reading');
    
    try {
      // 2. Read Clipboard (Must happen directly in this event loop)
      const text = await navigator.clipboard.readText();
      
      if (!text) throw new Error('Clipboard is empty');
      
      const extractedUrl = extractClipUrl(text);
      if (!extractedUrl) {
        throw new Error('Not a valid link');
      }

      const config = getEmbedConfig(extractedUrl);
      if (!config) {
        throw new Error('Unsupported link');
      }

      // 4. Success Sequence
      setStatus('success');
      setFeedback('Clip Sent!');
      
      // 5. Send to parent after animation
      setTimeout(() => {
        onSend(extractedUrl);
      }, 800);

    } catch (err) {
      console.error(err);
      setStatus('error');
      // Friendly error messages
      if (err.name === 'NotAllowedError' || err.message === 'Read permission denied.') {
          setFeedback('Tap "Allow Paste"');
      } else if (err.message === 'Not a valid link') {
          setFeedback('Link required');
      } else if (err.message === 'Unsupported link') {
          setFeedback('Unsupported link');
      } else {
          setFeedback('Empty Clipboard');
      }
      
      // Reset after 2 seconds
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-900 border-t border-zinc-800 shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-zinc-900 z-10">
        <span className="text-sm font-bold uppercase tracking-wide text-purple-400">
           Clips
        </span>
        <button onClick={onClose} className="text-zinc-500 hover:text-white px-2">✕</button>
      </div>

      {/* Main Interaction Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        
        {/* Pulsing Background for "Idle" */}
        {status === 'idle' && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-48 h-48 bg-purple-500 rounded-full blur-[80px] animate-pulse"></div>
             </div>
        )}

        {/* The Big Trigger Button */}
        <button
          className={`
            relative z-10 w-full max-w-xs aspect-video rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer select-none touch-manipulation
            ${status === 'idle' ? 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-500 active:scale-95' : ''}
            ${status === 'success' ? 'border-green-500 bg-green-900/20 scale-105' : ''}
            ${status === 'error' ? 'border-red-500 bg-red-900/20 shake' : ''}
          `}
          onClick={handlePaste}
        >
            {status === 'idle' && (
                <>
                    <svg className="w-10 h-10 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    <div className="text-center">
                        <p className="text-zinc-300 font-bold text-base">Tap to Paste Link</p>
                        <p className="text-zinc-600 text-xs mt-1">TikTok • Insta • X • Snap</p>
                    </div>
                </>
            )}

            {status === 'reading' && (
               <div className="flex flex-col items-center animate-pulse">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-purple-400 text-sm font-medium">Reading...</span>
               </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center animate-in zoom-in duration-300">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-2 shadow-lg shadow-green-500/50">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-green-400 font-bold text-lg">{feedback}</span>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center animate-in zoom-in duration-300">
                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mb-2">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </div>
                    <span className="text-red-400 font-bold text-sm">{feedback}</span>
                </div>
            )}
        </button>
      </div>
      
      {/* Footer Info */}
      <div className="px-6 pb-6 text-center">
         <p className="text-[10px] text-zinc-600 leading-tight">
            Links are validated securely. Only short-form content supported.
         </p>
      </div>
    </div>
  );
};

export default ClipKeyboard;
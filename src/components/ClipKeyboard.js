import React, { useState, useEffect } from 'react';

const ClipKeyboard = ({ onSend, onClose }) => {
  const [status, setStatus] = useState('idle'); // idle, reading, success, error
  const [feedback, setFeedback] = useState('');
  const [pressTimer, setPressTimer] = useState(null);

  // --- CLIPBOARD LOGIC ---
  const handlePaste = async () => {
    setStatus('reading');
    try {
      const text = await navigator.clipboard.readText();
      if (!text) throw new Error('Clipboard is empty');
      
      // Basic Frontend Check (Fast Feedback)
      if (!text.startsWith('http')) {
         throw new Error('Not a valid link');
      }

      // Success Animation Sequence
      setStatus('success');
      setFeedback('Clip Sent!');
      
      // Send to parent after short delay to show animation
      setTimeout(() => {
        onSend(text);
      }, 800);

    } catch (err) {
      console.error(err);
      setStatus('error');
      setFeedback(err.message === 'Not a valid link' ? 'Link required' : 'Permission denied');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  // --- MOBILE PRESS-AND-HOLD ---
  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      handlePaste();
    }, 600); // 600ms hold to trigger
    setPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (pressTimer) clearTimeout(pressTimer);
  };

  // --- PC CLICK ---
  const handleClick = () => {
    // Only trigger on click if not on mobile (or if user prefers click)
    // We allow click everywhere for accessibility
    handlePaste();
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-900 border-t border-zinc-800 shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-zinc-900 z-10">
        <span className="text-sm font-bold uppercase tracking-wide text-purple-400">
           Clips
        </span>
        <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
      </div>

      {/* Main Interaction Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        
        {/* Pulsing Background for "Idle" */}
        {status === 'idle' && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-48 h-48 bg-purple-500 rounded-full blur-[80px] animate-pulse"></div>
             </div>
        )}

        {/* The Button / Trigger Area */}
        <div
          className={`
            relative z-10 w-full max-w-xs aspect-video rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer select-none touch-none
            ${status === 'idle' ? 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-500 active:scale-95' : ''}
            ${status === 'success' ? 'border-green-500 bg-green-900/20 scale-105' : ''}
            ${status === 'error' ? 'border-red-500 bg-red-900/20 shake' : ''}
          `}
          // Events
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart} // For PC long press feel
          onMouseUp={handleTouchEnd}
        >
            {status === 'idle' && (
                <>
                    <svg className="w-10 h-10 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    <div className="text-center">
                        <p className="text-zinc-300 font-medium text-sm md:hidden">Press & Hold to Paste</p>
                        <p className="text-zinc-300 font-medium text-sm hidden md:block">Click to Paste Link</p>
                        <p className="text-zinc-600 text-xs mt-1">TikTok • Insta • X • Snap</p>
                    </div>
                </>
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
                    <span className="text-red-400 font-bold">{feedback}</span>
                </div>
            )}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="px-6 pb-6 text-center">
         <p className="text-xs text-zinc-600">
            We only support valid links from whitelisted platforms. 
            Broken or malicious links will be rejected.
         </p>
      </div>
    </div>
  );
};

export default ClipKeyboard;
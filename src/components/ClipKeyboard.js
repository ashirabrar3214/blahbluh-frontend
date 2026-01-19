import React, { useState, useRef, useEffect } from 'react';

const ClipKeyboard = ({ onSend, onClose }) => {
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [feedback, setFeedback] = useState('');
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // Auto-focus on PC
  useEffect(() => {
    // Small timeout to allow animation to finish
    const timer = setTimeout(() => {
       inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // --- VALIDATION & SEND LOGIC ---
  const processLink = (text) => {
    if (!text) return;
    
    setStatus('processing');
    
    // Basic Check
    if (!text.startsWith('http')) {
       setStatus('error');
       setFeedback('Invalid Link');
       setTimeout(() => {
         setStatus('idle');
         setFeedback('');
         setInputValue(''); 
       }, 1500);
       return;
    }

    // Success Animation
    setStatus('success');
    setFeedback('Clip Sent!');
    setInputValue(text); // Show the link

    // Send after short delay
    setTimeout(() => {
       onSend(text);
    }, 800);
  };

  // --- HANDLER: PASTE EVENT (Mobile & PC) ---
  const handlePaste = (e) => {
    // Prevent default to handle manually, or let it happen and capture via onChange
    // We let it happen to ensure standard behavior, but catch the data
    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
        e.preventDefault(); // We handle insertion to avoid double-events
        processLink(pastedText);
    }
  };

  // --- HANDLER: MANUAL CHANGE (Fallback) ---
  const handleChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    // If it looks like a full URL (user pasted via context menu), send it
    if (val.length > 10 && val.startsWith('http')) {
        processLink(val);
    }
  };

  // --- HANDLER: PC BUTTON CLICK ---
  const handlePcClickPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      processLink(text);
    } catch (err) {
      // If permission denied or empty, just focus input so they can paste manually
      inputRef.current?.focus();
      setStatus('idle');
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
        
        {/* Pulsing Background */}
        {status === 'idle' && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-48 h-48 bg-purple-500 rounded-full blur-[80px] animate-pulse"></div>
             </div>
        )}

        {/* --- THE BOX (ACTS AS INPUT) --- */}
        <div className={`
            relative z-10 w-full max-w-xs aspect-video rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-3 overflow-hidden
            ${status === 'idle' ? 'border-zinc-700 bg-zinc-800/50 focus-within:border-purple-500 focus-within:bg-zinc-800' : ''}
            ${status === 'success' ? 'border-green-500 bg-green-900/20 scale-105' : ''}
            ${status === 'error' ? 'border-red-500 bg-red-900/20 shake' : ''}
        `}>
            
            {status === 'idle' && (
                <>
                    {/* The Actual Input (Invisible but covers the box or is styled) */}
                    <input
                        ref={inputRef}
                        type="text" // 'url' sometimes triggers validation UI we don't want
                        value={inputValue}
                        onChange={handleChange}
                        onPaste={handlePaste}
                        placeholder="Paste Link Here..."
                        className="absolute inset-0 w-full h-full bg-transparent text-center text-white placeholder-zinc-500 font-medium focus:outline-none px-6 z-20 caret-purple-500"
                        autoComplete="off"
                        autoCapitalize="off"
                    />

                    {/* PC-Only "Click to Paste" Button (Hidden on Mobile) */}
                    {/* We use 'hidden md:flex' to show this ONLY on larger screens where permission prompts are less annoying */}
                    <div className="hidden md:flex absolute bottom-4 z-30 pointer-events-none text-zinc-600 text-xs items-center gap-1">
                        <span>(Or Ctrl+V to paste)</span>
                    </div>
                    
                    {/* Visual Icon (Behind Input) */}
                    <div className="pointer-events-none flex flex-col items-center justify-center opacity-50">
                        <svg className="w-8 h-8 text-zinc-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        {!inputValue && (
                           <span className="text-zinc-400 text-sm font-medium">Tap & Paste Link</span>
                        )}
                    </div>

                    {/* PC Click Overlay: If user clicks the empty space on PC, we can try to auto-paste */}
                    <button 
                       onClick={handlePcClickPaste}
                       className="hidden md:block absolute top-2 right-2 z-40 p-2 bg-zinc-700 rounded-full hover:bg-white hover:text-black transition-colors"
                       title="Click to Paste (PC)"
                    >
                       <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                    </button>
                </>
            )}

            {status === 'processing' && (
               <div className="flex flex-col items-center animate-pulse z-20">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-purple-400 text-sm font-medium">Verifying Link...</span>
               </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center animate-in zoom-in duration-300 z-20">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-2 shadow-lg shadow-green-500/50">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-green-400 font-bold text-lg">{feedback}</span>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center animate-in zoom-in duration-300 z-20">
                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mb-2">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </div>
                    <span className="text-red-400 font-bold text-sm">{feedback}</span>
                </div>
            )}
        </div>
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
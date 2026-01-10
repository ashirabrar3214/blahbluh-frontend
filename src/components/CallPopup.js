import React, { useState, useEffect } from 'react';

const MicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
);
const MicOffIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
);
const PhoneOffIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"></line></svg>
);
const Volume2Icon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
);
const SmartphoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
);
const BlockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
);
const ReportIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
);

const CallPopup = ({
  partner,
  status,
  onHangup,
  isMuted,
  onToggleMute,
  onBlock,
  onReport
}) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval;
    if (status === 'connected') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-zinc-900/95 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Partner Info */}
      <div className="flex flex-col items-center gap-6 mb-12">
        <div className="relative">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-zinc-800 shadow-2xl relative z-10">
            {/* Background Layer */}
            <div 
              className={`absolute inset-0 ${
                partner?.pfp_background ? 'bg-black' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
              }`}
              style={partner?.pfp_background ? { backgroundImage: `url(${partner.pfp_background})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            />
            {/* PFP Layer */}
            <div className="absolute inset-0 flex items-center justify-center">
              {partner?.pfp ? (
                <img src={partner.pfp} alt={partner.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-white">{partner?.username?.[0]?.toUpperCase()}</span>
              )}
            </div>
          </div>
          {/* Pulse effect when calling/connected */}
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping z-0 scale-110"></div>
          <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-pulse z-0 scale-125 delay-75"></div>
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{partner?.username}</h2>
          <p className="text-blue-400 font-medium tracking-wide uppercase text-sm">
            {status === 'calling' ? 'Calling...' : formatTime(duration)}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-8 w-full max-w-sm px-6">
        {/* Secondary Actions Row */}
        <div className="flex items-center justify-center gap-4 md:gap-6 w-full">
           {/* Speaker (Mobile Only) */}
           <button className="p-3 md:p-4 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all md:hidden">
            <Volume2Icon />
          </button>
          
          {/* Phone Speaker (Mobile Only) */}
          <button className="p-3 md:p-4 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all md:hidden">
            <SmartphoneIcon />
          </button>

          {/* Mute */}
          <button 
            onClick={onToggleMute}
            className={`p-3 md:p-4 rounded-full transition-all ${isMuted ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
          >
            {isMuted ? <MicOffIcon /> : <MicIcon />}
          </button>

          {/* Block */}
          <button onClick={onBlock} className="p-3 md:p-4 rounded-full bg-zinc-800 text-zinc-400 hover:bg-red-900/30 hover:text-red-400 transition-all">
            <BlockIcon />
          </button>

          {/* Report */}
          <button onClick={onReport} className="p-3 md:p-4 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all">
            <ReportIcon />
          </button>
        </div>

        {/* Hangup Button */}
        <button 
          onClick={onHangup}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 hover:bg-red-700 hover:scale-105 transition-all active:scale-95"
        >
          <PhoneOffIcon />
        </button>
      </div>
    </div>
  );
};

export default CallPopup;

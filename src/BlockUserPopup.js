import React from 'react';

const ReportIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
);

const BlockUserPopup = ({ username, onBlock, onCancel, onReport }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl scale-100">
        <h3 className="text-lg font-bold text-white text-center mb-2">Block {username}?</h3>
        <p className="text-zinc-400 text-sm text-center mb-6 leading-relaxed">
          Are you sure you want to block {username}?
          <br />
          You won't be able to contact them, and you can unblock them anytime.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={onBlock} className="w-full py-3.5 rounded-2xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors">
            Block
          </button>
          <button onClick={onCancel} className="w-full py-3.5 rounded-2xl bg-zinc-800 text-white font-medium text-sm hover:bg-zinc-700 transition-colors">
            Cancel
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-zinc-500 text-xs mb-3">Want to report something about {username}?</p>
          <button 
            onClick={onReport}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-xs font-medium"
          >
            <ReportIcon /> Report User
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockUserPopup;
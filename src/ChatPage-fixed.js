// PATCH: Replace the friend chat header section (around line 1000) with this:

{chatId?.startsWith('friend_') ? (
  // Friend chat header - now includes Inbox button
  <>
    <button onClick={onGoHome} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-full hover:bg-zinc-800">
      <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-white to-zinc-400 text-black flex items-center justify-center font-bold text-xs shadow-lg shadow-white/10">
        B
      </div>
      <span className="text-xs font-medium">blahbluh</span>
    </button>
    <button onClick={onInboxOpen} className="text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-full hover:bg-zinc-800 relative">
      Inbox
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-sm"></span>
      )}
    </button>
    <button onClick={handleBlockUser} className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-red-900/30 hover:text-red-400 transition-all active:scale-95">
      <BlockIcon />
    </button>
  </>
) : (
  // Random chat header - unchanged
  <>
    {/* existing random chat header code */}
  </>
)}

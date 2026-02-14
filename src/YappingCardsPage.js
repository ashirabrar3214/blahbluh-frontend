import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './api';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"></path>
    <path d="M12 19l-7-7 7-7"></path>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function YappingCardsPage({ currentUserId, onBack, onChatOpen }) {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUserId) {
            setLoading(true);
            api.getMyInvites(currentUserId)
                .then(setInvites)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [currentUserId]);

    const handleCardClick = (card) => {
        if (card.is_active && card.sender_id === currentUserId) {
            // Pending state
            return;
        }
        
        if (card.respondent_id) {
            // ✅ Change: Correctly determine who the 'other' person is
            const isMeSender = card.sender_id === currentUserId;
            const partnerId = isMeSender ? card.respondent_id : card.sender_id;

            // Navigate to ChatPage with existing session info
            navigate(`/chat/yap_${card.id}`, { 
                state: { 
                    roomId: `yap_${card.id}`, 
                    chatType: 'firechat',
                    partnerId: partnerId,
                    isExistingChat: true 
                } 
            });
        } else {
            onChatOpen(`yap_${card.id}`);
        }
    };

    const filteredInvites = invites.filter(card => {
        if (filter === 'waiting') return card.is_active;
        if (filter === 'answered') return !card.is_active;
        return true;
    });

    return (
        <div className="min-h-screen bg-[#0e0e0f] text-[#fefefe] flex flex-col font-sans selection:bg-amber-500/30">
            {/* Header */}
            <header className="px-4 pt-4 pb-0 bg-[#0e0e0f]/95 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center justify-between mb-4">
                    <button 
                      onClick={onBack}
                      className="flex items-center gap-2 text-[#fefefe]/60 hover:text-[#fefefe] transition-colors"
                    >
                      <BackIcon />
                      <span className="text-sm font-medium">Back</span>
                    </button>
                    
                    <h1 className="text-lg font-bold text-[#fefefe]">Yaps</h1>
                    <div className="w-8"></div>
                </div>

                {/* Segment Control */}
                <div className="flex gap-8 px-2 border-b border-white/5">
                    {['all', 'waiting', 'answered'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`pb-3 text-sm font-bold transition-all capitalize relative ${
                                filter === f 
                                    ? 'text-white' 
                                    : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            {f}
                            {filter === f && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>
            </header>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-3 max-w-2xl mx-auto w-full">
                {loading ? (
                    <div className="text-center py-10 text-[#fefefe]/50 animate-pulse">Loading your yaps...</div>
                ) : filteredInvites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
                            <span className="text-3xl">📭</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Yaps yet.</h3>
                        <p className="text-zinc-500 text-sm mb-8">Start a chat to drop your first one.</p>
                        <button 
                            onClick={onBack}
                            className="px-8 py-3 bg-amber-500 text-black font-bold rounded-full hover:bg-amber-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)]"
                        >
                            Start Yapping
                        </button>
                    </div>
                ) : (
                    filteredInvites.map(card => {
                        const isPending = card.is_active;
                        return (
                            <div 
                                key={card.id} 
                                onClick={() => handleCardClick(card)}
                                className={`
                                    relative overflow-hidden rounded-xl p-4 border transition-all duration-200
                                    active:scale-[0.99]
                                    ${isPending 
                                        ? 'bg-zinc-900 border-zinc-800' 
                                        : 'bg-zinc-800/50 border-zinc-700/50'
                                    }
                                `}
                            >
                                {/* Top Row: Metadata */}
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                        {getTimeAgo(card.created_at)}
                                    </span>
                                </div>

                                {/* Middle: Prompt */}
                                <p className={`font-bold text-lg leading-snug mb-3 ${isPending ? 'text-zinc-400' : 'text-white'}`}>
                                    "{card.prompt_text}"
                                </p>

                                {/* Blurred Reply Tease (Only for Answered) */}
                                {!isPending && (
                                    <div className="mb-3 relative overflow-hidden rounded-md bg-black/20 p-2 border border-white/5">
                                        <div className="h-3 w-3/4 bg-zinc-700/50 rounded blur-[2px]" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                                Tap to reveal
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Bottom: Status */}
                                <div className="flex justify-end items-center">
                                    {isPending ? (
                                        <div className="flex items-center text-amber-500/60 text-[10px] font-bold uppercase tracking-wider">
                                            Waiting
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-1.5" />
                                        </div>
                                    ) : (
                                        <span className="text-green-500/80 text-[10px] font-bold uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded-full">
                                            Replied
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Floating Send Button */}
            <div className="fixed bottom-8 left-0 right-0 flex justify-center z-30 pointer-events-none">
                <button
                    onClick={onBack}
                    className="pointer-events-auto flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-bold rounded-full shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                    <PlusIcon />
                    <span>Send another</span>
                </button>
            </div>
        </div>
    );
}
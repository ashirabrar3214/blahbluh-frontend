import React, { useEffect, useState } from 'react';
import { api } from './api';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"></path>
    <path d="M12 19l-7-7 7-7"></path>
  </svg>
);

export default function YappingCardsPage({ currentUserId, onBack, onChatOpen }) {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);

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
        // If is_active is true, it means NO ONE has answered it yet.
        if (card.is_active) {
            alert("This card hasn't been answered yet! Wait for a reply.");
            return;
        }
        
        // Use the specific "yap_" prefix so ChatPage knows it's a temporary room
        onChatOpen(`yap_${card.id}`);
    };

    return (
        <div className="min-h-screen bg-[#000000] text-[#fefefe] flex flex-col font-sans selection:bg-[#ffbd59]/30">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between bg-[#000000]/50 backdrop-blur-md border-b border-[#fefefe]/5 sticky top-0 z-20">
                <button 
                  onClick={onBack}
                  className="flex items-center gap-2 text-[#fefefe]/60 hover:text-[#fefefe] transition-colors"
                >
                  <BackIcon />
                  <span className="text-sm font-medium">Back</span>
                </button>
                
                <h1 className="text-lg font-bold text-[#fefefe]">My Sent Cards</h1>
                <div className="w-8"></div> {/* Spacer */}
            </header>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-2xl mx-auto w-full">
                {loading ? (
                    <div className="text-center py-10 text-[#fefefe]/50">Loading history...</div>
                ) : invites.length === 0 ? (
                    <div className="text-center py-10 text-[#fefefe]/50">
                        <p>No cards sent yet.</p>
                        <p className="text-xs mt-2">Start a queue to send one!</p>
                    </div>
                ) : (
                    invites.map(card => (
                        <div 
                            key={card.id} 
                            onClick={() => handleCardClick(card)}
                            className={`bg-[#fefefe]/5 rounded-xl p-4 border border-[#fefefe]/5 transition-all ${!card.is_active ? 'cursor-pointer hover:bg-[#fefefe]/10 hover:border-[#ffbd59]/30' : 'opacity-75'}`}
                        >
                            <p className="text-[#fefefe] font-medium text-sm mb-2">"{card.prompt_text}"</p>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-[#fefefe]/40">
                                    {new Date(card.created_at).toLocaleDateString()}
                                </span>
                                {!card.is_active ? (
                                    <span className="text-green-400 font-bold flex items-center gap-1">
                                        ✓ Answered (Tap to Chat)
                                    </span>
                                ) : (
                                    <span className="text-[#ffbd59] font-bold">
                                        ⏳ Pending
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
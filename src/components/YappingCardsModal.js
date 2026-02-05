import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function YappingCardsModal({ isOpen, onClose, currentUserId }) {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Function
    const fetchInvites = () => {
        if (!currentUserId) return;
        // Don't set loading to true on background refreshes to avoid flickering
        api.getMyInvites(currentUserId)
            .then(setInvites)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    // 2. Effect: Fetch on Open + Poll every 5s
    useEffect(() => {
        if (isOpen) {
            setLoading(true); // Show spinner on initial open
            fetchInvites();

            // Optional: Auto-refresh every 5 seconds while open
            const interval = setInterval(fetchInvites, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen, currentUserId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#1a1a1a] rounded-[32px] border border-[#fefefe]/10 overflow-hidden max-h-[80vh] flex flex-col">
                
                {/* Header with Refresh Button */}
                <div className="p-6 border-b border-[#fefefe]/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#fefefe]">My Yapping Cards</h2>
                    <div className="flex gap-2">
                        {/* REFRESH BUTTON */}
                        <button 
                            onClick={fetchInvites}
                            className="p-2 bg-[#fefefe]/10 rounded-full text-[#fefefe] hover:bg-[#ffbd59] hover:text-black transition-colors"
                            title="Refresh List"
                        >
                            ↻
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-[#fefefe]/10 rounded-full text-[#fefefe]">✕</button>
                    </div>
                </div>

                {/* List Content */}
                <div className="overflow-y-auto p-4 space-y-3 flex-1">
                    {loading && invites.length === 0 ? (
                        <div className="text-center py-10 text-[#fefefe]/50">Loading updates...</div>
                    ) : invites.length === 0 ? (
                        <div className="text-center py-10 text-[#fefefe]/50">
                            <p>No cards sent yet.</p>
                        </div>
                    ) : (
                        invites.map(card => (
                            <div key={card.id} className="bg-[#fefefe]/5 rounded-xl p-4 border border-[#fefefe]/5">
                                <p className="text-[#fefefe] font-medium text-sm mb-2 line-clamp-2">
                                    "{card.prompt_text}"
                                </p>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-[#fefefe]/40">
                                        {new Date(card.created_at).toLocaleDateString()}
                                    </span>
                                    {/* Status Logic */}
                                    {card.is_active ? (
                                        <span className="text-[#ffbd59] font-bold bg-[#ffbd59]/10 px-2 py-1 rounded">
                                            ⏳ Pending
                                        </span>
                                    ) : (
                                        <span className="text-green-400 font-bold bg-green-400/10 px-2 py-1 rounded flex items-center gap-1">
                                            ✓ Answered
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
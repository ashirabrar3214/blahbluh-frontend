import React, { useEffect, useState } from 'react';
import { api } from '../api'; // Adjust path if needed

export default function YappingCardsModal({ isOpen, onClose, currentUserId }) {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && currentUserId) {
            setLoading(true);
            api.getMyInvites(currentUserId)
                .then(setInvites)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isOpen, currentUserId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#1a1a1a] rounded-[32px] border border-[#fefefe]/10 overflow-hidden max-h-[80vh] flex flex-col">
                
                {/* Header */}
                <div className="p-6 border-b border-[#fefefe]/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#fefefe]">My Sent Cards</h2>
                    <button onClick={onClose} className="p-2 bg-[#fefefe]/10 rounded-full text-[#fefefe] hover:bg-[#fefefe]/20">✕</button>
                </div>

                {/* List */}
                <div className="overflow-y-auto p-4 space-y-3 flex-1">
                    {loading ? (
                        <div className="text-center py-10 text-[#fefefe]/50">Loading history...</div>
                    ) : invites.length === 0 ? (
                        <div className="text-center py-10 text-[#fefefe]/50">
                            <p>No cards sent yet.</p>
                            <p className="text-xs mt-2">Start a queue to send one!</p>
                        </div>
                    ) : (
                        invites.map(card => (
                            <div key={card.id} className="bg-[#fefefe]/5 rounded-xl p-4 border border-[#fefefe]/5">
                                <p className="text-[#fefefe] font-medium text-sm mb-2">"{card.prompt_text}"</p>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-[#fefefe]/40">
                                        {new Date(card.created_at).toLocaleDateString()}
                                    </span>
                                    {/* Status Logic */}
                                    {!card.is_active ? (
                                        <span className="text-green-400 font-bold flex items-center gap-1">
                                            ✓ Answered
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
        </div>
    );
}
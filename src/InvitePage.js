import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from './api';

export default function InvitePage({ currentUserId }) {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invite, setInvite] = useState(null);
  const [answer, setAnswer] = useState(''); // <--- State for their answer
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.getInvite(token)
      .then(setInvite)
      .catch(() => setError("This card has expired or disappeared."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAcceptInvite = async () => {
    if (!answer.trim()) return alert("You gotta write something!");
    setSending(true);

    // 1. Not logged in? Save everything and go to login.
    if (!currentUserId) {
      localStorage.setItem('pending_invite_token', token);
      localStorage.setItem('pending_invite_answer', answer); // <--- SAVE THE ANSWER!
      window.location.href = '/'; 
      return;
    }

    // 2. Logged in? Process it.
    try {
      const result = await api.acceptInvite(token, currentUserId, answer);
      if (result.success) {
        const roomId = result.roomId;
        // Navigate to chat with 'firechat' type
        navigate(`/chat/${roomId}`, { 
          state: { 
            roomId: roomId, 
            chatType: 'firechat',
            partnerId: result.partnerId,
            isExistingChat: true 
          } 
        });
      }
    } catch (err) {
      console.error("Link invalid or expired", err);
      alert("Failed to send: " + err.message);
      setSending(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading card...</div>;
  if (error) return <div className="min-h-screen bg-black flex items-center justify-center text-red-400">{error}</div>;

  return (
    <div className="min-h-screen bg-black text-[#fefefe] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Fancy blob background */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#ffbd59]/10 rounded-full blur-[128px] pointer-events-none"></div>

        <div className="max-w-md w-full bg-[#fefefe]/5 backdrop-blur-xl border border-[#fefefe]/10 p-8 rounded-[32px] z-10">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                 <img src={invite.sender.pfp || 'https://pub-43e3d36a956c411fb92f0c0771910642.r2.dev/logo-yellow.svg'} className="w-12 h-12 rounded-full border-2 border-[#ffbd59]" alt={invite.sender.username} />
                 <div>
                    <h2 className="text-lg font-bold text-[#fefefe]">{invite.sender.username}</h2>
                    <p className="text-xs text-[#fefefe]/50">sent you a card</p>
                 </div>
            </div>

            {/* The Prompt */}
            <div className="mb-6">
                <p className="text-xs text-[#ffbd59] font-bold uppercase tracking-widest mb-2">THE TOPIC</p>
                <h1 className="text-2xl md:text-3xl font-bold leading-tight">"{invite.prompt_text}"</h1>
            </div>

            {/* Answer Input */}
            <div className="relative">
                <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full bg-[#000000]/50 border border-[#fefefe]/20 rounded-2xl p-4 text-[#fefefe] placeholder:text-[#fefefe]/30 focus:outline-none focus:border-[#ffbd59] transition-all min-h-[120px] resize-none"
                />
            </div>

            {/* Send Button */}
            <button
                onClick={handleAcceptInvite}
                disabled={sending}
                className="w-full mt-6 py-4 rounded-full bg-[#ffbd59] text-black text-lg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
                {sending ? 'Sending...' : 'Send Answer & Chat'}
            </button>
        </div>
    </div>
  );
}
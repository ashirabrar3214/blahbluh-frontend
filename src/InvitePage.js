// src/InvitePage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from './api';

export default function InvitePage({ currentUserId }) {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    api.getInvite(token)
      .then(setInvite)
      .catch(() => setError("This invite link is invalid or has expired."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleConnect = async () => {
    setProcessing(true);
    
    // 1. If NOT logged in: Save token and go to home (login/signup)
    if (!currentUserId) {
      localStorage.setItem('pending_invite', token);
      window.location.href = '/'; // Redirect to login/home
      return;
    }

    // 2. If logged in: Accept immediately
    try {
      const result = await api.acceptInvite(token, currentUserId);
      if (result.success) {
        // Redirect to chat with this friend
        // We construct the chat ID based on user IDs
        const chatId = `friend_${[currentUserId, result.senderId].sort().join('_')}`;
        navigate(`/chat/${chatId}`); 
      }
    } catch (err) {
      alert("Failed to connect: " + err.message);
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading invite...</div>;
  if (error) return <div className="min-h-screen bg-black flex items-center justify-center text-red-400">{error}</div>;

  return (
    <div className="min-h-screen bg-black text-[#fefefe] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#ffbd59]/20 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#ff907c]/20 rounded-full blur-[128px] pointer-events-none"></div>

        <div className="max-w-md w-full bg-[#fefefe]/5 backdrop-blur-xl border border-[#fefefe]/10 p-8 rounded-[32px] text-center z-10">
            
            {/* Sender Info */}
            <div className="flex flex-col items-center mb-6">
                <img 
                    src={invite.sender.pfp || 'https://pub-43e3d36a956c411fb92f0c0771910642.r2.dev/logo-yellow.svg'} 
                    className="w-20 h-20 rounded-full object-cover border-4 border-[#ffbd59] shadow-lg mb-3"
                    alt={invite.sender.username}
                />
                <h2 className="text-2xl font-bold">
                    <span className="text-[#ffbd59]">{invite.sender.username}</span> wants to yap
                </h2>
            </div>

            {/* The Prompt */}
            <div className="bg-[#fefefe]/5 rounded-2xl p-6 mb-8 border border-[#fefefe]/10">
                <p className="text-xs text-[#fefefe]/40 uppercase tracking-widest font-bold mb-2">TOPIC</p>
                <p className="text-xl font-medium leading-relaxed">"{invite.prompt_text}"</p>
            </div>

            {/* CTA */}
            <button
                onClick={handleConnect}
                disabled={processing}
                className="w-full py-4 rounded-full bg-[#ffbd59] text-black text-lg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#ffbd59]/20"
            >
                {processing ? 'Connecting...' : 'Connect & Answer'}
            </button>
            
            {!currentUserId && (
                <p className="mt-4 text-xs text-[#fefefe]/40">
                    You'll need to create a quick anonymous account first.
                </p>
            )}
        </div>
    </div>
  );
}
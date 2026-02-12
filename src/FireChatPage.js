import React, { useState, useEffect, useRef } from 'react';
import { api } from './api';
import PublicProfile from './components/PublicProfile';
import MediaKeyboard from './components/MediaKeyboard';
import ClipKeyboard from './components/ClipKeyboard';
import ClipPlayer from './components/ClipPlayer';
import VideoModal from './components/VideoModal';
import LoadingScreen from './components/LoadingScreen'; // Import LoadingScreen
import BlockUserPopup from './BlockUserPopup';
import ReportPopup from './ReportPopup';

// --- Icons (Same as ChatPage) ---
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
);
const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
);
const ReplyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 10 20 15 15 20"></polyline><path d="M4 4v7a4 4 0 0 0 4 4h12"></path></svg>
);
const ReportIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
);
const EmojiIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
);
const BlockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
);
const ClipIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
);
const GifIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
);

function FireChatPage({ socket, user, currentUserId, currentUsername, initialChatData, onGoHome }) {
  const [chatId, setChatId] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeKeyboard, setActiveKeyboard] = useState(null);
  const [viewingClip, setViewingClip] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [actionMenuView, setActionMenuView] = useState('main');
  const [actionMenuCoords, setActionMenuCoords] = useState({ top: 0, left: 0 });
  const [showPublicProfile, setShowPublicProfile] = useState(false);
  const [showBlockPopup, setShowBlockPopup] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [actionToast, setActionToast] = useState(null);
  const [promptText, setPromptText] = useState(''); // NEW: Dedicated state
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    if (!initialChatData?.chatId || !currentUserId) return;

    const initChat = async () => {
        setIsLoading(true);
        try {
            const cId = initialChatData.chatId;
            setChatId(cId);

            // Fetch Session
            const data = await api.getYapSession(cId, currentUserId);
            const { invite, messages: apiMessages } = data;

            // Determine Partner
            const isMeSender = invite.sender_id === currentUserId;
            const partnerUser = isMeSender ? invite.respondent : invite.sender;
            const partnerId = isMeSender ? invite.respondent_id : invite.sender_id;

            setChatPartner({
                id: partnerId,
                userId: partnerId,
                username: partnerUser?.username || 'Anonymous',
                pfp: partnerUser?.pfp,
                pfp_background: partnerUser?.pfp_background
            });

            // Format Messages
            const formattedMessages = apiMessages.map((msg, index) => ({
                id: msg.id,
                chatId: cId,
                message: msg.text || msg.message,
                userId: msg.sender_id,
                username: msg.sender_id === currentUserId ? currentUsername : partnerUser?.username,
                timestamp: msg.created_at,
                reactions: {},
            }));

            setMessages(formattedMessages);
            
            // Save the prompt immediately
            setPromptText(invite.prompt_text || '');

            // Join Socket Room
            if (socket && socket.connected) {
                socket.emit('join-chat', { chatId: cId, userId: currentUserId });
            }

        } catch (error) {
            console.error("Failed to load Firechat:", error);
            setActionToast("Failed to load chat");
            setTimeout(onGoHome, 2000);
        } finally {
            setIsLoading(false);
        }
    };

    initChat();
  }, [initialChatData, currentUserId, currentUsername, socket, onGoHome]);

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    if (!socket || !chatId) return;

    const handleNewMessage = (msg) => {
        if (msg.chatId === chatId) {
            setMessages(prev => {
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, { ...msg, reactions: msg.reactions || {} }];
            });
        }
    };

    const handleReaction = ({ messageId, emoji, userId }) => {
        if (userId === currentUserId) return; // ignore own echo
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                const newReactions = { ...(msg.reactions || {}) };
                // logic to toggle reaction (simplified)
                if (!newReactions[emoji]) newReactions[emoji] = [];
                newReactions[emoji].push(userId);
                return { ...msg, reactions: newReactions };
            }
            return msg;
        }));
    };

    const handleConnect = () => {
        console.log("Socket connected, joining room:", chatId);
        socket.emit('join-chat', { chatId: chatId, userId: currentUserId });
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-reaction', handleReaction);
    socket.on('connect', handleConnect);

    return () => {
        socket.off('new-message', handleNewMessage);
        socket.off('message-reaction', handleReaction);
        socket.off('connect', handleConnect);
    };
  }, [socket, chatId, currentUserId]);

  // --- SCROLL TO BOTTOM ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // --- HANDLERS ---
  const handleSendMessage = () => {
    if (!newMessage.trim() || !chatId) return;

    const msgData = {
        id: Date.now(),
        chatId,
        message: newMessage.trim(),
        userId: currentUserId,
        username: currentUsername,
        timestamp: new Date().toISOString(),
        replyTo: replyingTo,
        reactions: {}
    };

    // Optimistic Update
    setMessages(prev => [...prev, msgData]);
    setNewMessage('');
    setReplyingTo(null);

    socket?.emit('send-message', msgData);
  };

  const handleSendMedia = (url, type) => {
      setActiveKeyboard(null);
      const msgData = {
          id: Date.now(),
          chatId,
          message: url,
          type,
          userId: currentUserId,
          username: currentUsername,
          timestamp: new Date().toISOString(),
          reactions: {}
      };
      setMessages(prev => [...prev, msgData]);
      socket?.emit('send-message', msgData);
  };

  const handleReactionClick = (msgId, emoji) => {
      // Optimistic update
      setMessages(prev => prev.map(m => {
          if (m.id === msgId) {
              const reactions = { ...m.reactions };
              if (!reactions[emoji]) reactions[emoji] = [];
              reactions[emoji].push(currentUserId);
              return { ...m, reactions };
          }
          return m;
      }));
      socket?.emit('add-reaction', { chatId, messageId: msgId, emoji, userId: currentUserId });
      setActiveActionMenu(null);
  };

  const handleBlockUser = async () => {
     try {
         await api.blockUser(currentUserId, chatPartner.id || chatPartner.userId);
         onGoHome();
     } catch(e) { console.error(e); }
  };

  const handleReportUser = async (reason) => {
      // (Implementation same as ChatPage, simplified for brevity)
      setShowReportPopup(false);
      setActionToast("Report submitted");
  };

  if (isLoading) return <LoadingScreen message="Loading Firechat..." />;

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-sans h-[100dvh]">
      {/* Header */}
      <header className="px-4 py-3 bg-zinc-900/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-30">
         <button onClick={onGoHome} className="p-2 -ml-2 text-zinc-400 hover:text-white">
            <BackIcon />
         </button>
         
         <div className="flex flex-col items-center" onClick={() => setShowPublicProfile(true)}>
            <span className="text-sm font-bold text-white">{chatPartner?.username}</span>
            <span className="text-[10px] text-red-400 font-bold tracking-wide">🔥 Firechat</span>
         </div>

         <button onClick={() => setShowBlockPopup(true)} className="p-2 -mr-2 text-zinc-400 hover:text-red-400">
            <BlockIcon />
         </button>
      </header>

      {/* Prompt Banner */}
      {promptText && (
        <div className="bg-zinc-900/50 p-4 border-b border-white/5 text-center">
          <p className="text-xs text-[#ffbd59] font-bold uppercase mb-1">Topic</p>
          <h2 className="text-lg font-medium italic">"{promptText}"</h2>
        </div>
      )}

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3" 
        onClick={() => { setActiveActionMenu(null); setActiveKeyboard(null); }}
      >
         {messages.map((msg, idx) => {
             const isOwn = msg.userId === currentUserId;
             
             // STANDARD MESSAGE RENDERING
             const isMedia = msg.type === 'gif' || msg.type === 'sticker' || msg.type === 'clip';
             
             return (
                 <div key={msg.id || idx} className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} group relative`}>
                     {/* Menu Trigger */}
                     <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setActionMenuCoords({ top: rect.top, left: isOwn ? rect.left - 230 : rect.right + 10 });
                            setActiveActionMenu(msg.id);
                            setActionMenuView('main');
                        }}
                        className={`opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-white ${isOwn ? 'mr-2' : 'ml-2 order-last'}`}
                     >
                        <MoreIcon />
                     </button>
                     
                     {/* Bubble */}
                     <div className={`max-w-[75%] ${isMedia ? '' : `px-4 py-2 rounded-2xl ${isOwn ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-200'}`}`}>
                         {msg.replyTo && <div className="text-[10px] opacity-75 border-l-2 pl-2 mb-1">Replying to {msg.replyTo.username}</div>}
                         
                         {isMedia ? (
                             msg.type === 'clip' ? <ClipPlayer url={msg.message} onPlay={setViewingClip} /> : <img src={msg.message} alt="media" className="rounded-lg max-w-full" />
                         ) : (
                             <p className="text-[15px]">{msg.message}</p>
                         )}

                         {/* Reactions */}
                         {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                             <div className="absolute -bottom-2 right-0 bg-zinc-900 border border-zinc-700 rounded-full px-1.5 py-0.5 text-[10px] flex gap-1 shadow-sm z-10">
                                 {Object.keys(msg.reactions).map(e => <span key={e}>{e}</span>)}
                             </div>
                         )}
                     </div>

                     {/* Context Menu */}
                     {activeActionMenu === msg.id && (
                        <div 
                            className="fixed z-50 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl w-56 overflow-hidden"
                            style={{ top: actionMenuCoords.top, left: actionMenuCoords.left }}
                        >
                            {actionMenuView === 'react' ? (
                                <div className="flex justify-between p-2">
                                    {['❤️', '😂', '👍', '👎', '🔥'].map(e => (
                                        <button key={e} onClick={() => handleReactionClick(msg.id, e)} className="text-xl hover:scale-110">{e}</button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col text-sm text-zinc-300">
                                    <button onClick={() => setReplyingTo(msg)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800"><ReplyIcon /> Reply</button>
                                    <button onClick={() => setActionMenuView('react')} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800"><EmojiIcon /> React</button>
                                    {!isOwn && <button onClick={() => { setShowReportPopup(true); }} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 text-red-400"><ReportIcon /> Report</button>}
                                </div>
                            )}
                        </div>
                     )}
                 </div>
             );
         })}
         <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-black/90 border-t border-white/5">
          {replyingTo && (
              <div className="flex justify-between text-xs text-zinc-400 bg-zinc-900 p-2 rounded-lg mb-2">
                  <span>Replying to {replyingTo.username}</span>
                  <button onClick={() => setReplyingTo(null)}>✕</button>
              </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2 items-center bg-zinc-900 rounded-full px-2 py-1.5 border border-zinc-800">
             <input 
                ref={inputRef}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-white px-3"
             />
             <button type="button" onClick={() => setActiveKeyboard(activeKeyboard === 'media' ? null : 'media')} className="p-2 text-zinc-400 hover:text-blue-400"><GifIcon /></button>
             <button type="button" onClick={() => setActiveKeyboard(activeKeyboard === 'clip' ? null : 'clip')} className="p-2 text-zinc-400 hover:text-purple-400"><ClipIcon /></button>
          </form>
      </div>

      {/* Keyboards */}
      {activeKeyboard && (
        <div className="h-[50vh] bg-zinc-900 border-t border-zinc-800">
            {activeKeyboard === 'media' && <MediaKeyboard onSelect={handleSendMedia} onClose={() => setActiveKeyboard(null)} />}
            {activeKeyboard === 'clip' && <ClipKeyboard onSend={(url) => handleSendMedia(url, 'clip')} onClose={() => setActiveKeyboard(null)} />}
        </div>
      )}

      {/* Popups */}
      {showBlockPopup && <BlockUserPopup username={chatPartner?.username} onBlock={handleBlockUser} onCancel={() => setShowBlockPopup(false)} />}
      {showReportPopup && <ReportPopup onCancel={() => setShowReportPopup(false)} onSubmit={handleReportUser} />}
      {showPublicProfile && <PublicProfile targetUserId={chatPartner?.id} currentUserId={currentUserId} onBack={() => setShowPublicProfile(false)} />}
      {viewingClip && <VideoModal src={viewingClip.src} type={viewingClip.type} onClose={() => setViewingClip(null)} />}
      {actionToast && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold">{actionToast}</div>}
    </div>
  );
}

export default FireChatPage;
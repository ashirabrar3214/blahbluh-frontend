import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { api } from './api';

// Animated dots component
function AnimatedDots() {
  const [dots, setDots] = useState('.');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return <span>{dots}</span>;
}

function ChatPage({ user }) {
  const [inQueue, setInQueue] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [chatId, setChatId] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showActions, setShowActions] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [actionToast, setActionToast] = useState(null);
  const currentUserIdRef = useRef(null);
  const socketRef = useRef(null);
  const longPressTimer = useRef(null);
  const hoverTimer = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const swipeStartX = useRef(null);
  const swipeStartY = useRef(null);
  
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    if (!actionToast) return;
    const t = setTimeout(() => setActionToast(null), 2000);
    return () => clearTimeout(t);
  }, [actionToast]);

  // Always auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      const container = messagesContainerRef.current;
      // Multiple approaches for better compatibility
      setTimeout(() => {
        // Method 1: scrollIntoView
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        // Method 2: direct scrollTop (backup)
        container.scrollTop = container.scrollHeight;
      }, 200);
    }
  }, [messages, chatId]);

  // Generate user immediately on mount
  useEffect(() => {
    const generateUser = async () => {
      try {
        const gen = await api.generateUserId();
        setCurrentUserId(gen.userId);
        setCurrentUsername(gen.username);
        console.log('Generated user on mount:', gen.userId, 'with username:', gen.username);
      } catch (error) {
        console.error('Error generating user:', error);
      }
    };
    generateUser();
  }, []);

  // Click outside to close actions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActions && !event.target.closest('.message-actions')) {
        setShowActions(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showActions]);

  // Socket setup + registration
  useEffect(() => {
    console.log('Connecting to socket server...');
    socketRef.current = io('https://blahbluh-production.up.railway.app', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
    console.log('Connected to server | Socket ID:', socketRef.current.id);
    const myId = currentUserIdRef.current;
    if (myId) {
      socketRef.current.emit('register-user', { userId: myId });
      console.log('Registered user on connect:', myId);
    }
  });


    socketRef.current.on('chat-paired', (data) => {
      console.log('Chat paired!', data);
      const myId = currentUserIdRef.current;
      const partner = data.users.find(u => u.userId !== myId);
      if (partner) {
        setChatId(data.chatId);
        setChatPartner(partner);
        setInQueue(false);
        setMessages([]);
        setNotification(null); // Clear notification when matched
        socketRef.current.emit('join-chat', { chatId: data.chatId });
        console.log('Joined room:', data.chatId);
      }
    });

    socketRef.current.on('new-message', (msg) => {
      console.log('New message:', msg);
      setMessages(prev => [...prev, { ...msg, reactions: msg.reactions || {} }]);
    });

    socketRef.current.on('message-reaction', ({ messageId, emoji, userId }) => {
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const reactions = { ...msg.reactions };
          if (!reactions[emoji]) reactions[emoji] = [];
          if (!reactions[emoji].includes(userId)) {
            reactions[emoji].push(userId);
          }
          return { ...msg, reactions };
        }
        return msg;
      }));
    });

    socketRef.current.on('partner-disconnected', () => {
      console.log('Partner disconnected');
      setNotification('partner-disconnected');
      setChatId(null);
      setChatPartner(null);
      setMessages([]);
      setInQueue(false);
      setQueuePosition(0);
      
      // Automatically rejoin the queue
      joinQueue();
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      console.log('Cleaning up socket...');
      socketRef.current?.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-register user when currentUserId is set
  useEffect(() => {
    if (currentUserId && socketRef.current?.connected) {
      socketRef.current.emit('register-user', { userId: currentUserId });
      console.log('Registered user with server:', currentUserId);
    }
  }, [currentUserId]);

  async function joinQueue() {
    try {
      if (!socketRef.current?.connected) {
        console.warn('Socket not connected yet');
        return;
      }

      const userId = currentUserId;
      if (!userId) {
        console.warn('No user ID available yet');
        return;
      }

      console.log('Attempting to join queue...');
      const result = await api.joinQueue(userId);
      console.log('Queue joined:', result);
      setInQueue(true);
      setQueuePosition(result.queuePosition ?? 0);
    } catch (error) {
      console.error('Error joining queue:', error);
    }
  }

  const leaveQueue = async () => {
    try {
      await api.leaveQueue(currentUserId);
      setInQueue(false);
      setQueuePosition(0);
      setNotification(null); // Clear notification when leaving queue
      console.log('Left queue');
    } catch (error) {
      console.error('Error leaving queue:', error);
    }
  };


  // Removed unused pollQueueStatus to satisfy ESLint

const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!chatId || !currentUserId || !socketRef.current) return;

    const messageData = {
      chatId,
      message: newMessage,
      userId: currentUserId,
      username: currentUsername,
      replyTo: replyingTo
    };

    socketRef.current.emit('send-message', messageData);
    setNewMessage('');
    setReplyingTo(null);
  };

  const handleReaction = (messageId, emoji) => {
    if (!chatId || !currentUserId || !socketRef.current) return;
    
    // Remove any existing reaction from this user first (one reaction per message)
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions };
        // Remove user from all existing reactions
        Object.keys(reactions).forEach(existingEmoji => {
          reactions[existingEmoji] = reactions[existingEmoji].filter(uid => uid !== currentUserId);
          if (reactions[existingEmoji].length === 0) {
            delete reactions[existingEmoji];
          }
        });
        return { ...msg, reactions };
      }
      return msg;
    }));
    
    socketRef.current.emit('add-reaction', { chatId, messageId, emoji, userId: currentUserId });
    setShowActions(null);
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setShowActions(null);
    inputRef.current?.focus();
  };

  const handleLongPress = (messageId) => {
    longPressTimer.current = setTimeout(() => {
      setShowActions(messageId);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleMouseEnter = (messageId) => {
    if (!isMobile) {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      setShowActions(messageId);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      hoverTimer.current = setTimeout(() => {
        setShowActions(null);
      }, 2000); // 2 second delay
    }
  };

  const handleSwipeStart = (e) => {
    const touch = e.touches[0];
    swipeStartX.current = touch.clientX;
    swipeStartY.current = touch.clientY;
  };

  const handleSwipeEnd = (e) => {
    if (!swipeStartX.current || !swipeStartY.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - swipeStartX.current;
    const deltaY = touch.clientY - swipeStartY.current;
    
    // Check if it's a vertical swipe upward (bottom to top)
    if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < -100) {
      // Show warning popup
      setShowWarning(true);
    }
    
    swipeStartX.current = null;
    swipeStartY.current = null;
  };

  const confirmLeaveChat = () => {
    if (chatId && socketRef.current && currentUserId) {
      socketRef.current.emit('leave-chat', { chatId, userId: currentUserId });
      setChatId(null);
      setChatPartner(null);
      setMessages([]);
      setReplyingTo(null);
      setShowActions(null);
      setShowWarning(false);
      joinQueue();
    }
  };

  const handleReportUser = () => {
    if (!chatPartner) return;
    console.log('Reported user:', chatPartner.userId);
    setActionToast('User reported');
    // TODO: send to backend when ready
  };

  const handleBlockUser = () => {
    if (!chatPartner) return;
    console.log('Blocked user:', chatPartner.userId);
    setActionToast('User blocked');
    // TODO: send to backend + prevent future matches
  };

  const handleAddFriend = () => {
    if (!chatPartner) return;
    console.log('Sent friend request to:', chatPartner.userId);
    setActionToast('Friend request sent');
    // TODO: send to backend
  };

  const handleNextUser = () => {
    // Just reuse the same warning popup you already have
    setShowWarning(true);
  };




  // Chat UI
  if (chatId && chatPartner) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <div className="sticky top-0 z-20 bg-gray-800/95 border-b border-gray-700 px-4 py-2 backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            {/* Left: avatar + name */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {chatPartner?.username?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="min-w-0">
                <h2 className="font-medium text-white text-sm truncate">
                  {chatPartner?.username || 'Anonymous'}
                </h2>
                <p className="text-[11px] text-gray-400">
                  Swipe up or tap Next to skip
                </p>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddFriend}
                className="hidden sm:inline-flex items-center px-2 py-1 rounded-full bg-gray-700 hover:bg-gray-600 text-[11px] font-medium"
              >
                + Friend
              </button>

              <button
                onClick={handleReportUser}
                className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-xs text-red-300"
                title="Report"
              >
                !
              </button>

              <button
                onClick={handleBlockUser}
                className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-xs text-yellow-300"
                title="Block"
              >
                ⛔
              </button>

              <button
                onClick={handleNextUser}
                className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-xs font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto">
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 py-6 pb-20 space-y-1"
            onTouchStart={handleSwipeStart}
            onTouchEnd={handleSwipeEnd}
          >
            {messages.map((msg, index) => {
              const isOwn = msg.userId === currentUserId;
              const replyMsg = msg.replyTo ? messages.find(m => m.id === msg.replyTo.id) : null;
              const hasReactions = msg.reactions && Object.keys(msg.reactions).length > 0;

              return (
                <div key={msg.id || index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className="relative max-w-xs pb-4">
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm shadow-lg transition-all duration-200 ${
                        isOwn
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 rounded-br-md'
                          : 'bg-gray-700 rounded-bl-md'
                      }`}
                      onTouchStart={() => handleLongPress(msg.id)}
                      onTouchEnd={handleTouchEnd}
                      onMouseEnter={() => handleMouseEnter(msg.id)}
                      onMouseLeave={handleMouseLeave}
                    >


                      {replyMsg && (
                        <div className="mb-2 pl-3 py-1 rounded-lg bg-black/15 border-l-2 border-white/25">
                          <div className="text-[11px] text-gray-300/80 mb-0.5">
                            Replying to <span className="font-semibold">{replyMsg.username}</span>
                          </div>
                          <div className="text-[11px] text-gray-200/80 line-clamp-2">
                            {replyMsg.message}
                          </div>
                        </div>
                      )}

                      <div className="break-words leading-relaxed">
                        {msg.message}
                      </div>
                    </div>

                    {hasReactions && (
                      <div
                        className={`absolute -bottom-2 ${
                          isOwn ? 'right-3' : 'left-3'
                        } flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-900/90 border border-gray-700/70 shadow-md`}
                      >
                        {Object.entries(msg.reactions).map(([emoji, users]) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(msg.id, emoji)}
                            className="flex items-center gap-0.5 text-xs hover:scale-105 transition-transform"
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px] text-gray-300">{users.length}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {showActions === msg.id && (
                      <div
                        className={`message-actions absolute -top-2 ${
                          isOwn ? 'right-full mr-2' : 'left-full ml-2'
                        } bg-gray-900/95 rounded-2xl shadow-2xl border border-gray-700 p-2 z-10`}
                      >
                        <div className="flex gap-1 mb-1">
                          {['❤️', '😂', '👍', '😮', '😢', '😡'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(msg.id, emoji)}
                              className="w-8 h-8 rounded-xl bg-gray-800/80 hover:bg-gray-700 flex items-center justify-center text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => handleReply(msg)}
                          className="w-full mt-1 px-3 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg flex items-center justify-center gap-1"
                        >
                          <span className="text-sm">↩</span>
                          <span>Reply</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-gray-900 border-t border-gray-700 p-4">
            <div className="max-w-5xl mx-auto">
              {replyingTo && (
                <div className="mb-2 px-3 py-2 bg-gray-900/80 rounded-xl border border-gray-700 flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] text-gray-400 mb-0.5">
                      Replying to <span className="font-semibold text-gray-200">{replyingTo.username}</span>
                    </div>
                    <div className="text-xs text-gray-300 line-clamp-1">
                      {replyingTo.message}
                    </div>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-500 hover:text-gray-200 text-sm"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={replyingTo ? 'Reply...' : 'Type your message...'}
                  autoComplete="off"
                  inputMode="text"
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="hidden sm:inline-block px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-sm transition-colors"
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Warning Popup */}
        {showWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-3">Move to next person?</h3>
              <p className="text-gray-300 text-sm mb-6">Are you sure you want to move to the next person?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWarning(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLeaveChat}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-medium"
                >
                  Yes, move on
                </button>
              </div>
            </div>
          </div>
        )}

        {actionToast && (
          <div className="fixed bottom-20 left-0 right-0 flex justify-center z-30">
            <div className="px-4 py-2 rounded-full bg-black/80 border border-gray-700 text-xs text-gray-100 shadow-lg">
              {actionToast}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Queue / Landing UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white flex flex-col">
      <nav className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-black/40 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl">
            💬
          </div>
          <div>
            <div className="font-bold text-lg tracking-tight">blahbluh</div>
            <div className="text-xs text-gray-400">Anonymous chat, made simple</div>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          Connected as <span className="font-mono text-gray-200">{currentUsername || 'guest'}</span>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-3xl w-full grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            {notification === 'partner-disconnected' && (
              <div className="mb-4 text-sm text-yellow-300 bg-yellow-900/30 border border-yellow-700 px-4 py-3 rounded-lg">
                Your partner disconnected. Looking for a new chat<AnimatedDots />
                {inQueue && (
                  <div className="mt-2 text-xs text-yellow-400">
                    Currently in queue #{queuePosition || 1}
                  </div>
                )}
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              Talk to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">someone new</span>,
              right now.
            </h1>
            <p className="text-gray-300 text-sm md:text-base">
              Join a live chat with a random stranger. No sign-up, no history, just a space to talk.
            </p>

            <div className="space-y-3 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>Socket status: <span className="font-mono">{socketRef.current?.connected ? 'connected' : 'connecting...'}</span></span>
              </div>
              {inQueue && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>In queue · Position: {queuePosition}</span>
                </div>
              )}
            </div>
          </div>

          {inQueue ? (
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <div className="text-sm text-gray-300 mb-4">
                {notification === 'partner-disconnected' ? 'Finding you a new chat' : 'You\'re in the queue'}<AnimatedDots />
              </div>
              <div className="text-5xl font-black mb-2">#{queuePosition || 1}</div>
              <div className="text-xs text-gray-400 mb-6">Waiting to be matched with another user</div>
              <button
                onClick={leaveQueue}
                className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm font-medium"
              >
                Leave queue
              </button>
            </div>
          ) : (
            notification !== 'partner-disconnected' && (
              <div>
                <h2 className="text-3xl font-bold mb-3">Ready to chat?</h2>
                <p className="text-gray-400 mb-8">Connect with a random stranger instantly</p>
                <button onClick={joinQueue} className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-pink-700 rounded-xl text-xl font-bold shadow-lg">
                  Start Chatting
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;

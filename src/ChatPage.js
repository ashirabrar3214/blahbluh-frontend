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
  const [notification, setNotification] = useState(null);
  const currentUserIdRef = useRef(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  // Auto-scroll to bottom when messages change (only if user is at bottom)
  useEffect(() => {
    if (isAtBottom && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 100);
    }
  }, [messages, chatId, isAtBottom]);

  // Check if user is at bottom when they scroll
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold for mobile
      setIsAtBottom(isNearBottom);
    }
  };

  // Force scroll to bottom on new chat
  useEffect(() => {
    if (chatId && messagesContainerRef.current) {
      setIsAtBottom(true);
      const container = messagesContainerRef.current;
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 200);
    }
  }, [chatId]);

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
      setMessages(prev => [...prev, msg]);
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
      const result = await api.joinQueue(userId, currentUsername);
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
    if (!chatId || !currentUserId || !socketRef.current) {
      console.error('Cannot send message: missing chatId, currentUserId, or socket');
      return;
    }

    const messageData = {
      chatId,
      message: newMessage,
      userId: currentUserId,
      username: currentUsername,
    };

    try {
      socketRef.current.emit('send-message', messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleInputBlur = () => {
    if (isMobile && chatId) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleDisconnect = () => {
    if (socketRef.current && chatId && currentUserId) {
      socketRef.current.emit('leave-chat', { chatId, userId: currentUserId });
    }

    setChatId(null);
    setChatPartner(null);
    setMessages([]);
    // keep the same user so they can rejoin later
    setInQueue(false);
    setQueuePosition(0);
  };


  // Chat UI
  if (chatId && chatPartner) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Chatting with {chatPartner.username}</h1>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-sm font-medium"
            >
              End Chat
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto">
          <div 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-6 pb-20 space-y-3"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.userId === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl text-sm shadow-md ${
                    msg.userId === currentUserId ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'
                  }`}
                >
                  {msg.userId !== currentUserId && (
                    <div className="text-xs text-gray-300 mb-1">{msg.username}</div>
                  )}
                  <div>{msg.message}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4">
            <div className="max-w-5xl mx-auto">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onBlur={handleInputBlur}
                  autoComplete="off"
                  inputMode="text"
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="hidden sm:inline-block px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-sm"
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
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

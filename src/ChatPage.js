import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { api } from './api';

function ChatPage({ user }) {
  const [inQueue, setInQueue] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [chatId, setChatId] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const currentUserIdRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

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
        socketRef.current.emit('join-chat', { chatId: data.chatId });
        console.log('Joined room:', data.chatId);
      }
    });

    socketRef.current.on('new-message', (msg) => {
      console.log('New message:', msg);
      setMessages(prev => [...prev, msg]);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      console.log('Cleaning up socket...');
      socketRef.current?.disconnect();
    };
  }, []);

  // Re-register user when currentUserId is set
  useEffect(() => {
    if (currentUserId && socketRef.current?.connected) {
      socketRef.current.emit('register-user', { userId: currentUserId });
      console.log('Registered user with server:', currentUserId);
    }
  }, [currentUserId]);

  const joinQueue = async () => {
    try {
      let userId = currentUserId;

      if (!userId) {
        console.log('Generating new user...');
        const gen = await api.generateUserId();
        userId = gen.userId;
        setCurrentUserId(userId);
      }

      console.log('Attempting to join queue...');
      const result = await api.joinQueue(userId, user.displayName);
      console.log('Queue joined:', result);
      setInQueue(true);
      setQueuePosition(result.queuePosition ?? 0);
    } catch (error) {
      console.error('Error joining queue:', error);
    }
  };

  const leaveQueue = async () => {
    try {
      await api.leaveQueue(currentUserId);
      setInQueue(false);
      setQueuePosition(0);
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
      username: user?.username || 'You',
    };

    try {
      socketRef.current.emit('send-message', messageData);
      setMessages(prev => [...prev, { ...messageData, timestamp: new Date().toISOString() }]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDisconnect = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-chat', { chatId, userId: currentUserId });
      socketRef.current.disconnect();
    }

    setChatId(null);
    setChatPartner(null);
    setMessages([]);
    setCurrentUserId(null);
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

        <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-4 py-6">
          <div className="flex-1 overflow-y-auto mb-4 space-y-3">
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
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-sm"
            >
              Send
            </button>
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
          Connected as <span className="font-mono text-gray-200">{currentUserId || 'guest'}</span>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-3xl w-full grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
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
              <div className="text-sm text-gray-300 mb-4">You're in the queue...</div>
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
            <div>
              <h2 className="text-3xl font-bold mb-3">Ready to chat?</h2>
              <p className="text-gray-400 mb-8">Connect with a random stranger instantly</p>
              <button onClick={joinQueue} className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-pink-700 rounded-xl text-xl font-bold shadow-lg">
                Start Chatting
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;

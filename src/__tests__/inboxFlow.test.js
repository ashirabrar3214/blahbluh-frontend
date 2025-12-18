import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import App from '../App';
import { api } from '../api';
import io from 'socket.io-client';

const unreadStore = { 'user-b': 0 };

const mockApi = {
  generateUserId: jest.fn(() => ({ userId: 'user-a' })),
  getUser: jest.fn(() => Promise.resolve({ id: 'user-a', username: 'User A' })),
  updateUser: jest.fn((_, signupData) => Promise.resolve({ id: 'user-a', username: signupData.username || 'User A' })),
  reportUser: jest.fn(() => Promise.resolve({})),
  addFriend: jest.fn(() => Promise.resolve({})),
  joinQueue: jest.fn(() => Promise.resolve({ queuePosition: 0 })),
  leaveQueue: jest.fn(() => Promise.resolve({})),
  getQueueStatus: jest.fn(() => Promise.resolve({})),
  sendFriendRequest: jest.fn(() => Promise.resolve({})),
  getFriendRequests: jest.fn(() => Promise.resolve([])),
  acceptFriendRequest: jest.fn(() => Promise.resolve({})),
  getFriends: jest.fn(() => {
    console.log('mock getFriends invoked');
    return Promise.resolve([{ userId: 'user-b', username: 'User B' }]);
  }),
  blockUser: jest.fn(() => Promise.resolve({})),
  getFriendChats: jest.fn(() => Promise.resolve([])),
  sendFriendMessage: jest.fn(() => Promise.resolve({})),
  getFriendChatMessages: jest.fn(() => Promise.resolve([])),
  getUnreadCount: jest.fn((userId, friendId) => Promise.resolve(unreadStore[friendId] || 0)),
  markMessagesAsRead: jest.fn((userId, friendId) => {
    unreadStore[friendId] = 0;
    return Promise.resolve({ success: true });
  })
};

Object.assign(api, mockApi);

jest.mock('socket.io-client', () => {
  const listeners = new Map();
  const socket = {
    connected: true,
    on: jest.fn((event, handler) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(handler);
      return socket;
    }),
    off: jest.fn((event, handler) => {
      if (!listeners.has(event)) return socket;
      if (handler) {
        listeners.get(event).delete(handler);
      } else {
        listeners.get(event).clear();
      }
      return socket;
    }),
    emit: jest.fn(),
    disconnect: jest.fn(),
    trigger(event, payload) {
      if (!listeners.has(event)) return;
      listeners.get(event).forEach((handler) => handler(payload));
    },
    reset() {
      listeners.forEach((set) => set.clear());
      socket.on.mockClear();
      socket.off.mockClear();
      socket.emit.mockClear();
      socket.disconnect.mockClear();
      socket.connected = true;
    }
  };
  const ioMock = jest.fn(() => socket);
  ioMock.__socket = socket;
  return ioMock;
});

describe('Inbox unread flow', () => {
  beforeEach(() => {
    unreadStore['user-b'] = 0;
    Object.values(mockApi).forEach((fn) => fn.mockClear());
    io.__socket.reset();
  });

  it('maintains unread count in real time without refresh', async () => {
    const { container } = render(<App initialUser={{ id: 'user-a', username: 'User A' }} />);
    expect(jest.isMockFunction(api.getFriends)).toBe(true);

    const getInboxBadge = () => container.querySelector('[aria-label="Open inbox"] span');

    await waitFor(() => expect(screen.getByText(/Start Chatting/i)).toBeInTheDocument());

    await act(async () => {
      io.__socket.trigger('connect');
    });

    expect(getInboxBadge()).toBeNull();

    const pushFriendMessage = () => {
      unreadStore['user-b'] = 1;
      act(() => {
        io.__socket.trigger('friend-message-received', {
          chatId: 'friend_user-a_user-b',
          userId: 'user-b',
          senderId: 'user-b',
          message: 'hello'
        });
      });
    };

    pushFriendMessage();

    await waitFor(() => {
      const badge = getInboxBadge();
      expect(badge).not.toBeNull();
      expect(badge).toHaveTextContent('1');
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText(/open inbox/i));
    });

    await waitFor(() => expect(screen.getByRole('heading', { name: /Inbox/i })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText(/1 unread message/)).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText('User B'));
    });

    await waitFor(() => expect(api.getFriendChatMessages).toHaveBeenCalled());
    await waitFor(() => expect(api.markMessagesAsRead).toHaveBeenCalledWith('user-a', 'user-b'));

    const goHomeButton = await screen.findAllByText(/blahbluh/i);
    await act(async () => {
      fireEvent.click(goHomeButton[0]);
    });

    await waitFor(() => expect(screen.getByText(/Start Chatting/i)).toBeInTheDocument());
    await waitFor(() => expect(getInboxBadge()).toBeNull());
  });
});

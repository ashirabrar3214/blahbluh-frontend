const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const api = {
  async generateUserId(firebaseUid, username) {
    console.log('🆔 Ensuring Supabase user exists for Firebase UID:', firebaseUid);

    const params = new URLSearchParams();
    if (firebaseUid) params.set('firebaseUid', firebaseUid);
    if (username) params.set('username', username);

    const url = `${API_BASE_URL}/api/generate-user-id?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    console.log('✅ Supabase userId (UUID):', data.userId);
    return data;
  },

  async getUser(userId) {
    console.log(`API: getUser called with userId: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/api/${userId}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    console.log(`API: getUser response for ${userId}:`, data);
    return data;
  },

  async updateUser(userId, updates) {
    console.log(`API: updateUser called for userId: ${userId} with updates:`, updates);
    const response = await fetch(`${API_BASE_URL}/api/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    const data = await response.json();

    // Also update PFP and Interests if they are present in the updates object
    if (updates.pfp || updates.pfp_background) {
      await this.updateUserPfp(userId, updates.pfp, updates.pfp_background);
    }
    if (updates.interests) {
      await this.sendUserInterests(userId, updates.interests);
    }

    console.log(`API: updateUser response for ${userId}:`, data);
    return data;
  },

  async updateUserDemographics(userId, { gender, country, age }) {
    console.log(`API: updateUserDemographics called for userId: ${userId}`);
    return this.updateUser(userId, { gender, country, age });
  },

  async updateUserPfp(userId, pfpLink, pfpBackground) {
    console.log(`API: updateUserPfp called for userId: ${userId} with pfpLink:`, pfpLink, 'bg:', pfpBackground);
    const response = await fetch(`${API_BASE_URL}/api/${userId}/pfp`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pfpLink, pfp_background: pfpBackground })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    console.log(`API: updateUserPfp response for ${userId}:`, data);
    return data;
  },

  async getUserPfp(userId) {
    console.log(`API: getUserPfp called for userId: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/api/${userId}/pfp`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  async reportUser(userId) {
    console.log(`API: reportUser called for userId: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/api/${userId}/report`, {
      method: 'POST'
    });
    const data = await response.json();
    console.log(`API: reportUser response for ${userId}:`, data);
    return data;
  },

  async submitReport(reportData) {
    console.log('API: submitReport called with data:', reportData);
    const response = await fetch(`${API_BASE_URL}/api/moderation/submit-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error submitting report:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    console.log('API: submitReport response:', data);
    return data;
  },

  async addFriend(userId, friendId) {
    console.log(`API: addFriend called for userId: ${userId} and friendId: ${friendId}`);
    const response = await fetch(`${API_BASE_URL}/api/${userId}/friends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId })
    });
    const data = await response.json();
    console.log(`API: addFriend response for ${userId}:`, data);
    return data;
  },

  async joinQueue(userId, tags) {
    console.log('API: Joining queue with userId:', userId, 'and tags:', tags);
    const response = await fetch(`${API_BASE_URL}/api/join-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, tags })
    });
    const data = await response.json();
    console.log('API: Join queue response:', data);
    return data;
  },

  async sendUserInterests(userId, tags) {
    console.log('API: Sending user interests:', tags, 'for user:', userId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/update-interests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tags })
      });
      if (!response.ok) {
        console.error('API: Failed to send user interests, status:', response.status);
      }
      return await response.json();
    } catch (error) {
      console.error('API: Error sending user interests:', error);
    }
  },

  async getUserInterests(userId) {
    console.log(`API: getUserInterests called for userId: ${userId}`);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user-interests/${userId}`);
      if (!response.ok) {
        console.warn(`API: getUserInterests failed with status ${response.status}`);
        return [];
      }
      const data = await response.json();
      console.log(`API: getUserInterests response for ${userId}:`, data);
      return data.interests || [];
    } catch (error) {
      console.error('API: Error getting user interests:', error);
      return [];
    }
  },

  async leaveQueue(userId) {
    console.log('API: Leaving queue for userId:', userId);
    const response = await fetch(`${API_BASE_URL}/api/leave-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await response.json();
    console.log('API: Leave queue response:', data);
    return data;
  },

  async getQueueStatus(userId) {
    console.log('API: Getting queue status for userId:', userId);
    const response = await fetch(`${API_BASE_URL}/api/queue-status/${userId}`);
    const data = await response.json();
    console.log('API: Queue status response:', data);
    return data;
  },

  async sendFriendRequest(fromUserId, toUserId) {
    console.log('API: Sending friend request');
    console.log('From User ID:', fromUserId);
    console.log('To User ID:', toUserId);
    
    const requestBody = { fromUserId, toUserId };
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/friend-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API response:', result);
    return result;
  },

  async getFriendRequests(userId) {
    console.log(`API: getFriendRequests called for userId: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/api/friend-requests/${userId}`);
    const data = await response.json();
    console.log(`API: getFriendRequests response for ${userId}:`, data);
    return data;
  },

  async acceptFriendRequest(requestId, userId) {
    console.log(`API: acceptFriendRequest called for requestId: ${requestId} and userId: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/api/accept-friend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, userId })
    });
    const data = await response.json();
    console.log(`API: acceptFriendRequest response for ${requestId}:`, data);
    return data;
  },

  async getFriends(userId) {
    console.log(`API: getFriends called for userId: ${userId}`);

    // Fetch current user's data to get their username and list of blocked users.
    let currentUserData;
    try {
      currentUserData = await this.getUser(userId);
    } catch (error) {
      console.error("API: getFriends failed to fetch current user data. Cannot check for blocks.", error);
      return []; // Fallback to empty list on critical failure.
    }
    const currentUsername = currentUserData.username;
    if (!currentUsername) {
        console.error("API: getFriends could not determine current username. Cannot check for blocks.");
        return [];
    }
    const currentUserBlockedIds = currentUserData.blocked_users || [];

    const response = await fetch(`${API_BASE_URL}/api/friends/${userId}`);
    const friendsData = await response.json();
    console.log(`API: getFriends raw response for ${userId}:`, friendsData);

    // Filter out friends who are blocked or have blocked the current user.
    const unblockedFriends = [];
    for (const friend of friendsData) {
      const friendId = friend.userId || friend.id;
      // 1. Check if the current user has blocked this friend.
      if (currentUserBlockedIds.includes(friendId)) {
        console.log(`Current user has blocked '${friend.username}'. Not loading inbox.`);
        continue; // Skip this friend
      }

      // 2. Check if this friend has blocked the current user.
      try {
        const { isBlocked } = await this.isBlocked(friend.username, currentUsername);
        if (isBlocked) {
          console.log(`User is blocked by '${friend.username}'. Not loading inbox.`);
          continue; // Skip this friend
        }
      } catch (error) {
        console.warn(
          'Block check failed, assuming NOT blocked:',
          friend.username,
          error
        );
      }
      unblockedFriends.push(friend);
    }

    // Fetch PFPs for each unblocked friend
    const friendsWithPfps = await Promise.all(unblockedFriends.map(async (friend) => {
      try {
        const friendId = friend.userId || friend.id;
        const pfpData = await this.getUserPfp(friendId);
        return { 
          ...friend, 
          pfp: pfpData.pfp || pfpData.pfpLink || friend.pfp,
          pfp_background: pfpData.pfp_background || friend.pfp_background
        };
      } catch (error) {
        console.warn(`API: Failed to load PFP for friend ${friend.userId || friend.id}:`, error);
        return friend;
      }
    }));

    console.log(`API: getFriends filtered response for ${userId}:`, friendsWithPfps);
    return friendsWithPfps;
  },

  async removeFriend(userId, friendId) {
    console.log(`API: removeFriend called for userId: ${userId} and friendId: ${friendId}`);
    const response = await fetch(`${API_BASE_URL}/api/${userId}/friends/${friendId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error removing friend:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    console.log(`API: removeFriend response for ${userId}:`, data);
    return data;
  },

  async blockUser(userId, blockedUserId) {
    console.log(`API: blockUser called for userId: ${userId} to block ${blockedUserId}`);
    const response = await fetch(`${API_BASE_URL}/api/${userId}/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockedUserId })
    });
    const data = await response.json();
    console.log(`API: blockUser response for ${userId}:`, data);
    return data;
  },

  async unblockUser(userId, blockedUserId) {
    console.log(`API: unblockUser called for userId: ${userId} to unblock ${blockedUserId}`);
    const response = await fetch(`${API_BASE_URL}/api/${userId}/unblock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockedUserId })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error unblocking user:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    console.log(`API: unblockUser response for ${userId}:`, data);
    return data;
  },

  async isBlocked(blockerUsername, blockedUsername) {
    console.log(`API: isBlocked check from '${blockerUsername}' on '${blockedUsername}'`);
    const response = await fetch(`${API_BASE_URL}/api/is-blocked?blockerUsername=${encodeURIComponent(blockerUsername)}&blockedUsername=${encodeURIComponent(blockedUsername)}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error checking block status:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    console.log(`API: isBlocked response:`, data);
    return data;
  },
  
  async submitReview(reviewerId, reviewedUserId, rating) {
    console.log(`API: submitReview called from ${reviewerId} for ${reviewedUserId} with rating ${rating}`);
    const res = await fetch(`${API_BASE_URL}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewerId, reviewedUserId, rating })
    });
    const data = await res.json();
    console.log(`API: submitReview response:`, data);
    return data;
  },

  async getReview(reviewerId, reviewedUserId) {
    console.log(`API: getReview called from ${reviewerId} for ${reviewedUserId}`);
    const res = await fetch(
      `${API_BASE_URL}/api/review/${reviewerId}/${reviewedUserId}`
    );
    const data = await res.json();
    console.log(`API: getReview response:`, data);
    return data;
  },

  async getUserRating(userId) {
    console.log(`API: getUserRating called for userId: ${userId}`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/user-rating/${userId}`);
      if (!res.ok) {
        console.error(`API: getUserRating failed for ${userId} with status ${res.status}`);
        return { reviewCount: 0, averageRating: 0 };
      }
      const data = await res.json();
      console.log(`API: getUserRating raw response for ${userId}:`, data);

      // The backend might return an array, and with snake_case keys. Let's normalize it.
      const rawRating = Array.isArray(data) ? data[0] : data;

      // FIX: Check for 'count' (backend format) OR 'review_count' (legacy/db format)
      // and 'average' (backend format) OR 'average_rating'
      const count = rawRating.count !== undefined ? rawRating.count : rawRating.review_count;
      const avg = rawRating.average !== undefined ? rawRating.average : rawRating.average_rating;

      if (count === undefined) {
        return { reviewCount: 0, averageRating: 0 };
      }

      return {
        reviewCount: parseInt(count, 10) || 0,
        averageRating: parseFloat(avg) || 0,
      };
    } catch (error) {
      console.error(`API: Error in getUserRating for ${userId}:`, error);
      return { reviewCount: 0, averageRating: 0 };
    }
  },
  
  async getFriendChats(userId) {
    console.log(`API: getFriendChats called for userId: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/api/friend-chats/${userId}`);
    const data = await response.json();
    console.log(`API: getFriendChats response for ${userId}:`, data);
    return data;
  },

  async sendFriendMessage(chatId, userId, message) {
    console.log(`API: sendFriendMessage called for chatId: ${chatId} from userId: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/api/friend-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, userId, message })
    });
    const data = await response.json();
    console.log(`API: sendFriendMessage response for ${chatId}:`, data);
    return data;
  },

  async getFriendChatMessages(chatId, before = null, limit = 50) {
  console.log(`API: getFriendChatMessages called for chatId: ${chatId}, before: ${before}, limit: ${limit}`);

  const url = new URL(`${API_BASE_URL}/api/friend-chat-messages/${chatId}`);
  if (before) url.searchParams.set('before', before);
  if (limit) url.searchParams.set('limit', limit);

  const response = await fetch(url.toString());
  if (!response.ok) {
    console.error(`API: getFriendChatMessages error for chatId: ${chatId}, status: ${response.status}`);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log(`API: getFriendChatMessages response for ${chatId}:`, data);
  if (data && !Array.isArray(data) && Array.isArray(data.messages)) {
    return data.messages;
  }
  return data;
},

  async getUnreadCount(userId, friendId) {
    console.log(`API: getUnreadCount called for userId: ${userId} and friendId: ${friendId}`);
    const response = await fetch(`${API_BASE_URL}/api/unread-count/${userId}/${friendId}`);
    const data = await response.json();
    console.log(`API: getUnreadCount response for ${userId}/${friendId}:`, data);
    return data;
  },

  async markMessagesAsRead(userId, friendId) {
    console.log(`API: markMessagesAsRead called for userId: ${userId} and friendId: ${friendId}`);
    const response = await fetch(`${API_BASE_URL}/api/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, friendId })
    });
    const data = await response.json();
    console.log(`API: markMessagesAsRead response for ${userId}/${friendId}:`, data);
    return data;
  },

  async suggestTopic(userId) {
    console.log(`API: suggestTopic called for userId: ${userId}`);
    if (!userId) {
      throw new Error('A userId is required to suggest a topic.');
    }
    const response = await fetch(`${API_BASE_URL}/api/suggest-topic/${userId}`);
    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Could not read error body');
      console.error('Failed to suggest a topic:', response.status, errorBody);
      throw new Error(`Failed to suggest a topic. Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`API: suggestTopic response for ${userId}:`, data);
    return data; // expecting { success: true, suggestion: '...' }
  },

  async exitChat(socketId, userId, chatId, requeuePartner = false) {
    console.log(`API: exitChat called with socketId: ${socketId}, userId: ${userId}, chatId: ${chatId}, requeuePartner: ${requeuePartner}`);
    const response = await fetch(`${API_BASE_URL}/api/exit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ socketId, userId, chatId, action: 'EXIT_CHAT', requeuePartner })
    });
    const data = await response.json();
    console.log(`API: exitChat response:`, data);
    return data;
  },

  async skipChat(socketId, userId, chatId) {
    console.log(`API: skipChat called with socketId: ${socketId}, userId: ${userId}, chatId: ${chatId}`);
    const response = await fetch(`${API_BASE_URL}/api/skip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ socketId, userId, chatId, action: 'SKIP' })
    });
    const data = await response.json();
    console.log(`API: skipChat response:`, data);
    return data;
  },

  // --- Admin / Moderation API ---

  async checkIsAdmin(email) {
    console.log('API: Checking admin status for email:', email);
    try {
      const response = await fetch(`${API_BASE_URL}/api/moderation/check-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      // If the backend route isn't ready yet, fail gracefully
      if (!response.ok) return false;
      
      const data = await response.json();
      return data.isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  async getReportedUsers(limit = 50) {
    console.log(`API: getReportedUsers called with limit ${limit}`);
    const response = await fetch(`${API_BASE_URL}/api/moderation/reported?limit=${limit}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch reported users: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    return data;
  },

  async getUserReports(userId) {
    console.log(`API: getUserReports called for userId: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/api/moderation/reports/${userId}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch user reports: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    return data;
  },

  async banUser(userId, reason, durationHours = 24) {
    console.log(`API: banUser called for ${userId} (${durationHours}h)`);
    const response = await fetch(`${API_BASE_URL}/api/moderation/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, reason, durationHours })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    return await response.json();
  },

  async unbanUser(userId) {
    console.log(`API: unbanUser called for ${userId}`);
    const response = await fetch(`${API_BASE_URL}/api/moderation/unban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    return await response.json();
  }
};
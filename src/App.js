import { useState } from 'react';
import ChatPage from './ChatPage';
import SignupForm from './components/SignupForm';
import { api } from './api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignupComplete = async (signupData) => {
    setLoading(true);
    try {
      const gen = await api.generateUserId();
      const user = await api.updateUser(gen.userId, signupData);
      setCurrentUser(user);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // 🔥 GLOBAL SIGNUP GATE
  if (!currentUser) {
    return (
      <SignupForm
        onComplete={handleSignupComplete}
        loading={loading}
      />
    );
  }

  // ✅ App content only AFTER signup
  return (
    <ChatPage 
      user={currentUser}
      currentUserId={currentUser.id}
      currentUsername={currentUser.username}
    />
  );
}

export default App;

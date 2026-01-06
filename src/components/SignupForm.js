import React, { useState } from 'react';
import PfpSelect from './PfpSelect';
import TagInput from '../TagInput';
import { api } from '../api';
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, getAdditionalUserInfo } from 'firebase/auth';
import '../TagInput.css';

function SignupForm({ onComplete, loading = false }) {
  const generateRandomUsername = () => {
    const adjectives = ['Happy', 'Lucky', 'Sunny', 'Clever', 'Brave', 'Calm', 'Witty', 'Fuzzy', 'Jolly', 'Kind', 'Swift', 'Silent', 'Cosmic', 'Neon', 'Hyper', 'Retro', 'Glitch', 'Cyber'];
    const nouns = ['Panda', 'Tiger', 'Lion', 'Bear', 'Fox', 'Wolf', 'Eagle', 'Hawk', 'Owl', 'Seal', 'Ninja', 'Star', 'Moon', 'Sun', 'Ghost', 'Bot', 'Byte', 'Pixel'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 1000);
    return `${adj}${noun}${num}`;
  };

  const [view, setView] = useState('welcome'); // 'welcome', 'login', 'signup'
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: generateRandomUsername(),
    email: '',
    password: '',
    age: '',
    gender: '',
    country: '',
    pfp: '',
    pfp_background: '',
    interests: [],
  });
  const [showPfpSelect, setShowPfpSelect] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = (e) => {
    e.preventDefault();
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setStep(s => s - 1);
  };

  const handlePfpSave = ({ pfp, bg }) => {
    setFormData(prev => ({ ...prev, pfp, pfp_background: bg }));
    setShowPfpSelect(false);
  };

  const handleRegenerateUsername = (e) => {
    e.preventDefault();
    setFormData(prev => ({ ...prev, username: generateRandomUsername() }));
  };

  const handleGoogleAuth = async () => {
    if (loading || isSubmitting) return;
    try {
      setIsSubmitting(true);
      setError('');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const details = getAdditionalUserInfo(result);

      if (details.isNewUser) {
        // New user: pre-fill data and go to signup wizard
        setFormData(prev => ({
          ...prev,
          email: user.email,
          username: user.displayName || generateRandomUsername(),
          uid: user.uid,
          authMethod: 'google'
        }));
        setView('signup');
        setStep(1);
      } else {
        // Existing user: login directly
        const { userId } = await api.generateUserId(user.uid, user.displayName || '');
        onComplete({ uid: user.uid, userId, isLogin: true });
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/internal-error') {
        console.warn(
          "Possible CSP issue detected. Ensure your Content-Security-Policy includes:\n" +
          "  script-src: https://apis.google.com https://www.gstatic.com\n" +
          "  frame-src: https://accounts.google.com\n" +
          "  connect-src: https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com"
        );
        setError('Authentication failed (Internal Error). Check console for CSP/network issues.');
      } else {
        setError('Google authentication failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    if (loading || isSubmitting) return;
    try {
      setIsSubmitting(true);
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const uid = userCredential.user.uid;
      const { userId } = await api.generateUserId(uid);
      onComplete({ uid, userId, isLogin: true });
    } catch (err) {
      console.error(err);
      setError('Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (loading || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      setError('');
      let uid = formData.uid;

      // If manual signup, create user in Firebase first
      if (!uid) {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        uid = userCredential.user.uid;
      }

      const { userId } = await api.generateUserId(uid, formData.username);
      const { password, ...safeForm } = formData;
      onComplete({ ...safeForm, uid, userId, isLogin: false });
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in instead.');
      } else {
        setError(err.message || 'Signup failed. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  if (view === 'welcome') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-[#ffbd59]/30">
        <div className="w-full max-w-md relative text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xs h-32 bg-[#ffbd59]/20 blur-[100px] pointer-events-none" />
          
          <img src="https://pub-43e3d36a956c411fb92f0c0771910642.r2.dev/logo-yellow.svg" alt="blahbluh" className="w-20 h-20 object-contain rounded-[22%] mx-auto mb-6 shadow-lg" />
          <h1 className="text-4xl font-bold text-[#fefefe] tracking-tight mb-2">blahbluh</h1>
          <p className="text-[#fefefe]/60 mb-10">Anonymous chat, real connections.</p>

          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={handleGoogleAuth} disabled={loading || isSubmitting} className="w-full py-3.5 rounded-xl bg-[#fefefe] text-black font-bold hover:bg-[#fefefe]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
            <button onClick={() => setView('signup')} className="w-full py-3.5 rounded-xl bg-[#ffbd59] text-black font-bold hover:bg-[#ffbd59]/90 transition-all">
              Sign up with Email
            </button>
            <button onClick={() => setView('login')} className="w-full py-3.5 rounded-xl bg-[#fefefe]/10 text-[#fefefe] font-medium hover:bg-[#fefefe]/20 transition-all border border-[#fefefe]/10">
              Log in
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md relative">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#fefefe]">Welcome back</h2>
            <p className="text-[#fefefe]/60">Enter your details to login.</p>
          </div>
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#fefefe]/60 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="w-full bg-[#fefefe]/5 border border-[#fefefe]/10 rounded-xl px-4 py-3 text-[#fefefe] focus:outline-none focus:ring-2 focus:ring-[#ffbd59]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#fefefe]/60 uppercase tracking-wider mb-1.5">Password</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required className="w-full bg-[#fefefe]/5 border border-[#fefefe]/10 rounded-xl px-4 py-3 text-[#fefefe] focus:outline-none focus:ring-2 focus:ring-[#ffbd59]" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" disabled={loading || isSubmitting} className="w-full py-3.5 rounded-xl bg-[#ffbd59] text-black font-bold hover:bg-[#ffbd59]/90 disabled:opacity-50 transition-all pt-4">
              {loading || isSubmitting ? 'Logging in...' : 'Log In'}
            </button>
            <button type="button" onClick={() => setView('welcome')} className="w-full py-3.5 rounded-xl bg-transparent text-[#fefefe]/60 hover:text-[#fefefe] font-medium transition-all">
              Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-[#ffbd59]/30">
      <div className="w-full max-w-md relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xs h-32 bg-[#ffbd59]/20 blur-[100px] pointer-events-none" />

        <div className="text-center mb-10">
          <img src="https://pub-43e3d36a956c411fb92f0c0771910642.r2.dev/logo-yellow.svg" alt="blahbluh" className="w-16 h-16 object-contain rounded-[22%] mx-auto mb-4 shadow-lg" />
          <h1 className="text-3xl font-bold text-[#fefefe] tracking-tight">Welcome to blahbluh</h1>
          <p className="text-[#fefefe]/60 mt-2">Create your anonymous profile to get started.</p>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-4 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold text-[#fefefe]/60 uppercase tracking-wider mb-1.5">Username</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={formData.username} 
                  readOnly 
                  className="w-full bg-[#fefefe]/5 border border-[#fefefe]/10 rounded-xl px-4 py-3 text-[#fefefe] focus:outline-none focus:ring-2 focus:ring-[#ffbd59] opacity-80 cursor-default" 
                />
                <button type="button" onClick={handleRegenerateUsername} className="px-4 bg-[#fefefe]/10 hover:bg-[#fefefe]/20 rounded-xl text-[#fefefe] transition-all flex items-center justify-center" title="Generate new username">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#fefefe]/60 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="you@example.com" required disabled={formData.authMethod === 'google'} className="w-full bg-[#fefefe]/5 border border-[#fefefe]/10 rounded-xl px-4 py-3 text-[#fefefe] focus:outline-none focus:ring-2 focus:ring-[#ffbd59] disabled:opacity-50" />
            </div>
            {formData.authMethod !== 'google' && (
              <div>
                <label className="block text-xs font-bold text-[#fefefe]/60 uppercase tracking-wider mb-1.5">Password</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" required className="w-full bg-[#fefefe]/5 border border-[#fefefe]/10 rounded-xl px-4 py-3 text-[#fefefe] focus:outline-none focus:ring-2 focus:ring-[#ffbd59]" />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setView('welcome')} className="flex-1 py-3.5 rounded-xl bg-[#fefefe]/10 text-[#fefefe]/80 font-medium hover:bg-[#fefefe]/20 transition-all">Cancel</button>
              <button type="submit" disabled={!formData.email || !formData.username || (formData.authMethod !== 'google' && !formData.password)} className="flex-1 py-3.5 rounded-xl bg-[#ffbd59] text-black font-bold hover:bg-[#ffbd59]/90 disabled:opacity-50 transition-all">Next</button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleNext} className="space-y-4 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold text-[#fefefe]/60 uppercase tracking-wider mb-1.5">Age</label>
              <input type="number" min="13" max="120" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} placeholder="Your age" required className="w-full bg-[#fefefe]/5 border border-[#fefefe]/10 rounded-xl px-4 py-3 text-[#fefefe] focus:outline-none focus:ring-2 focus:ring-[#ffbd59]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#fefefe]/60 uppercase tracking-wider mb-1.5">Gender</label>
              <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} required className="w-full bg-[#fefefe]/5 border border-[#fefefe]/10 rounded-xl px-4 py-3 text-[#fefefe] focus:outline-none focus:ring-2 focus:ring-[#ffbd59] [&>option]:text-black">
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#fefefe]/60 uppercase tracking-wider mb-1.5">Country</label>
              <select value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} required className="w-full bg-[#fefefe]/5 border border-[#fefefe]/10 rounded-xl px-4 py-3 text-[#fefefe] focus:outline-none focus:ring-2 focus:ring-[#ffbd59] [&>option]:text-black">
                <option value="">Select your country</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleBack} className="flex-1 py-3.5 rounded-xl bg-[#fefefe]/10 text-[#fefefe]/80 font-medium hover:bg-[#fefefe]/20 transition-all">Back</button>
              <button type="submit" disabled={!formData.gender || !formData.country || !formData.age} className="flex-1 py-3.5 rounded-xl bg-[#ffbd59] text-black font-bold hover:bg-[#ffbd59]/90 disabled:opacity-50 transition-all">Next</button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center animate-in fade-in duration-300">
            <label className="block text-xs font-bold text-[#fefefe]/60 uppercase tracking-wider mb-4">Choose your Avatar</label>
            <div className="flex justify-center mb-6">
              <div 
                className={`relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl overflow-hidden border-4 border-black ${
                  formData.pfp_background ? 'bg-black' : 'bg-gradient-to-br from-[#ffbd59] to-[#ff907c]'
                }`}
                style={formData.pfp_background ? { backgroundImage: `url(${formData.pfp_background})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                {formData.pfp ? (
                  <img src={formData.pfp} alt="Profile" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-4xl font-bold text-[#fefefe]">{getInitials(formData.username)}</span>
                )}
              </div>
            </div>
            <button onClick={() => setShowPfpSelect(true)} className="w-full py-3 mb-4 rounded-xl bg-[#fefefe]/10 text-[#fefefe] font-medium hover:bg-[#fefefe]/20 transition-all">
              Select Avatar
            </button>
            <div className="flex gap-3">
              <button type="button" onClick={handleBack} className="flex-1 py-3.5 rounded-xl bg-[#fefefe]/10 text-[#fefefe]/80 font-medium hover:bg-[#fefefe]/20 transition-all">Back</button>
              <button type="button" onClick={handleNext} disabled={!formData.pfp} className="flex-1 py-3.5 rounded-xl bg-[#ffbd59] text-black font-bold hover:bg-[#ffbd59]/90 disabled:opacity-50 transition-all">Next</button>
            </div>
            {showPfpSelect && (
              <PfpSelect
                onClose={() => setShowPfpSelect(false)}
                onSave={handlePfpSave}
                currentPfp={formData.pfp}
                currentBg={formData.pfp_background}
              />
            )}
          </div>
        )}

        {step === 4 && (
          <form onSubmit={handleSignupSubmit} className="animate-in fade-in duration-300">
            <div className="mb-2 ml-1 h-6 flex items-center">
              <label className="block text-xs font-bold text-[#fefefe]/60 uppercase tracking-wider">What do you want to talk about?</label>
            </div>
            <div className="mb-6">
              <TagInput tags={formData.interests} onTagsChange={(tags) => setFormData({...formData, interests: tags})} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={handleBack} className="flex-1 py-3.5 rounded-xl bg-[#fefefe]/10 text-[#fefefe]/80 font-medium hover:bg-[#fefefe]/20 transition-all">Back</button>
              <button type="submit" disabled={loading || isSubmitting || formData.interests.length === 0} className="flex-1 py-3.5 rounded-xl bg-[#ffbd59] text-black font-bold hover:bg-[#ffbd59]/90 disabled:opacity-50 transition-all">
                {loading || isSubmitting ? 'Creating account...' : 'Finish Signup'}
              </button>
            </div>
          </form>
        )}

        <p className="text-xs text-[#fefefe]/40 text-center mt-8">
          Your email is only used for account recovery and is not shared.
        </p>
      </div>
    </div>
  );
}

export default SignupForm;
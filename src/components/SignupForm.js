import React, { useState } from 'react';
import PfpSelect from './PfpSelect';
import TagInput from '../TagInput';

import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import '../TagInput.css';

function SignupForm({ onComplete, loading = false, isUpgrade = false }) {
  const generateRandomUsername = () => {
    const adjectives = ['Happy', 'Lucky', 'Sunny', 'Clever', 'Brave', 'Calm', 'Witty', 'Fuzzy', 'Jolly', 'Kind', 'Swift', 'Silent', 'Cosmic', 'Neon', 'Hyper', 'Retro', 'Glitch', 'Cyber'];
    const nouns = ['Panda', 'Tiger', 'Lion', 'Bear', 'Fox', 'Wolf', 'Eagle', 'Hawk', 'Owl', 'Seal', 'Ninja', 'Star', 'Moon', 'Sun', 'Ghost', 'Bot', 'Byte', 'Pixel'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 1000);
    return `${adj}${noun}${num}`;
  };

  const [formData, setFormData] = useState({
    username: generateRandomUsername(),
    email: '',
    name: '', // New field
    age: '',
    gender: 'prefer-not-to-say', // Default
    country: '',
    pfp: '',
    pfp_background: '',
    interests: [],
  });
  
  // Local state for DOB calculation
  const [dob, setDob] = useState('');
  
  const [showPfpSelect, setShowPfpSelect] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to calculate age from DOB
  const handleDobChange = (e) => {
    const date = e.target.value;
    setDob(date);
    if (date) {
      const birthDate = new Date(date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData(prev => ({ ...prev, age: age }));
    }
  };

  const handlePfpSave = ({ pfp, bg }) => {
    setFormData(prev => ({ ...prev, pfp, pfp_background: bg }));
    setShowPfpSelect(false);
  };

  const handleRegenerateUsername = (e) => {
    e.preventDefault();
    setFormData(prev => ({ ...prev, username: generateRandomUsername() }));
  };

  // --- GOOGLE AUTH HANDLER (For new users) ---
  const handleGoogleAuth = async () => {
    if (loading || isSubmitting) return;
    try {
      setIsSubmitting(true);
      setError('');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Quick Signup: Use defaults immediately
      onComplete({
        uid: user.uid,
        email: user.email,
        username: generateRandomUsername(),
        age: 18,
        gender: 'prefer-not-to-say',
        country: 'Other',
        interests: ['bored'],
        isLogin: true
      });
    } catch (err) {
      console.error(err);
      setError('Google authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UPGRADE SUBMIT HANDLER ---
  const handleUpgradeSubmit = (e) => {
    e.preventDefault();
    if (!formData.age || formData.age < 13) {
      setError('You must be at least 13 years old.');
      return;
    }
    // We only send the data we want to store (age is stored, dob is NOT)
    onComplete(formData);
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  // ==========================================
  // VIEW: PROFILE CUSTOMIZATION POPUP (Upgrade)
  // ==========================================
  if (isUpgrade) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans">
        <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="p-6 border-b border-white/5 text-center bg-[#111]">
            <h2 className="text-2xl font-bold text-white mb-1">Customize Profile</h2>
            <p className="text-white/50 text-sm">Show users more about you to get 50 daily matches.</p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
            
            {/* 1. Avatar Section (Top) */}
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer" onClick={() => setShowPfpSelect(true)}>
                <div className="w-28 h-28 rounded-full overflow-hidden shadow-2xl ring-4 ring-white/5 group-hover:ring-[#ffbd59]/50 transition-all relative">
                   {/* Background */}
                   <div 
                     className={`absolute inset-0 ${formData.pfp_background ? 'bg-black' : 'bg-gradient-to-br from-[#ffbd59] to-[#ff907c]'}`} 
                     style={formData.pfp_background ? { backgroundImage: `url(${formData.pfp_background})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}} 
                   />
                   {/* Avatar Image */}
                   <div className="absolute inset-0 flex items-center justify-center">
                     {formData.pfp ? (
                       <img src={formData.pfp} alt="Profile" className="w-full h-full object-contain" />
                     ) : (
                       <span className="text-3xl font-bold text-white/90">{getInitials(formData.username)}</span>
                     )}
                   </div>
                   {/* Edit Overlay */}
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                   </div>
                </div>
                <p className="text-center text-xs text-white/40 mt-3 font-medium uppercase tracking-wide">Tap to edit</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-[#fefefe]/40 uppercase tracking-wider mb-2 ml-1">Display Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="What should we call you?" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#ffbd59] transition-all"
                />
              </div>

              {/* Username (with Refresh) */}
              <div>
                <label className="block text-xs font-bold text-[#fefefe]/40 uppercase tracking-wider mb-2 ml-1">Username (Anonymous)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={formData.username} 
                    readOnly 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white/70 cursor-default focus:outline-none" 
                  />
                  <button 
                    onClick={handleRegenerateUsername}
                    className="px-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all"
                    title="Generate new username"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Birth Date */}
                <div>
                  <label className="block text-xs font-bold text-[#fefefe]/40 uppercase tracking-wider mb-2 ml-1">Birth Date</label>
                  <input 
                    type="date" 
                    value={dob}
                    onChange={handleDobChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#ffbd59] transition-all [color-scheme:dark]"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-bold text-[#fefefe]/40 uppercase tracking-wider mb-2 ml-1">Country</label>
                  <select 
                    value={formData.country} 
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#ffbd59] appearance-none"
                  >
                    <option value="" className="text-black">Select Country</option>
                    <option value="United States" className="text-black">United States</option>
                    <option value="United Kingdom" className="text-black">United Kingdom</option>
                    <option value="Canada" className="text-black">Canada</option>
                    <option value="Australia" className="text-black">Australia</option>
                    <option value="India" className="text-black">India</option>
                    <option value="Germany" className="text-black">Germany</option>
                    <option value="Other" className="text-black">Other</option>
                  </select>
                </div>
              </div>

              {/* Interests (Bottom) */}
              <div>
                <label className="block text-xs font-bold text-[#fefefe]/40 uppercase tracking-wider mb-2 ml-1">Interests</label>
                <TagInput tags={formData.interests} onTagsChange={(tags) => setFormData({...formData, interests: tags})} />
              </div>

            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </div>

          {/* Footer Buttons */}
          <div className="p-6 border-t border-white/5 bg-[#111] space-y-3">
            <button 
              onClick={handleUpgradeSubmit}
              disabled={!formData.country || !formData.age || loading}
              className="w-full py-4 rounded-2xl bg-[#ffbd59] text-black font-bold hover:bg-[#ffbd59]/90 disabled:opacity-50 transition-all text-lg shadow-lg shadow-[#ffbd59]/20"
            >
              Save & Continue
            </button>
            <button 
              onClick={() => onComplete(null)} // Pass null to close without saving
              className="w-full py-3 rounded-2xl bg-transparent text-white/40 font-medium hover:text-white transition-all"
            >
              Remind me later
            </button>
          </div>

          {/* PFP Select Modal Layer */}
          {showPfpSelect && (
            <div className="absolute inset-0 z-50">
               <PfpSelect
                onClose={() => setShowPfpSelect(false)}
                onSave={handlePfpSave}
                currentPfp={formData.pfp}
                currentBg={formData.pfp_background}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: DEFAULT GOOGLE SIGNUP (Welcome)
  // ==========================================
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-[#ffbd59]/30">
      <div className="w-full max-w-md text-center">
        <img src="https://pub-43e3d36a956c411fb92f0c0771910642.r2.dev/logo-yellow.svg" alt="blahbluh" className="w-20 h-20 object-contain rounded-[22%] mx-auto mb-6 shadow-lg" />
        <h1 className="text-4xl font-bold text-[#fefefe] tracking-tight mb-2">blahbluh</h1>
        <p className="text-[#fefefe]/60 mb-10">Anonymous chat, real connections.</p>

        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button onClick={handleGoogleAuth} disabled={loading || isSubmitting} className="w-full py-3.5 rounded-xl bg-[#fefefe] text-black font-bold hover:bg-[#fefefe]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}

export default SignupForm;
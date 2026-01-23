import React, { useState } from 'react';
import { api } from '../api';
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import TagInput from '../TagInput'; // Assuming TagInput is for interests

// Add isUpgrade prop
function SignupForm({ onComplete, loading = false, isUpgrade = false }) {
  
  // ... imports and state ...
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: generateRandomUsername(),
    email: '',
    age: 18,
    gender: 'prefer-not-to-say',
    country: 'Other',
    pfp: '',
    pfp_background: '',
    interests: [],
  });

  // Initialize step based on mode
  const [step, setStep] = useState(isUpgrade ? 2 : 1); 

  // ... generateRandomUsername ...
  function generateRandomUsername() {
    const adjectives = ['Happy', 'Lucky', 'Sunny', 'Clever', 'Brave', 'Calm', 'Witty', 'Fuzzy', 'Jolly', 'Kind', 'Swift', 'Silent', 'Cosmic', 'Neon', 'Hyper', 'Retro', 'Glitch', 'Cyber'];
    const nouns = ['Panda', 'Tiger', 'Lion', 'Bear', 'Fox', 'Wolf', 'Eagle', 'Hawk', 'Owl', 'Seal', 'Ninja', 'Star', 'Moon', 'Sun', 'Ghost', 'Bot', 'Byte', 'Pixel'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 1000);
    return `${adj}${noun}${num}`;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (newTags) => {
    setFormData(prev => ({ ...prev, interests: newTags }));
  };
  
  // Modify handleGoogleAuth to SKIP the wizard if it's the initial signup
  const handleGoogleAuth = async () => {
    if (loading || isSubmitting) return;
    try {
        setIsSubmitting(true);
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const details = getAdditionalUserInfo(result);
    
        // QUICK MODE: Immediately finish with defaults
        if (!isUpgrade) {
            const { userId } = await api.generateUserId(user.uid, formData.username);
            onComplete({ 
                uid: user.uid, 
                email: user.email,
                username: formData.username,
                age: 18, 
                gender: 'prefer-not-to-say', 
                country: 'Other', 
                interests: ['bored'],
                isLogin: details.isNewUser ? false : true,
                userId,
            });
            return; 
        }
        
        // UPGRADE MODE: just get email and uid, proceed with form
        setFormData(prev => ({ ...prev, email: user.email, uid: user.uid }));
        // In isUpgrade, we assume they already have an account, so we proceed to step 2
        setStep(2);

    } catch (err) {
        console.error(err);
        setError('Google authentication failed.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
        // In an upgrade flow, the user already exists.
        // We are just updating their profile.
        onComplete(formData);
    } catch (error) {
        console.error("Update failed", error);
        setError("Profile update failed.");
    } finally {
        setIsSubmitting(false);
    }
  }

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => {
    if (isUpgrade && step === 2) {
      onComplete(null); // Close modal if they go back from the first step of upgrade
    } else {
      setStep(s => s - 1);
    }
  };


  // If isUpgrade is true, render the specific steps inside a container
  if (isUpgrade) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
         <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Complete Your Profile</h2>
            <p className="text-zinc-400 text-center mb-6">Unlock 50 daily matches by setting up your profile.</p>
            
            {/* Show Steps 2, 3, or 4 based on state */}
            {step === 2 && (
               <div className="space-y-4 animate-in fade-in duration-300">
                    <h3 className="text-lg font-semibold text-zinc-200">About You</h3>
                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-zinc-400 mb-1">Age</label>
                        <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-[#ffbd59] outline-none" min="18" />
                    </div>
                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-zinc-400 mb-1">Gender</label>
                        <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-[#ffbd59] outline-none">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="non-binary">Non-binary</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                        <button onClick={() => onComplete(null)} className="text-zinc-400 hover:text-white transition">Cancel</button>
                        <button onClick={nextStep} className="bg-[#ffbd59] text-black font-bold px-6 py-2 rounded-lg hover:bg-opacity-90 transition">Next</button>
                    </div>
               </div>
            )}
            {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <h3 className="text-lg font-semibold text-zinc-200">Location</h3>
                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-zinc-400 mb-1">Country</label>
                        {/* A proper country dropdown would be better, but this is a quick implementation */}
                        <input type="text" name="country" id="country" value={formData.country} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-[#ffbd59] outline-none" />
                    </div>
                    <div className="flex justify-between items-center pt-4">
                        <button onClick={prevStep} className="text-zinc-400 hover:text-white transition">Back</button>
                        <button onClick={nextStep} className="bg-[#ffbd59] text-black font-bold px-6 py-2 rounded-lg hover:bg-opacity-90 transition">Next</button>
                    </div>
                </div>
            )}
            {step === 4 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <h3 className="text-lg font-semibold text-zinc-200">Your Interests</h3>
                     <p className="text-sm text-zinc-400">Add up to 5 interests to help us find better matches.</p>
                    <TagInput tags={formData.interests} onTagsChange={handleTagsChange} />
                    <div className="flex justify-between items-center pt-4">
                        <button onClick={prevStep} className="text-zinc-400 hover:text-white transition">Back</button>
                        <button onClick={handleFormSubmit} disabled={isSubmitting} className="bg-green-500 text-white font-bold px-6 py-2 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50">
                            {isSubmitting ? 'Saving...' : 'Complete Profile'}
                        </button>
                    </div>
                </div>
            )}
         </div>
      </div>
    );
  }

  // ... Rest of the original simplified Welcome/Google View code ...
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
            </div>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
    </div>
  );
}

export default SignupForm;

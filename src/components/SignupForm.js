import React, { useState, useEffect } from 'react';

function SignupForm({ onComplete, loading = false }) {
  // To temporarily pause the signup page, set this to true.
  // To re-enable the signup form, set this to false.
  const BYPASS_SIGNUP = true;

  const [formData, setFormData] = useState({
    gender: '',
    country: ''
  });

  useEffect(() => {
    if (BYPASS_SIGNUP && !loading) {
      onComplete({
        gender: 'male',
        country: 'United States',
      });
    }
  }, [BYPASS_SIGNUP, onComplete, loading]);

  if (BYPASS_SIGNUP) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-white to-zinc-400 text-black flex items-center justify-center font-bold text-2xl shadow-lg mx-auto mb-4 animate-pulse">
              B
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome to blahbluh</h1>
            <p className="text-gray-400">Getting things ready for you...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.gender || !formData.country) return;
    onComplete(formData);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-white to-zinc-400 text-black flex items-center justify-center font-bold text-2xl shadow-lg mx-auto mb-4">
            B
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to blahbluh</h1>
          <p className="text-gray-400">Tell us a bit about yourself to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Country
            </label>
            <select
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select your country</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Italy">Italy</option>
              <option value="Spain">Spain</option>
              <option value="Netherlands">Netherlands</option>
              <option value="Sweden">Sweden</option>
              <option value="Norway">Norway</option>
              <option value="Denmark">Denmark</option>
              <option value="Finland">Finland</option>
              <option value="Japan">Japan</option>
              <option value="South Korea">South Korea</option>
              <option value="Singapore">Singapore</option>
              <option value="India">India</option>
              <option value="Brazil">Brazil</option>
              <option value="Mexico">Mexico</option>
              <option value="Argentina">Argentina</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.gender || !formData.country}
            className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating account...' : 'Start Chatting'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Anonymous and secure. No personal data is stored permanently.
        </p>
      </div>
    </div>
  );
}

export default SignupForm;
import React from 'react';

const PFP_BASE_URL = 'https://pub-c344659298794c9f96898621acc3f91a.r2.dev';
const PFP_FILES = [
  'b (1).png',
  'b (5).png',
  'c.png',
  'd.png',
  'e.png',
];

const pfpUrls = PFP_FILES.map(file => `${PFP_BASE_URL}/${encodeURIComponent(file)}`);

function PfpSelect({ onSelect, onClose, currentPfp }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-lg border border-zinc-800 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Select a Profile Picture</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 justify-center">
          {pfpUrls.map((url) => (
            <button
              key={url}
              onClick={() => onSelect(url)}
              className={`w-28 h-28 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                currentPfp === url ? 'ring-2 ring-blue-500 scale-105' : 'ring-1 ring-zinc-700 hover:ring-blue-500 hover:scale-105'
              }`}
            >
              <img src={url} alt="Profile avatar option" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>

        <div className="pt-6 mt-2">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default PfpSelect;
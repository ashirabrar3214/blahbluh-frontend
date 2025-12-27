import React, { useEffect, useId } from 'react';

const PFP_BASE_URL = 'https://pub-c344659298794c9f96898621acc3f91a.r2.dev';
const PFP_FILES = [
  'b (1).png',
  'b (5).png',
  'c.png',
  'd.png',
  'e.png',
  'f.png',
  'g.png',
  'h.png',
  'i.png',
  'j.png',
  'k.png',
  'l.png',
  'm.png',
  'n.png',
  'o.png',
    'p.png',
    'q.png',
    'r.png',
    's.png',
    't.png',
    'u.png',
];

const pfpUrls = PFP_FILES.map(file => `${PFP_BASE_URL}/${encodeURIComponent(file)}`);

function PfpSelect({ onSelect, onClose, currentPfp }) {
  const titleId = useId();

  // Handle Escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-3xl border border-zinc-800 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="grid grid-cols-3 items-center mb-6 shrink-0">
          <div /> {/* Spacer */}
          <h2 id={titleId} className="text-xl font-bold text-white text-center">Your Avatar</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white justify-self-end" aria-label="Close">
            ✕
          </button>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center overflow-y-auto min-h-0 p-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
          {pfpUrls.map((url, index) => (
            <button
              key={url}
              onClick={() => onSelect(url)}
              className={`w-28 h-28 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                currentPfp === url ? 'ring-2 ring-blue-500 scale-105' : 'ring-1 ring-zinc-700 hover:ring-blue-500 hover:scale-105'
              }`}
            >
              <img src={url} alt={`Profile avatar option ${index + 1}`} className="w-full h-full object-contain" />
            </button>
          ))}
        </div>

        <div className="pt-6 mt-2 shrink-0">
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
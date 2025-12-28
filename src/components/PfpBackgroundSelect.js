import React, { useEffect, useId, useState, useRef } from 'react';

const BG_BASE_URL = 'https://pub-f0d85aac44cf4aa895afe84cb6649484.r2.dev';
const BG_FILES = [
  'a.png',
];

const bgUrls = BG_FILES.map(file => `${BG_BASE_URL}/${encodeURIComponent(file)}`);

function PfpBackgroundSelect({ onSelect, onClose, currentBg }) {
  const titleId = useId();
  const [previewBg, setPreviewBg] = useState(currentBg || '');
  const scrollContainerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const isScrolling = useRef(false);


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

  // Scroll to initial BG on mount
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && currentBg) {
      const elementToScrollTo = container.querySelector(`[data-bg-url="${currentBg}"]`);
      if (elementToScrollTo) {
        setTimeout(() => {
          elementToScrollTo.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
        }, 0);
      }
    }
  }, [currentBg]);

  const handleConfirm = () => {
    onSelect(previewBg);
    onClose();
  };

  const handleScroll = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    isScrolling.current = true;
    scrollTimeoutRef.current = setTimeout(() => {
      isScrolling.current = false;
      const container = scrollContainerRef.current;
      if (!container) return;

      const containerCenter = container.scrollLeft + container.offsetWidth / 2;
      let closestElement = null;
      let minDistance = Infinity;

      container.childNodes.forEach(child => {
        if (child.nodeType === 1) {
          const childCenter = child.offsetLeft + child.offsetWidth / 2;
          const distance = Math.abs(containerCenter - childCenter);
          if (distance < minDistance) {
            minDistance = distance;
            closestElement = child;
          }
        }
      });

      if (closestElement) {
        const url = closestElement.dataset.bgUrl;
        if (typeof url !== 'undefined') {
          setPreviewBg(url);
        }
      }
    }, 150);
  };

  const handleThumbnailClick = (url) => {
    if (isScrolling.current) return;
    setPreviewBg(url);
    const container = scrollContainerRef.current;
    if (container) {
      const selector = url ? `[data-bg-url="${url}"]` : '[data-bg-url=""]';
      const elementToScrollTo = container.querySelector(selector);
      if (elementToScrollTo) {
        elementToScrollTo.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-800 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h2 id={titleId} className="text-xl font-bold text-white">Choose Background</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
            ✕
          </button>
        </div>
        
        {/* Main Preview */}
        <div className="flex-1 flex items-center justify-center mb-6 min-h-0">
          <button 
            onClick={handleConfirm}
            className={`w-48 h-48 rounded-full overflow-hidden flex items-center justify-center group transition-transform hover:scale-105 ${
              previewBg ? 'bg-black' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
            }`}
            style={
              previewBg ? { backgroundImage: `url(${previewBg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}
            }
          >
            {!previewBg && <span className="text-white font-bold">Default</span>}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white font-bold">Select</span>
            </div>
          </button>
        </div>

        {/* Carousel */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex items-center gap-3 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          {/* Default Option */}
          <button
            data-bg-url=""
            onClick={() => handleThumbnailClick('')}
            className={`snap-center shrink-0 w-20 h-20 rounded-full overflow-hidden focus:outline-none transition-all duration-200 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ${
              previewBg === '' ? 'ring-2 ring-blue-500 scale-105' : 'ring-1 ring-zinc-700 hover:ring-blue-500'
            }`}
          >
            <span className="text-xs font-medium text-white">Default</span>
          </button>

          {bgUrls.map((url) => (
            <button
              key={url}
              data-bg-url={url}
              onClick={() => handleThumbnailClick(url)}
              className={`snap-center shrink-0 w-20 h-20 rounded-full overflow-hidden focus:outline-none transition-all duration-200 bg-black ${
                previewBg === url ? 'ring-2 ring-blue-500 scale-105' : 'ring-1 ring-zinc-700 hover:ring-blue-500'
              }`}
            >
              <img src={url} alt="Background option" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-6 mt-2 shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-colors font-bold"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default PfpBackgroundSelect;
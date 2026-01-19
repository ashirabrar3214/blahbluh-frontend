export const extractClipUrl = (text) => {
  const match = text.match(/(https?:\/\/[^\s]+)/);
  return match ? match[0] : null;
};

export const getEmbedConfig = (url) => {
  if (!url) return null;
  const cleanUrl = url.trim();

  try {
    const urlObj = new URL(cleanUrl);
    const hostname = urlObj.hostname;

    // --- INSTAGRAM REELS/POSTS ---
    if (hostname.includes('instagram.com')) {
      const match = cleanUrl.match(/\/(p|reel|reels)\/([\w-]+)/);
      if (match && match[2]) {
        const kind = match[1] === 'p' ? 'p' : 'reel';
        return {
          type: 'instagram',
          src: `https://www.instagram.com/${kind}/${match[2]}/embed/`
        };
      }
    }

    // --- TIKTOK ---
    if (hostname.includes('tiktok.com')) {
      const match = cleanUrl.match(/video\/(\d+)/);
      if (match && match[1]) {
        return {
          type: 'tiktok',
          // The official TikTok Embed Player
          src: `https://www.tiktok.com/embed/v2/${match[1]}?lang=en-US`
        };
      }
    }

    // --- SNAPCHAT SPOTLIGHT/STORIES ---
    if (hostname.includes('snapchat.com')) {
        // Spotlight URLs usually look like: snapchat.com/spotlight/ID
        // Embed URLs look like: story.snapchat.com/embed/ID
        const pathParts = urlObj.pathname.split('/');
        const idIndex = pathParts.findIndex(p => p === 'spotlight' || p === 'story' || p === 'add');
        
        if (idIndex !== -1 && pathParts[idIndex + 1]) {
            const id = pathParts[idIndex + 1];
            return {
                type: 'snapchat',
                src: `https://story.snapchat.com/embed/${id}`
            };
        }
    }

    return null;
  } catch (e) {
    return null;
  }
};
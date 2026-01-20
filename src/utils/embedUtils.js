export const extractClipUrl = (text) => {
  if (!text) return null;
  const match = text.match(/(https?:\/\/[^\s]+)/);
  return match ? match[0] : null;
};

export const getEmbedConfig = (url) => {
  if (!url) return null;
  const cleanUrl = url.trim();

  try {
    const urlObj = new URL(cleanUrl);
    const hostname = urlObj.hostname;

    // --- INSTAGRAM (Logic from test.html) ---
    if (hostname.includes('instagram.com')) {
      // Regex from test.html: matches /p/, /reel/, /reels/, /tv/ and captures the ID
      const regex = /(?:instagram\.com\/(?:p|reel|reels|tv)\/)([\w-]+)/;
      const match = cleanUrl.match(regex);

      if (match && match[1]) {
        return {
          type: 'instagram',
          // URL construction from test.html
          src: `https://www.instagram.com/p/${match[1]}/embed/?cr=1&v=14&wp=540`
        };
      }
    }

    // --- TIKTOK ---
    if (hostname.includes('tiktok.com')) {
      const match = cleanUrl.match(/video\/(\d+)/);
      if (match && match[1]) {
        return {
          type: 'tiktok',
          src: `https://www.tiktok.com/embed/v2/${match[1]}?lang=en-US`
        };
      }
    }

    // --- SNAPCHAT ---
    if (hostname.includes('snapchat.com')) {
      const pathParts = urlObj.pathname.split('/');
      const idIndex = pathParts.findIndex(p => p === 'spotlight' || p === 'story' || p === 'add');
      if (idIndex !== -1 && pathParts[idIndex + 1]) {
        return {
          type: 'snapchat',
          src: `https://story.snapchat.com/embed/${pathParts[idIndex + 1]}`
        };
      }
    }

    return null;
  } catch (e) {
    return null;
  }
};
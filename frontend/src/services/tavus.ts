// Tavus API integration for video avatar responses
export interface TavusConfig {
  apiKey: string;
  avatarId: string;
}

export interface VideoResponse {
  videoUrl: string;
  duration: number;
  status: 'processing' | 'ready' | 'error';
  thumbnailUrl?: string;
}

const TAVUS_API_URL = 'https://api.tavus.io/v1';

const getUserApiKeys = () => {
  try {
    const saved = localStorage.getItem('user_api_keys');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.useOwnKeys ? parsed : null;
    }
  } catch (error) {
    console.error('Error loading user API keys:', error);
  }
  return null;
};

export const generateVideoResponse = async (text: string): Promise<VideoResponse> => {
  try {
    const userKeys = getUserApiKeys();
    const apiKey = userKeys?.tavus || import.meta.env.VITE_TAVUS_API_KEY;
    const avatarId = import.meta.env.VITE_TAVUS_AVATAR_ID || 'default-therapist';
    
    if (!apiKey) {
      console.warn('Tavus API key not configured');
      return simulateVideoResponse(text);
    }

    const response = await fetch(`${TAVUS_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        avatar_id: avatarId,
        voice_settings: {
          emotion: 'empathetic',
          pace: 'moderate',
          tone: 'warm'
        },
        video_settings: {
          resolution: '1080p',
          background: 'therapy_office'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Tavus API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      videoUrl: data.video_url,
      duration: data.duration,
      status: data.status,
      thumbnailUrl: data.thumbnail_url
    };
  } catch (error) {
    console.error('Error generating video response:', error);
    return simulateVideoResponse(text);
  }
};

const simulateVideoResponse = async (text: string): Promise<VideoResponse> => {
  // Simulate API processing time
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return {
    videoUrl: `https://example.com/video/${Date.now()}.mp4`,
    duration: Math.floor(text.length / 8), // Rough estimate
    status: 'ready',
    thumbnailUrl: `https://example.com/thumbnail/${Date.now()}.jpg`
  };
};
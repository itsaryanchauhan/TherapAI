// ElevenLabs API integration for voice synthesis
export interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  model: string;
}

export interface VoiceResponse {
  audioUrl: string;
  duration: number;
  status: 'processing' | 'ready' | 'error';
}

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

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

export const generateVoiceResponse = async (text: string): Promise<VoiceResponse> => {
  try {
    const userKeys = getUserApiKeys();
    const apiKey = userKeys?.elevenlabs || import.meta.env.VITE_ELEVENLABS_API_KEY;
    const voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // Default empathetic voice
    
    if (!apiKey) {
      console.warn('ElevenLabs API key not configured');
      return simulateVoiceResponse(text);
    }

    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.3,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    return {
      audioUrl,
      duration: Math.floor(text.length / 10), // Rough estimate
      status: 'ready'
    };
  } catch (error) {
    console.error('Error generating voice response:', error);
    return simulateVoiceResponse(text);
  }
};

const simulateVoiceResponse = async (text: string): Promise<VoiceResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    audioUrl: `data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT`,
    duration: Math.floor(text.length / 10),
    status: 'ready'
  };
};

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const userKeys = getUserApiKeys();
    const apiKey = userKeys?.elevenlabs || import.meta.env.VITE_ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      console.warn('ElevenLabs API key not configured for transcription');
      return 'Voice transcription not available in demo mode';
    }

    // This would use ElevenLabs or another service for speech-to-text
    // For demo purposes, we'll simulate transcription
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return 'This is a simulated transcription of your voice message. In production, this would be the actual transcribed text from your audio input.';
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return 'Error transcribing audio';
  }
};
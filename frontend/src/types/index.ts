export interface User {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'premium' | 'pro';
  created_at: Date;
  last_active?: Date;
}

export interface Message {
  id: string;
  session_id: string;
  content: string;
  is_user: boolean;
  timestamp: Date;
  audio_url?: string;
  sentiment_score?: number;
  word_count: number;
}

export interface Session {
  id: string;
  user_id: string;
  title: string;
  start_time: Date;
  end_time?: Date;
  duration_minutes?: number;
  message_count: number;
  total_words: number;
  average_sentiment: number;
  session_type: 'chat' | 'voice';
  summary?: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  anonymous_id: string;
  content: string;
  created_at: Date;
  reactions: {
    thumbs_up: number;
    handshake: number;
    comment: number;
  };
  user_reaction?: 'thumbs_up' | 'handshake' | 'comment' | null;
}

export interface CommunityReply {
  id: string;
  post_id: string;
  user_id: string;
  anonymous_id: string;
  content: string;
  created_at: Date;
}

export interface UserStats {
  total_sessions: number;
  total_words: number;
  average_sentiment: number;
  streak_days: number;
  favorite_mode: 'chat' | 'voice' | 'video';
  total_minutes: number;
}

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}
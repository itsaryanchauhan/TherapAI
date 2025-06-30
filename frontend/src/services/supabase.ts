import { createClient } from '@supabase/supabase-js';
import { Message, Session, UserStats } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Session Management
export const createSession = async (userId: string, sessionType: 'chat' | 'voice' | 'video'): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .insert([
        {
          user_id: userId,
          title: `${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Session`,
          start_time: new Date().toISOString(),
          session_type: sessionType,
          message_count: 0,
          total_words: 0,
          average_sentiment: 0
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

export const endSession = async (sessionId: string, summary?: string) => {
  try {
    const { error } = await supabase
      .from('sessions')
      .update({
        end_time: new Date().toISOString(),
        summary
      })
      .eq('id', sessionId);

    if (error) throw error;
  } catch (error) {
    console.error('Error ending session:', error);
    throw error;
  }
};

// Message Management
export const saveMessage = async (message: Omit<Message, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          session_id: message.session_id,
          content: message.content,
          is_user: message.is_user,
          timestamp: message.timestamp.toISOString(),
          audio_url: message.audio_url,
          sentiment_score: message.sentiment_score,
          word_count: message.word_count
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

export const getSessionMessages = async (sessionId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    return data.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// User Sessions
export const getUserSessions = async (userId: string): Promise<Session[]> => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false });

    if (error) throw error;

    return data.map(session => ({
      ...session,
      start_time: new Date(session.start_time),
      end_time: session.end_time ? new Date(session.end_time) : undefined
    }));
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
};

// User Statistics
export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId);

    if (sessionsError) throw sessionsError;

    const totalSessions = sessions.length;
    const totalWords = sessions.reduce((sum, s) => sum + (s.total_words || 0), 0);
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const averageSentiment = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.average_sentiment || 0), 0) / sessions.length
      : 0;

    // Calculate streak (simplified)
    const streakDays = calculateStreakDays(sessions);

    // Find favorite mode
    const modeCounts = sessions.reduce((acc, s) => {
      acc[s.session_type] = (acc[s.session_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteMode = Object.entries(modeCounts).reduce((a, b) =>
      modeCounts[a[0]] > modeCounts[b[0]] ? a : b
    )?.[0] as 'chat' | 'voice' | 'video' || 'chat';

    return {
      total_sessions: totalSessions,
      total_words: totalWords,
      average_sentiment: averageSentiment,
      streak_days: streakDays,
      favorite_mode: favoriteMode,
      total_minutes: totalMinutes
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      total_sessions: 0,
      total_words: 0,
      average_sentiment: 0,
      streak_days: 0,
      favorite_mode: 'chat',
      total_minutes: 0
    };
  }
};

const calculateStreakDays = (sessions: any[]): number => {
  if (sessions.length === 0) return 0;

  const dates = sessions
    .map(s => new Date(s.start_time).toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index)
    .sort();

  let streak = 1;
  for (let i = dates.length - 1; i > 0; i--) {
    const current = new Date(dates[i]);
    const previous = new Date(dates[i - 1]);
    const diffTime = Math.abs(current.getTime() - previous.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};
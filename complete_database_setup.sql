-- =====================================================
-- TherapAI Complete Database Setup
-- Run this entire file in your Supabase SQL Editor
-- =====================================================

-- First, clean up any existing functions that might have return type conflicts
DROP FUNCTION IF EXISTS get_community_posts_with_reactions(uuid);
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    session_type TEXT NOT NULL CHECK (session_type IN ('chat', 'voice', 'video')),
    message_count INTEGER DEFAULT 0,
    total_words INTEGER DEFAULT 0,
    average_sentiment FLOAT DEFAULT 0,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_user BOOLEAN NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    audio_url TEXT,
    video_url TEXT,
    sentiment_score FLOAT,
    word_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. COMMUNITY POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    anonymous_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reactions JSONB DEFAULT '{"thumbs_up": 0, "handshake": 0, "comment": 0}'::jsonb,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- 4. COMMUNITY POST REACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS community_post_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('thumbs_up', 'handshake', 'comment')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, reaction_type)
);

-- =====================================================
-- 5. COMMUNITY COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS community_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    anonymous_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- 6. COMMUNITY POST REPLIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS community_post_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    anonymous_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- 7. USER STATS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_sessions INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    total_words INTEGER DEFAULT 0,
    average_session_length FLOAT DEFAULT 0,
    favorite_session_type TEXT,
    streak_days INTEGER DEFAULT 0,
    last_session_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_session_type ON sessions(session_type);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_is_user ON messages(is_user);

-- Community posts indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_is_deleted ON community_posts(is_deleted);

-- Community reactions indexes
CREATE INDEX IF NOT EXISTS idx_community_post_reactions_post_id ON community_post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_reactions_user_id ON community_post_reactions(user_id);

-- Community comments indexes
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_created_at ON community_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_is_deleted ON community_comments(is_deleted);

-- Community replies indexes
CREATE INDEX IF NOT EXISTS idx_community_post_replies_post_id ON community_post_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_replies_created_at ON community_post_replies(created_at DESC);

-- User stats indexes
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_last_session_date ON user_stats(last_session_date);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SESSIONS POLICIES
-- =====================================================
CREATE POLICY "Users can view their own sessions" ON sessions 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" ON sessions 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON sessions 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON sessions 
FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- MESSAGES POLICIES
-- =====================================================
CREATE POLICY "Users can view messages from their sessions" ON messages 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = messages.session_id AND sessions.user_id = auth.uid())
);

CREATE POLICY "Users can create messages in their sessions" ON messages 
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = messages.session_id AND sessions.user_id = auth.uid())
);

CREATE POLICY "Users can update messages in their sessions" ON messages 
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = messages.session_id AND sessions.user_id = auth.uid())
);

CREATE POLICY "Users can delete messages in their sessions" ON messages 
FOR DELETE USING (
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = messages.session_id AND sessions.user_id = auth.uid())
);

-- =====================================================
-- COMMUNITY POSTS POLICIES
-- =====================================================
CREATE POLICY "Anyone can view non-deleted community posts" ON community_posts 
FOR SELECT USING (NOT is_deleted);

CREATE POLICY "Authenticated users can create community posts" ON community_posts 
FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own posts" ON community_posts 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can soft delete their own posts" ON community_posts 
FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- COMMUNITY REACTIONS POLICIES
-- =====================================================
CREATE POLICY "Anyone can view community reactions" ON community_post_reactions 
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reactions" ON community_post_reactions 
FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own reactions" ON community_post_reactions 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON community_post_reactions 
FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- COMMUNITY COMMENTS POLICIES
-- =====================================================
CREATE POLICY "Anyone can view non-deleted community comments" ON community_comments 
FOR SELECT USING (NOT is_deleted);

CREATE POLICY "Authenticated users can create community comments" ON community_comments 
FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own comments" ON community_comments 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can soft delete their own comments" ON community_comments 
FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- COMMUNITY REPLIES POLICIES
-- =====================================================
CREATE POLICY "Anyone can view non-deleted community replies" ON community_post_replies 
FOR SELECT USING (NOT is_deleted);

CREATE POLICY "Authenticated users can create community replies" ON community_post_replies 
FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own replies" ON community_post_replies 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can soft delete their own replies" ON community_post_replies 
FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- USER STATS POLICIES
-- =====================================================
CREATE POLICY "Users can view their own stats" ON user_stats 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stats" ON user_stats 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON user_stats 
FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================

-- Function to increment reaction counts
CREATE OR REPLACE FUNCTION increment_reaction(
    post_id UUID,
    user_id UUID,
    reaction_type TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Insert or update the user's reaction
    INSERT INTO community_post_reactions (post_id, user_id, reaction_type)
    VALUES (post_id, user_id, reaction_type)
    ON CONFLICT (post_id, user_id, reaction_type) DO NOTHING;
    
    -- Update the reaction count in the post
    UPDATE community_posts 
    SET reactions = jsonb_set(
        reactions, 
        ARRAY[reaction_type], 
        ((reactions->>reaction_type)::int + 1)::text::jsonb
    )
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get community posts with user reaction status
CREATE OR REPLACE FUNCTION get_community_posts_with_reactions(requesting_user_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    anonymous_id TEXT,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    reactions JSONB,
    is_deleted BOOLEAN,
    user_has_reacted BOOLEAN,
    user_reaction_type TEXT,
    comment_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.id,
        cp.user_id,
        cp.anonymous_id,
        cp.content,
        cp.created_at,
        cp.updated_at,
        cp.reactions,
        cp.is_deleted,
        (cpr.id IS NOT NULL) as user_has_reacted,
        cpr.reaction_type as user_reaction_type,
        COALESCE(cc.comment_count, 0) as comment_count
    FROM community_posts cp
    LEFT JOIN community_post_reactions cpr ON cp.id = cpr.post_id AND cpr.user_id = requesting_user_id
    LEFT JOIN (
        SELECT post_id, COUNT(*) as comment_count 
        FROM community_comments 
        WHERE NOT is_deleted 
        GROUP BY post_id
    ) cc ON cp.id = cc.post_id
    WHERE NOT cp.is_deleted
    ORDER BY cp.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert user stats
    INSERT INTO user_stats (
        user_id, 
        total_sessions, 
        total_messages, 
        total_words,
        last_session_date,
        updated_at
    )
    SELECT 
        s.user_id,
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(m.id) as total_messages,
        COALESCE(SUM(m.word_count), 0) as total_words,
        MAX(s.created_at) as last_session_date,
        NOW() as updated_at
    FROM sessions s
    LEFT JOIN messages m ON s.id = m.session_id
    WHERE s.user_id = NEW.user_id
    GROUP BY s.user_id
    ON CONFLICT (user_id) 
    DO UPDATE SET
        total_sessions = EXCLUDED.total_sessions,
        total_messages = EXCLUDED.total_messages,
        total_words = EXCLUDED.total_words,
        last_session_date = EXCLUDED.last_session_date,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update user stats when sessions are created
CREATE TRIGGER update_user_stats_on_session
    AFTER INSERT OR UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Trigger to update user stats when messages are created
CREATE TRIGGER update_user_stats_on_message
    AFTER INSERT OR UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- =====================================================
-- INITIAL DATA (Optional)
-- =====================================================

-- You can add any initial data here if needed
-- For example, sample community posts or default user stats

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions for anon users (for public read access to community features)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON community_posts TO anon;
GRANT SELECT ON community_post_reactions TO anon;
GRANT SELECT ON community_comments TO anon;
GRANT SELECT ON community_post_replies TO anon;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- This completes the TherapAI database setup
-- All tables, indexes, policies, functions, and triggers are now configured
-- Your application should be ready to use!

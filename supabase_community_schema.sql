-- Community Posts Table
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

-- Community Post Reactions Table (to track individual user reactions)
CREATE TABLE IF NOT EXISTS community_post_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('thumbs_up', 'handshake', 'comment')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id) -- One reaction per user per post
);

-- Community Post Replies Table
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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_post_reactions_post_id ON community_post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_reactions_user_id ON community_post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_post_replies_post_id ON community_post_replies(post_id);

-- Row Level Security (RLS) Policies
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_replies ENABLE ROW LEVEL SECURITY;

-- Community posts policies
CREATE POLICY "Anyone can view community posts" ON community_posts FOR SELECT USING (NOT is_deleted);
CREATE POLICY "Users can create community posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);

-- Community post reactions policies
CREATE POLICY "Anyone can view reactions" ON community_post_reactions FOR SELECT USING (true);
CREATE POLICY "Users can create reactions" ON community_post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reactions" ON community_post_reactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reactions" ON community_post_reactions FOR DELETE USING (auth.uid() = user_id);

-- Community post replies policies
CREATE POLICY "Anyone can view replies" ON community_post_replies FOR SELECT USING (NOT is_deleted);
CREATE POLICY "Users can create replies" ON community_post_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own replies" ON community_post_replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own replies" ON community_post_replies FOR DELETE USING (auth.uid() = user_id);

-- Function to increment reaction counts
CREATE OR REPLACE FUNCTION increment_reaction(post_id UUID, user_id UUID, reaction_type TEXT)
RETURNS VOID AS $$
DECLARE
    old_reaction TEXT;
BEGIN
    -- Get the user's existing reaction for this post
    SELECT community_post_reactions.reaction_type INTO old_reaction
    FROM community_post_reactions
    WHERE community_post_reactions.post_id = increment_reaction.post_id
    AND community_post_reactions.user_id = increment_reaction.user_id;
    
    -- If user had a previous reaction, decrement it and remove it
    IF old_reaction IS NOT NULL THEN
        UPDATE community_posts 
        SET reactions = jsonb_set(
            reactions, 
            ARRAY[old_reaction], 
            to_jsonb(GREATEST(0, (reactions->old_reaction)::int - 1))
        )
        WHERE id = increment_reaction.post_id;
        
        DELETE FROM community_post_reactions
        WHERE community_post_reactions.post_id = increment_reaction.post_id
        AND community_post_reactions.user_id = increment_reaction.user_id;
    END IF;
    
    -- If the new reaction is different from the old one, add it
    IF old_reaction IS NULL OR old_reaction != increment_reaction.reaction_type THEN
        -- Insert new reaction
        INSERT INTO community_post_reactions (post_id, user_id, reaction_type)
        VALUES (increment_reaction.post_id, increment_reaction.user_id, increment_reaction.reaction_type);
        
        -- Increment reaction count in posts table
        UPDATE community_posts 
        SET reactions = jsonb_set(
            reactions, 
            ARRAY[increment_reaction.reaction_type], 
            to_jsonb((reactions->increment_reaction.reaction_type)::int + 1)
        )
        WHERE id = increment_reaction.post_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get posts with user reactions
CREATE OR REPLACE FUNCTION get_community_posts_with_reactions(requesting_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    anonymous_id TEXT,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    reactions JSONB,
    user_reaction TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.user_id,
        p.anonymous_id,
        p.content,
        p.created_at,
        p.reactions,
        r.reaction_type as user_reaction
    FROM community_posts p
    LEFT JOIN community_post_reactions r ON p.id = r.post_id AND r.user_id = requesting_user_id
    WHERE p.is_deleted = FALSE
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_post_replies_updated_at BEFORE UPDATE ON community_post_replies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

import React, { useState, useEffect } from 'react';
import { Plus, ThumbsUp, Handshake, MessageCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { CommunityPost } from '../types';
import { getCommunityPosts, createCommunityPost, reactToPost } from '../services/supabase';

const CommunityPage: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const { isDark } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    loadCommunityPosts();
  }, []);

  const loadCommunityPosts = async () => {
    try {
      setIsLoading(true);
      const communityPosts = await getCommunityPosts();
      setPosts(communityPosts);
    } catch (error) {
      console.error('Error loading community posts:', error);
      setPosts([]); // Show empty state instead of demo data
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return;

    try {
      setIsPosting(true);
      await createCommunityPost(user.id, newPost);
      setNewPost('');
      setShowNewPostForm(false);
      await loadCommunityPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      // You could add a toast notification here
      alert('Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleReaction = async (postId: string, reactionType: 'thumbs_up' | 'handshake' | 'comment') => {
    if (!user) return;

    try {
      await reactToPost(postId, user.id, reactionType);
      // Refresh posts to get updated reaction counts
      await loadCommunityPosts();
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  };

  const getReactionIcon = (type: 'thumbs_up' | 'handshake' | 'comment') => {
    switch (type) {
      case 'thumbs_up':
        return ThumbsUp;
      case 'handshake':
        return Handshake;
      case 'comment':
        return MessageCircle;
    }
  };

  if (isLoading) {
    return (
      <div className={`h-full flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white'
        }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`h-full transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
      {/* Header */}
      <div className={`border-b p-6 transition-colors duration-300 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Founder Community
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Share your journey anonymously with fellow entrepreneurs
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewPostForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Share</span>
          </motion.button>
        </div>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto">
        {/* New Post Form */}
        <AnimatePresence>
          {showNewPostForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-6 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Share Anonymously
              </h3>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind? Share your struggles, victories, or advice..."
                className={`w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
              />
              <div className="flex items-center justify-between mt-4">
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  You'll appear as "Anon Founder #{Math.floor(Math.random() * 9999).toString().padStart(4, '0')}"
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowNewPostForm(false)}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreatePost}
                    disabled={!newPost.trim() || isPosting}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isPosting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Share</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts */}
        <div className="space-y-4">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg ${isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
            >
              {/* Post Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-600' : 'bg-blue-500'
                    }`}>
                    <span className="text-white text-sm font-medium">
                      {post.anonymous_id.split('#')[1]}
                    </span>
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {post.anonymous_id}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {post.created_at.toLocaleDateString()} • {post.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {post.content}
              </p>

              {/* Reactions */}
              <div className="flex items-center space-x-4">
                {(['thumbs_up', 'handshake', 'comment'] as const).map((reactionType) => {
                  const Icon = getReactionIcon(reactionType);
                  const isActive = post.user_reaction === reactionType;
                  const count = post.reactions[reactionType];

                  return (
                    <motion.button
                      key={reactionType}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleReaction(post.id, reactionType)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors duration-200 ${isActive
                          ? 'bg-blue-500 text-white'
                          : isDark
                            ? 'text-gray-400 hover:bg-gray-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{count}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'
              }`} />
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
              No posts yet
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              Be the first to share your founder journey with the community
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
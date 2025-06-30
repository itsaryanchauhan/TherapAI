import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, Clock, TrendingUp, MessageSquare, Zap, Target, Award, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { getUserStats, getUserSessions } from '../services/supabase';
import { UserStats, Session } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const [userStats, userSessions] = await Promise.all([
        getUserStats(user.id),
        getUserSessions(user.id)
      ]);
      
      setStats(userStats);
      setSessions(userSessions.slice(0, 7)); // Last 7 sessions for chart
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = sessions.map((session, index) => ({
    session: `Session ${sessions.length - index}`,
    sentiment: session.average_sentiment * 100,
    words: session.total_words,
    duration: session.duration_minutes || 0
  }));

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.6) return 'text-green-500';
    if (sentiment >= 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment >= 0.6) return 'Positive';
    if (sentiment >= 0.4) return 'Neutral';
    return 'Needs Support';
  };

  if (isLoading) {
    return (
      <div className={`h-full flex items-center justify-center transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-y-auto transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`border-b p-6 transition-colors duration-300 ${
        isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Your Wellness Dashboard
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Track your therapeutic journey and emotional progress
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${
            isDark ? 'bg-blue-600' : 'bg-blue-500'
          } text-white`}>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span className="font-medium">{stats?.streak_days || 0} day streak</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-xl border transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Sessions
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats?.total_sessions || 0}
                </p>
              </div>
              <MessageSquare className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-xl border transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Words Spoken
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats?.total_words.toLocaleString() || 0}
                </p>
              </div>
              <Target className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-6 rounded-xl border transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Average Mood
                </p>
                <p className={`text-2xl font-bold ${getSentimentColor(stats?.average_sentiment || 0)}`}>
                  {getSentimentLabel(stats?.average_sentiment || 0)}
                </p>
              </div>
              <Activity className={`w-8 h-8 ${getSentimentColor(stats?.average_sentiment || 0)}`} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-6 rounded-xl border transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Minutes
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats?.total_minutes || 0}
                </p>
              </div>
              <Clock className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sentiment Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`p-6 rounded-xl border transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Emotional Progress
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="session" 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDark ? '#ffffff' : '#000000'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sentiment" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Session Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`p-6 rounded-xl border transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Session Duration
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="session" 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDark ? '#ffffff' : '#000000'
                  }}
                />
                <Bar 
                  dataKey="duration" 
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`p-6 rounded-xl border transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Recent Sessions
          </h3>
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {session.start_time.toLocaleDateString()}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1)} • {session.duration_minutes || 0} min
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  getSentimentColor(session.average_sentiment).includes('green') 
                    ? 'bg-green-100 text-green-800' 
                    : getSentimentColor(session.average_sentiment).includes('yellow')
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getSentimentLabel(session.average_sentiment)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const router = Router();
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

// Get user profile
router.get('/profile', async (req, res) => {
    try {
        const userId = (req as any).user.userId;

        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, full_name, subscription_tier, created_at, preferences')
            .eq('id', userId)
            .single();

        if (error) {
            logger.error('Get profile error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch profile'
            });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                subscriptionTier: user.subscription_tier,
                createdAt: user.created_at,
                preferences: user.preferences || {}
            }
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update user profile
router.put('/profile', async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const { fullName, preferences } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .update({
                full_name: fullName,
                preferences,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            logger.error('Update profile error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update profile'
            });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                preferences: user.preferences || {}
            }
        });
    } catch (error) {
        logger.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get user sessions
router.get('/sessions', async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const { page = 1, limit = 20 } = req.query;

        const offset = (Number(page) - 1) * Number(limit);

        const { data: sessions, error } = await supabase
            .from('sessions')
            .select('id, title, start_time, end_time, session_type, message_count')
            .eq('user_id', userId)
            .order('start_time', { ascending: false })
            .range(offset, offset + Number(limit) - 1);

        if (error) {
            logger.error('Get sessions error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch sessions'
            });
        }

        res.json({
            success: true,
            data: sessions
        });
    } catch (error) {
        logger.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get user statistics
router.get('/stats', async (req, res) => {
    try {
        const userId = (req as any).user.userId;

        // Get session count and total time
        const { data: sessionStats } = await supabase
            .from('sessions')
            .select('id, start_time, end_time, session_type')
            .eq('user_id', userId);

        // Get message count
        const { data: messageStats } = await supabase
            .from('messages')
            .select('id, role')
            .eq('user_id', userId);

        const totalSessions = sessionStats?.length || 0;
        const totalMessages = messageStats?.filter(m => m.role === 'user').length || 0;

        const sessionsByType = sessionStats?.reduce((acc: any, session) => {
            acc[session.session_type] = (acc[session.session_type] || 0) + 1;
            return acc;
        }, {}) || {};

        // Calculate total therapy time
        const totalTime = sessionStats?.reduce((total, session) => {
            if (session.start_time && session.end_time) {
                const start = new Date(session.start_time);
                const end = new Date(session.end_time);
                return total + (end.getTime() - start.getTime());
            }
            return total;
        }, 0) || 0;

        res.json({
            success: true,
            data: {
                totalSessions,
                totalMessages,
                totalTimeMinutes: Math.round(totalTime / (1000 * 60)),
                sessionsByType,
                averageSessionLength: totalSessions > 0 ? Math.round(totalTime / (1000 * 60 * totalSessions)) : 0
            }
        });
    } catch (error) {
        logger.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Create new session
router.post('/sessions', async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const { title, sessionType = 'chat' } = req.body;

        const { data: session, error } = await supabase
            .from('sessions')
            .insert([{
                user_id: userId,
                title: title || `${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Session`,
                start_time: new Date().toISOString(),
                session_type: sessionType,
                message_count: 0
            }])
            .select()
            .single();

        if (error) {
            logger.error('Create session error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create session'
            });
        }

        res.status(201).json({
            success: true,
            data: session
        });
    } catch (error) {
        logger.error('Create session error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// End session
router.put('/sessions/:sessionId/end', async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const { sessionId } = req.params;
        const { summary } = req.body;

        const { data: session, error } = await supabase
            .from('sessions')
            .update({
                end_time: new Date().toISOString(),
                summary
            })
            .eq('id', sessionId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            logger.error('End session error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to end session'
            });
        }

        res.json({
            success: true,
            data: session
        });
    } catch (error) {
        logger.error('End session error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;

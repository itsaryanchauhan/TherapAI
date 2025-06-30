import { Router } from 'express';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const router = Router();
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

// Get subscription plans
router.get('/plans', async (req, res) => {
    try {
        const plans = [
            {
                id: 'free',
                name: 'Free',
                price: 0,
                currency: 'USD',
                interval: 'month',
                features: [
                    'Text chat only',
                    '5 sessions per month',
                    'Basic therapy log',
                    'Community access'
                ]
            },
            {
                id: 'premium_monthly',
                name: 'Premium',
                price: 19.99,
                currency: 'USD',
                interval: 'month',
                features: [
                    'Voice responses with ElevenLabs',
                    'Unlimited sessions',
                    'Advanced analytics',
                    'Priority support',
                    'Export session data',
                    'Multiple languages'
                ],
                popular: true
            },
            {
                id: 'pro_monthly',
                name: 'Pro',
                price: 39.99,
                currency: 'USD',
                interval: 'month',
                features: [
                    'Video avatar responses with Tavus',
                    'All Premium features',
                    'Custom therapy plans',
                    '1-on-1 support',
                    'API access',
                    'White-label options'
                ]
            }
        ];

        res.json({
            success: true,
            data: plans
        });
    } catch (error) {
        logger.error('Get plans error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch plans'
        });
    }
});

// Get user subscription status
router.get('/status', async (req, res) => {
    try {
        const userId = (req as any).user.userId;

        // Get user subscription from database
        const { data: user, error } = await supabase
            .from('users')
            .select('subscription_tier, subscription_status, subscription_expires_at')
            .eq('id', userId)
            .single();

        if (error) {
            logger.error('Get subscription status error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch subscription status'
            });
        }

        // Check RevenueCat for latest subscription status
        try {
            const response = await axios.get(
                `https://api.revenuecat.com/v1/subscribers/${userId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.REVENUECAT_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const rcSubscription = response.data.subscriber;
            const activeEntitlements = rcSubscription.entitlements || {};

            res.json({
                success: true,
                data: {
                    subscriptionTier: user.subscription_tier,
                    subscriptionStatus: user.subscription_status,
                    expiresAt: user.subscription_expires_at,
                    features: {
                        voice: activeEntitlements.voice?.expires_date ?
                            new Date(activeEntitlements.voice.expires_date) > new Date() : false,
                        video: activeEntitlements.video?.expires_date ?
                            new Date(activeEntitlements.video.expires_date) > new Date() : false,
                        unlimited: activeEntitlements.unlimited?.expires_date ?
                            new Date(activeEntitlements.unlimited.expires_date) > new Date() : false
                    }
                }
            });
        } catch (rcError) {
            // Fallback to database values if RevenueCat is unavailable
            res.json({
                success: true,
                data: {
                    subscriptionTier: user.subscription_tier,
                    subscriptionStatus: user.subscription_status,
                    expiresAt: user.subscription_expires_at,
                    features: {
                        voice: user.subscription_tier !== 'free',
                        video: user.subscription_tier === 'pro',
                        unlimited: user.subscription_tier !== 'free'
                    }
                }
            });
        }
    } catch (error) {
        logger.error('Get subscription status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription status'
        });
    }
});

// Handle RevenueCat webhook for subscription updates
router.post('/webhook', async (req, res) => {
    try {
        const { event } = req.body;

        if (event.type === 'INITIAL_PURCHASE' || event.type === 'RENEWAL') {
            const { app_user_id, product_id, expires_date } = event;

            let subscriptionTier = 'free';
            if (product_id.includes('premium')) {
                subscriptionTier = 'premium';
            } else if (product_id.includes('pro')) {
                subscriptionTier = 'pro';
            }

            // Update user subscription in database
            const { error } = await supabase
                .from('users')
                .update({
                    subscription_tier: subscriptionTier,
                    subscription_status: 'active',
                    subscription_expires_at: expires_date,
                    updated_at: new Date().toISOString()
                })
                .eq('id', app_user_id);

            if (error) {
                logger.error('Webhook update error:', error);
                return res.status(500).json({ success: false });
            }

            logger.info(`Subscription updated for user ${app_user_id}: ${subscriptionTier}`);
        }

        if (event.type === 'CANCELLATION' || event.type === 'EXPIRATION') {
            const { app_user_id } = event;

            const { error } = await supabase
                .from('users')
                .update({
                    subscription_tier: 'free',
                    subscription_status: 'cancelled',
                    updated_at: new Date().toISOString()
                })
                .eq('id', app_user_id);

            if (error) {
                logger.error('Webhook cancellation error:', error);
                return res.status(500).json({ success: false });
            }

            logger.info(`Subscription cancelled for user ${app_user_id}`);
        }

        res.json({ success: true });
    } catch (error) {
        logger.error('Webhook error:', error);
        res.status(500).json({ success: false });
    }
});

export default router;

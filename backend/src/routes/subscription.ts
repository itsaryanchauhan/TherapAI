import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';
import axios from 'axios';

const router = Router();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

// RevenueCat API configuration
const REVENUECAT_API_URL = 'https://api.revenuecat.com/v1';
const REVENUECAT_SECRET_KEY = process.env.REVENUECAT_SECRET_KEY!;

// Subscription plans - these should match your RevenueCat products
const PLANS = {
    free: {
        name: 'Free',
        price: 0,
        features: ['5 sessions/month', 'Text chat only', 'Basic support']
    },
    premium: {
        name: 'Premium',
        price: 19.99,
        productId: 'premium_monthly', // RevenueCat product identifier
        features: ['Unlimited sessions', 'Voice responses', 'Priority support']
    },
    pro: {
        name: 'Pro',
        price: 39.99,
        productId: 'pro_monthly', // RevenueCat product identifier
        features: ['All Premium features', 'Video avatars', 'Custom therapy plans']
    }
};

// Get available plans
router.get('/plans', async (req: Request, res: Response) => {
    try {
        res.json({
            success: true,
            plans: PLANS
        });
    } catch (error) {
        logger.error('Get plans error:', error);
        res.status(500).json({ success: false, message: 'Failed to get plans' });
    }
});

// Get user's current subscription
router.get('/current', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Check local subscription status first
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();

        if (subscription) {
            res.json({
                success: true,
                subscription
            });
        } else {
            // Return free plan if no active subscription
            res.json({
                success: true,
                subscription: { plan: 'free', status: 'active' }
            });
        }
    } catch (error) {
        logger.error('Get subscription error:', error);
        res.status(500).json({ success: false, message: 'Failed to get subscription' });
    }
});

// Create/update subscriber in RevenueCat
router.post('/subscriber', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Create or update subscriber in RevenueCat
        const response = await axios.post(`${REVENUECAT_API_URL}/subscribers/${userId}`, {
            app_user_id: userId,
            // Add any additional subscriber attributes
        }, {
            headers: {
                'Authorization': `Bearer ${REVENUECAT_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({
            success: true,
            subscriber: response.data
        });
    } catch (error) {
        logger.error('Create subscriber error:', error);
        res.status(500).json({ success: false, message: 'Failed to create subscriber' });
    }
});

// Get RevenueCat offerings
router.get('/offerings', async (req: Request, res: Response) => {
    try {
        const response = await axios.get(`${REVENUECAT_API_URL}/subscribers/offerings`, {
            headers: {
                'Authorization': `Bearer ${REVENUECAT_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({
            success: true,
            offerings: response.data,
            plans: PLANS
        });
    } catch (error) {
        logger.error('Get offerings error:', error);
        res.status(500).json({ success: false, message: 'Failed to get offerings' });
    }
});

// Handle RevenueCat webhooks
router.post('/webhook', async (req: Request, res: Response) => {
    try {
        // Verify webhook signature if configured
        const signature = req.headers['x-revenuecat-signature'];
        const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;

        if (webhookSecret && signature) {
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(JSON.stringify(req.body))
                .digest('hex');

            if (signature !== expectedSignature) {
                logger.error('Invalid webhook signature');
                return res.status(400).json({ error: 'Invalid signature' });
            }
        }

        const { event } = req.body;

        switch (event.type) {
            case 'INITIAL_PURCHASE':
            case 'RENEWAL':
                await handleSuccessfulPurchase(event);
                break;

            case 'CANCELLATION':
            case 'EXPIRATION':
                await handleSubscriptionCancellation(event);
                break;

            case 'BILLING_ISSUE':
                await handleBillingIssue(event);
                break;
        }

        res.json({ received: true });
    } catch (error) {
        logger.error('Webhook error:', error);
        res.status(500).json({ success: false, message: 'Webhook error' });
    }
});

async function handleSuccessfulPurchase(event: any) {
    const { app_user_id, product_id, period_type } = event;

    if (!app_user_id || !product_id) return;

    // Map product_id to our plan names
    let plan = 'free';
    if (product_id === 'premium_monthly' || product_id === 'premium_yearly') {
        plan = 'premium';
    } else if (product_id === 'pro_monthly' || product_id === 'pro_yearly') {
        plan = 'pro';
    }

    await supabase.from('subscriptions').upsert({
        user_id: app_user_id,
        plan,
        status: 'active',
        product_id,
        period_type,
        revenuecat_user_id: app_user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });

    logger.info(`Subscription activated for user ${app_user_id}, plan: ${plan}`);
}

async function handleSubscriptionCancellation(event: any) {
    const { app_user_id } = event;

    if (!app_user_id) return;

    await supabase
        .from('subscriptions')
        .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
        })
        .eq('user_id', app_user_id);

    logger.info(`Subscription cancelled for user ${app_user_id}`);
}

async function handleBillingIssue(event: any) {
    const { app_user_id } = event;

    if (!app_user_id) return;

    await supabase
        .from('subscriptions')
        .update({
            status: 'billing_issue',
            updated_at: new Date().toISOString()
        })
        .eq('user_id', app_user_id);

    logger.info(`Billing issue for user ${app_user_id}`);
}

export default router;

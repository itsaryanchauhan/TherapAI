import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

// Subscription plans
const PLANS = {
    free: {
        name: 'Free',
        price: 0,
        features: ['5 sessions/month', 'Text chat only', 'Basic support']
    },
    premium: {
        name: 'Premium',
        price: 1999, // $19.99 in cents
        priceId: 'price_premium_monthly', // Set in Stripe dashboard
        features: ['Unlimited sessions', 'Voice responses', 'Priority support']
    },
    pro: {
        name: 'Pro',
        price: 3999, // $39.99 in cents
        priceId: 'price_pro_monthly', // Set in Stripe dashboard
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

        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();

        res.json({
            success: true,
            subscription: subscription || { plan: 'free', status: 'active' }
        });
    } catch (error) {
        logger.error('Get subscription error:', error);
        res.status(500).json({ success: false, message: 'Failed to get subscription' });
    }
});

// Create checkout session
router.post('/checkout', async (req: Request, res: Response) => {
    try {
        const { plan } = req.body;
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (!PLANS[plan as keyof typeof PLANS] || plan === 'free') {
            return res.status(400).json({ success: false, message: 'Invalid plan' });
        }

        const selectedPlan = PLANS[plan as keyof typeof PLANS];

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: selectedPlan.priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/dashboard?upgrade=success`,
            cancel_url: `${process.env.FRONTEND_URL}/pricing?upgrade=cancelled`,
            client_reference_id: userId,
            metadata: {
                userId,
                plan
            }
        });

        res.json({
            success: true,
            url: session.url
        });
    } catch (error) {
        logger.error('Create checkout session error:', error);
        res.status(500).json({ success: false, message: 'Failed to create checkout session' });
    }
});

// Handle Stripe webhooks
router.post('/webhook', async (req: Request, res: Response) => {
    try {
        const sig = req.headers['stripe-signature'] as string;

        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
        } catch (err) {
            logger.error('Webhook signature verification failed:', err);
            return res.status(400).send('Webhook signature verification failed');
        }

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                await handleSuccessfulPayment(session);
                break;

            case 'invoice.payment_succeeded':
                const invoice = event.data.object as Stripe.Invoice;
                await handleSubscriptionRenewal(invoice);
                break;

            case 'customer.subscription.deleted':
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionCancellation(subscription);
                break;
        }

        res.json({ received: true });
    } catch (error) {
        logger.error('Webhook error:', error);
        res.status(500).json({ success: false, message: 'Webhook error' });
    }
});

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;

    if (!userId || !plan) return;

    await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan,
        status: 'active',
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });
}

async function handleSubscriptionRenewal(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;

    await supabase
        .from('subscriptions')
        .update({
            status: 'active',
            updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', customerId);
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
    await supabase
        .from('subscriptions')
        .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);
}

export default router;

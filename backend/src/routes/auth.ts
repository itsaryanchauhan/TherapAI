import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const router = Router();
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const { data: user, error } = await supabase
            .from('users')
            .insert([{
                email,
                password: hashedPassword,
                full_name: fullName,
                subscription_tier: 'free',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            logger.error('Registration error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create user'
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    subscriptionTier: user.subscription_tier
                },
                token
            }
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    subscriptionTier: user.subscription_tier
                },
                token
            }
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;

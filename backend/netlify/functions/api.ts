import { Handler } from '@netlify/functions';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import serverless from 'serverless-http';

// Import routes
import authRoutes from '../../src/routes/auth.js';
import aiRoutes from '../../src/routes/ai.js';
import voiceRoutes from '../../src/routes/voice.js';
import videoRoutes from '../../src/routes/video.js';
import subscriptionRoutes from '../../src/routes/subscription.js';
import userRoutes from '../../src/routes/user.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://therapai.netlify.app',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'TherapAI API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/user', userRoutes);

// Export as serverless function
export const handler: Handler = serverless(app);

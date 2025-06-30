import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';

// Route imports
import authRoutes from './routes/auth.js';
import subscriptionRoutes from './routes/subscription.js';
import aiRoutes from './routes/ai.js';
import voiceRoutes from './routes/voice.js';
import videoRoutes from './routes/video.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Basic middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', authMiddleware, subscriptionRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/voice', authMiddleware, voiceRoutes);
app.use('/api/video', authMiddleware, videoRoutes);
app.use('/api/users', authMiddleware, userRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    socket.on('join-session', (sessionId) => {
        socket.join(sessionId);
        logger.info(`User ${socket.id} joined session ${sessionId}`);
    });

    socket.on('leave-session', (sessionId) => {
        socket.leave(sessionId);
        logger.info(`User ${socket.id} left session ${sessionId}`);
    });

    socket.on('voice-call-offer', (data) => {
        socket.to(data.sessionId).emit('voice-call-offer', data);
    });

    socket.on('voice-call-answer', (data) => {
        socket.to(data.sessionId).emit('voice-call-answer', data);
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.sessionId).emit('ice-candidate', data);
    });

    socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.id}`);
    });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { io };

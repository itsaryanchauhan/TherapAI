import { Router } from 'express';
import axios from 'axios';
import { logger } from '../utils/logger.js';

const router = Router();

// Get available replicas
router.get('/replicas', async (req, res) => {
    try {
        const response = await axios.get('https://tavusapi.com/v2/replicas', {
            headers: {
                'x-api-key': process.env.TAVUS_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        const replicas = response.data.map((replica: any) => ({
            id: replica.replica_id,
            name: replica.name,
            status: replica.status,
            thumbnailUrl: replica.thumbnail_url,
            trainingProgress: replica.training_progress
        }));

        res.json({
            success: true,
            data: replicas
        });
    } catch (error) {
        logger.error('Get replicas error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch replicas'
        });
    }
});

// Generate video response
router.post('/generate', async (req, res) => {
    try {
        const { script, replicaId, voiceId } = req.body;
        const userId = (req as any).user.userId;

        if (!script || !replicaId) {
            return res.status(400).json({
                success: false,
                message: 'Script and replicaId are required'
            });
        }

        // Check if user has access to video features
        // This would typically check subscription status

        const response = await axios.post(
            'https://tavusapi.com/v2/videos',
            {
                script,
                replica_id: replicaId,
                voice_id: voiceId,
                video_name: `TherapAI Response - ${new Date().toISOString()}`,
                callback_url: `${process.env.BACKEND_URL}/api/video/webhook`
            },
            {
                headers: {
                    'x-api-key': process.env.TAVUS_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({
            success: true,
            data: {
                videoId: response.data.video_id,
                status: response.data.status,
                downloadUrl: response.data.download_url
            }
        });
    } catch (error) {
        logger.error('Generate video error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate video'
        });
    }
});

// Get video status
router.get('/status/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;

        const response = await axios.get(
            `https://tavusapi.com/v2/videos/${videoId}`,
            {
                headers: {
                    'x-api-key': process.env.TAVUS_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({
            success: true,
            data: {
                videoId: response.data.video_id,
                status: response.data.status,
                downloadUrl: response.data.download_url,
                thumbnailUrl: response.data.thumbnail_url,
                duration: response.data.duration
            }
        });
    } catch (error) {
        logger.error('Get video status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get video status'
        });
    }
});

// Create a new replica
router.post('/replica', async (req, res) => {
    try {
        const { name, trainingVideoUrl } = req.body;

        if (!name || !trainingVideoUrl) {
            return res.status(400).json({
                success: false,
                message: 'Name and training video URL are required'
            });
        }

        const response = await axios.post(
            'https://tavusapi.com/v2/replicas',
            {
                train_video_url: trainingVideoUrl,
                replica_name: name,
                callback_url: `${process.env.BACKEND_URL}/api/video/replica-webhook`
            },
            {
                headers: {
                    'x-api-key': process.env.TAVUS_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({
            success: true,
            data: {
                replicaId: response.data.replica_id,
                status: response.data.status,
                name: response.data.name
            }
        });
    } catch (error) {
        logger.error('Create replica error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create replica'
        });
    }
});

// Webhook for video generation updates
router.post('/webhook', async (req, res) => {
    try {
        const { video_id, status, download_url } = req.body;

        logger.info(`Video ${video_id} status updated: ${status}`);

        if (status === 'completed' && download_url) {
            // Here you could notify the frontend via WebSocket
            // io.emit('video-ready', { videoId: video_id, downloadUrl: download_url });
        }

        res.json({ success: true });
    } catch (error) {
        logger.error('Video webhook error:', error);
        res.status(500).json({ success: false });
    }
});

// Webhook for replica training updates
router.post('/replica-webhook', async (req, res) => {
    try {
        const { replica_id, status, training_progress } = req.body;

        logger.info(`Replica ${replica_id} training progress: ${training_progress}%`);

        if (status === 'ready') {
            // Notify user that replica is ready
            logger.info(`Replica ${replica_id} training completed`);
        }

        res.json({ success: true });
    } catch (error) {
        logger.error('Replica webhook error:', error);
        res.status(500).json({ success: false });
    }
});

export default router;

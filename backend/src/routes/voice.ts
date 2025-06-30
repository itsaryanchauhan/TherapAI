import { Router } from 'express';
import axios from 'axios';
import FormData from 'form-data';
import { logger } from '../utils/logger.js';

const router = Router();

// Get available voices
router.get('/voices', async (req, res) => {
    try {
        const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
            headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY
            }
        });

        const voices = response.data.voices.map((voice: any) => ({
            id: voice.voice_id,
            name: voice.name,
            category: voice.category,
            description: voice.description,
            previewUrl: voice.preview_url
        }));

        res.json({
            success: true,
            data: voices
        });
    } catch (error) {
        logger.error('Get voices error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch voices'
        });
    }
});

// Generate speech from text
router.post('/generate', async (req, res) => {
    try {
        const { text, voiceId, stability = 0.5, similarityBoost = 0.8 } = req.body;
        const userId = (req as any).user.userId;

        if (!text || !voiceId) {
            return res.status(400).json({
                success: false,
                message: 'Text and voiceId are required'
            });
        }

        // Check if user has access to voice features
        // This would typically check subscription status

        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability,
                    similarity_boost: similarityBoost
                }
            },
            {
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': process.env.ELEVENLABS_API_KEY
                },
                responseType: 'arraybuffer'
            }
        );

        // Convert to base64 for frontend
        const audioBase64 = Buffer.from(response.data, 'binary').toString('base64');

        res.json({
            success: true,
            data: {
                audio: `data:audio/mpeg;base64,${audioBase64}`,
                text,
                voiceId
            }
        });
    } catch (error) {
        logger.error('Generate speech error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate speech'
        });
    }
});

// Stream speech generation for real-time
router.post('/stream', async (req, res) => {
    try {
        const { text, voiceId } = req.body;

        if (!text || !voiceId) {
            return res.status(400).json({
                success: false,
                message: 'Text and voiceId are required'
            });
        }

        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
            {
                text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.8
                }
            },
            {
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': process.env.ELEVENLABS_API_KEY
                },
                responseType: 'stream'
            }
        );

        res.setHeader('Content-Type', 'audio/mpeg');
        response.data.pipe(res);
    } catch (error) {
        logger.error('Stream speech error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to stream speech'
        });
    }
});

// Clone voice from audio sample
router.post('/clone', async (req, res) => {
    try {
        const { name, description, files } = req.body;

        if (!name || !files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Name and audio files are required'
            });
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description || '');

        // Add audio files
        files.forEach((file: any, index: number) => {
            formData.append('files', file, `sample_${index}.mp3`);
        });

        const response = await axios.post(
            'https://api.elevenlabs.io/v1/voices/add',
            formData,
            {
                headers: {
                    'Accept': 'application/json',
                    'xi-api-key': process.env.ELEVENLABS_API_KEY,
                    ...formData.getHeaders()
                }
            }
        );

        res.json({
            success: true,
            data: {
                voiceId: response.data.voice_id,
                name: response.data.name
            }
        });
    } catch (error) {
        logger.error('Clone voice error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clone voice'
        });
    }
});

export default router;

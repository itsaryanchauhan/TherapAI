import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

// Chat completion with Gemini
router.post('/chat', async (req: Request, res: Response) => {
    try {
        const { message, sessionId, language = 'en' } = req.body;
        const userId = (req as any).user.userId;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Get conversation history if sessionId provided
        let conversationHistory: any[] = [];
        if (sessionId) {
            const { data: messages } = await supabase
                .from('messages')
                .select('role, content')
                .eq('session_id', sessionId)
                .eq('user_id', userId)
                .order('created_at', { ascending: true })
                .limit(20);

            conversationHistory = messages || [];
        }

        // Create system prompt for therapy context
        const systemPrompt = getSystemPrompt(language);

        // Prepare conversation context for Gemini
        let conversationContext = systemPrompt + "\n\n";

        // Add conversation history
        conversationHistory.forEach(msg => {
            conversationContext += `${msg.role === 'user' ? 'Human' : 'Therapist'}: ${msg.content}\n`;
        });

        conversationContext += `Human: ${message}\nTherapist:`;

        // Generate AI response with Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(conversationContext);
        const response = await result.response;
        const aiResponse = response.text();

        // Save messages to database if sessionId provided
        if (sessionId) {
            await Promise.all([
                supabase.from('messages').insert([{
                    session_id: sessionId,
                    user_id: userId,
                    role: 'user',
                    content: message,
                    created_at: new Date().toISOString()
                }]),
                supabase.from('messages').insert([{
                    session_id: sessionId,
                    user_id: userId,
                    role: 'assistant',
                    content: aiResponse,
                    created_at: new Date().toISOString()
                }])
            ]);
        }

        // Track usage for subscription limits
        await supabase.from('usage_tracking').insert([{
            user_id: userId,
            feature: 'ai_chat',
            tokens_used: message.length + aiResponse.length,
            created_at: new Date().toISOString()
        }]);

        res.json({
            success: true,
            response: aiResponse,
            sessionId: sessionId
        });

    } catch (error) {
        logger.error('AI Chat Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate AI response'
        });
    }
});

// Streaming chat (for real-time responses)
router.post('/chat/stream', async (req: Request, res: Response) => {
    try {
        const { message, sessionId, language = 'en' } = req.body;
        const userId = (req as any).user.userId;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Set up SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        // Get conversation history
        let conversationHistory: any[] = [];
        if (sessionId) {
            const { data: messages } = await supabase
                .from('messages')
                .select('role, content')
                .eq('session_id', sessionId)
                .eq('user_id', userId)
                .order('created_at', { ascending: true })
                .limit(20);

            conversationHistory = messages || [];
        }

        const systemPrompt = getSystemPrompt(language);
        let conversationContext = systemPrompt + "\n\n";

        conversationHistory.forEach(msg => {
            conversationContext += `${msg.role === 'user' ? 'Human' : 'Therapist'}: ${msg.content}\n`;
        });

        conversationContext += `Human: ${message}\nTherapist:`;

        // Generate streaming response with Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContentStream(conversationContext);

        let fullResponse = '';

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;

            res.write(`data: ${JSON.stringify({
                type: 'content',
                content: chunkText
            })}\n\n`);
        }

        // Save conversation to database
        if (sessionId) {
            await Promise.all([
                supabase.from('messages').insert([{
                    session_id: sessionId,
                    user_id: userId,
                    role: 'user',
                    content: message,
                    created_at: new Date().toISOString()
                }]),
                supabase.from('messages').insert([{
                    session_id: sessionId,
                    user_id: userId,
                    role: 'assistant',
                    content: fullResponse,
                    created_at: new Date().toISOString()
                }])
            ]);
        }

        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();

    } catch (error) {
        logger.error('Streaming Chat Error:', error);
        res.write(`data: ${JSON.stringify({
            type: 'error',
            message: 'Failed to generate response'
        })}\n\n`);
        res.end();
    }
});

// Analyze conversation sentiment/mood
router.post('/analyze', async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.body;
        const userId = (req as any).user.userId;

        // Get recent conversation
        const { data: messages } = await supabase
            .from('messages')
            .select('content, role, created_at')
            .eq('session_id', sessionId)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (!messages || messages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No conversation found'
            });
        }

        // Prepare analysis prompt
        const conversationText = messages
            .reverse()
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n');

        const analysisPrompt = `
Analyze this therapy conversation and provide insights:

${conversationText}

Please provide:
1. Overall mood/sentiment (scale 1-10)
2. Key emotional themes
3. Progress indicators
4. Recommendations for next session

Format as JSON:
{
  "mood_score": number,
  "sentiment": "positive/neutral/negative",
  "themes": ["theme1", "theme2"],
  "progress": "description",
  "recommendations": ["rec1", "rec2"]
}
`;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(analysisPrompt);
        const response = await result.response;
        const analysisText = response.text();

        // Try to parse JSON response
        let analysis;
        try {
            analysis = JSON.parse(analysisText);
        } catch {
            // Fallback if not valid JSON
            analysis = {
                mood_score: 5,
                sentiment: "neutral",
                themes: ["general discussion"],
                progress: "Session completed",
                recommendations: ["Continue regular sessions"]
            };
        }

        res.json({
            success: true,
            analysis
        });

    } catch (error) {
        logger.error('Analysis Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to analyze conversation'
        });
    }
});

// Get therapy system prompt based on language
function getSystemPrompt(language: string = 'en'): string {
    const prompts = {
        en: `You are a compassionate, professional AI therapist named TherapAI. You provide supportive, evidence-based mental health guidance while maintaining appropriate boundaries.

Guidelines:
- Be empathetic and non-judgmental
- Use active listening techniques
- Ask clarifying questions when helpful
- Provide coping strategies and tools
- Encourage professional help for serious issues
- Maintain confidentiality and trust
- Use therapeutic techniques like CBT, mindfulness
- Keep responses concise but meaningful
- Never provide medical diagnoses or prescriptions

Remember: You're here to support, not replace professional therapy.`,

        es: `Eres TherapAI, un terapeuta de IA compasivo y profesional. Proporcionas orientación de salud mental de apoyo y basada en evidencia mientras mantienes límites apropiados.

Pautas:
- Sé empático y sin prejuicios
- Utiliza técnicas de escucha activa
- Haz preguntas aclaratorias cuando sea útil
- Proporciona estrategias de afrontamiento y herramientas
- Fomenta la ayuda profesional para problemas serios
- Mantén la confidencialidad y la confianza
- Usa técnicas terapéuticas como TCC, mindfulness
- Mantén las respuestas concisas pero significativas
- Nunca proporciones diagnósticos médicos o prescripciones

Recuerda: Estás aquí para apoyar, no reemplazar la terapia profesional.`,

        fr: `Vous êtes TherapAI, un thérapeute IA compatissant et professionnel. Vous fournissez des conseils de santé mentale soutenants et fondés sur des preuves tout en maintenant des limites appropriées.

Directives:
- Soyez empathique et sans jugement
- Utilisez des techniques d'écoute active
- Posez des questions clarifiantes quand c'est utile
- Fournissez des stratégies d'adaptation et des outils
- Encouragez l'aide professionnelle pour les problèmes sérieux
- Maintenez la confidentialité et la confiance
- Utilisez des techniques thérapeutiques comme la TCC, la pleine conscience
- Gardez les réponses concises mais significatives
- Ne fournissez jamais de diagnostics médicaux ou de prescriptions

Rappelez-vous: Vous êtes là pour soutenir, pas remplacer la thérapie professionnelle.`
    };

    return prompts[language as keyof typeof prompts] || prompts.en;
}

export default router;

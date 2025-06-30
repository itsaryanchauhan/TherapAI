# TherapAI API Setup Guide

This comprehensive guide will help you set up the required API keys for TherapAI's advanced features, including detailed context about what information each provider needs.

## Overview

TherapAI is designed to provide personalized AI therapy specifically for startup founders and entrepreneurs. To enable all features, you'll need API keys from different providers:

- **Google Gemini** (Required): Powers the main conversation engine
- **ElevenLabs** (Optional): Enables voice features and natural speech
- **Tavus** (Optional): Enables video avatar responses

## Required APIs

### 1. Google Gemini (Required for Basic Chat)
**Purpose**: Powers the main AI conversation engine with therapy-specific training
**Cost**: Free tier with generous limits (60 requests/min, 1M tokens/day)
**Required for**: All chat functionality, therapy conversations, emotional support

#### What You're Getting:
- Advanced conversational AI specifically helpful for entrepreneurs
- Understanding of startup challenges, stress, and decision-making
- Emotional intelligence and therapeutic response capabilities
- Long conversation memory and context understanding

#### Setup Steps:
1. **Visit Google AI Studio**: Go to [makersuite.google.com](https://makersuite.google.com)
2. **Sign In**: Use your Google account (personal or business)
3. **Create API Key**: 
   - Click "Get API Key" in the top navigation
   - Click "Create API key in new project" (recommended for organization)
   - Or select an existing Google Cloud project if you have one
4. **Copy Key**: Save the generated key immediately (it won't be shown again)
5. **Add to TherapAI**: Paste in Settings under "Google Gemini API Key"

#### What to Tell Google (Context):
When setting up, you can mention:
- "AI-powered therapy assistant for startup founders"
- "Conversational AI for mental health support"
- "Educational and wellness application"

### 2. ElevenLabs (Optional - Enables Voice Features)
**Purpose**: AI voice generation and speech recognition for natural conversations
**Cost**: Free tier (10,000 characters/month), then $5-99/month based on usage
**Required for**: Voice mode, voice responses, audio transcription

#### What You're Getting:
- **Voice Input**: Convert your speech to text in any chat mode (supplements browser voice recognition)
- **Voice Responses**: AI responds with natural, human-like voice in voice mode
- **Voice Conversations**: Full voice-to-voice therapy sessions
- **Multiple Voice Options**: Choose from various natural-sounding voices
- **High Accuracy**: Better transcription than browser-based speech recognition

#### Setup Steps:
1. **Visit ElevenLabs**: Go to [elevenlabs.io](https://elevenlabs.io)
2. **Create Account**: Sign up with email, Google, or GitHub
3. **Access API Settings**: 
   - Click your profile picture (top-right corner)
   - Select "Profile" from dropdown
   - Click on "API Keys" tab
4. **Generate Key**:
   - Click "Create API Key" button
   - Name it something descriptive like "TherapAI Integration" or "Therapy App"
   - Copy the generated key immediately
5. **Add to TherapAI**: Paste in Settings under "ElevenLabs API Key"

#### What to Tell ElevenLabs (Context):
When signing up or if asked about usage:
- "Voice integration for mental health and therapy application"
- "AI therapy assistant with voice conversation capabilities"
- "Wellness and mental health support for entrepreneurs"
- "Educational therapy content and voice interaction"

#### Voice Features You'll Unlock:
- **In Chat Mode**: Click microphone to speak instead of typing
- **In Voice Mode**: Full voice-to-voice conversations with AI therapist
- **Better Accuracy**: More reliable voice recognition than browser APIs
- **Natural Responses**: AI responds with warm, therapeutic voice tones

### 3. Tavus (Optional - Enables Video Avatar Features)
**Purpose**: AI video generation with personalized avatars for therapy sessions
**Cost**: Enterprise pricing (contact sales) - Professional/commercial use
**Required for**: Video mode, AI avatar responses, visual therapy sessions

#### What You're Getting:
- **AI Avatar Videos**: Personalized video responses with human-like avatars
- **Video Conversations**: Full video therapy sessions with AI avatar
- **Custom Avatars**: Create therapy-specific avatar personalities
- **Personalized Experience**: Visual therapy that feels more human and engaging
- **Professional Quality**: High-quality video suitable for therapy applications

#### Setup Steps:
1. **Visit Tavus**: Go to [tavus.io](https://www.tavus.io)
2. **Contact Sales Team**: This is an enterprise platform, so you'll need to reach out
3. **Provide Context**: Explain your therapy application use case (see below)
4. **Complete Onboarding**: Work with their team to set up avatars and permissions
5. **Receive Credentials**: Get your API key after approval and setup
6. **Add to TherapAI**: Paste API key in Settings under "Tavus API Key"

#### What to Tell Tavus (Context):
When contacting their sales team, provide this information:
- **Application Type**: "AI-powered therapy and mental health support platform"
- **Target Audience**: "Startup founders and entrepreneurs seeking mental health support"
- **Use Case**: "Video-based AI therapy conversations with avatar responses"
- **Content Type**: "Therapeutic conversations, mental health support, wellness guidance"
- **Deployment**: "Web application for individual therapy sessions"
- **Volume**: Estimate your expected monthly video generation needs
- **Business Model**: Explain if this is for personal use, business, or commercial therapy services

#### Enterprise Considerations:
- **Professional Use**: Tavus is designed for commercial and professional applications
- **Custom Avatars**: They'll help create appropriate avatars for therapy contexts
- **Compliance**: They can assist with healthcare and privacy compliance needs
- **Integration Support**: Technical support for API integration
- **Usage Analytics**: Detailed reporting and usage monitoring

#### Video Features You'll Unlock:
- **In Video Mode**: AI responds with full video avatar instead of just text/voice
- **Visual Therapy**: More engaging and human-like therapy experience
- **Avatar Personalities**: Different avatar styles for different therapy approaches
- **Professional Presentation**: High-quality video suitable for therapy applications

## API Key Security

### Local Storage
- All API keys are stored locally in your browser
- Keys are never sent to TherapAI servers
- Your conversations remain private and secure

### Best Practices
- Keep your API keys secure and don't share them
- Regenerate keys if you suspect they've been compromised
- Monitor your usage through each provider's dashboard
- Set up usage limits if available

## Feature Matrix

| Feature | Gemini | ElevenLabs | Tavus |
|---------|--------|------------|-------|
| Text Chat | ✅ Required | ❌ | ❌ |
| Voice Input | ❌ | ✅ Recommended* | ❌ |
| Voice Responses | ❌ | ✅ Required | ❌ |
| Video Responses | ❌ | ✅ For Audio | ✅ Required |
| Voice Mode | ✅ Required | ✅ Required | ❌ |
| Video Mode | ✅ Required | ✅ Recommended | ✅ Required |

*Voice input can work with browser's Web Speech API without ElevenLabs, but ElevenLabs provides better accuracy and fallback support.

## Pricing Overview

### Google Gemini
- **Free Tier**: 60 requests per minute, 1M tokens per day
- **Paid**: $0.00025 per 1K input tokens, $0.0005 per 1K output tokens
- **Best for**: Most users can use free tier

### ElevenLabs
- **Free**: 10,000 characters/month
- **Starter**: $5/month for 30,000 characters
- **Creator**: $22/month for 100,000 characters
- **Pro**: $99/month for 500,000 characters
- **Best for**: Start with free tier, upgrade based on usage

### Tavus
- **Enterprise only**: Contact sales for pricing
- **Custom**: Based on usage and features needed
- **Best for**: Professional/commercial therapy applications

## Troubleshooting

### Common Issues

#### API Key Not Working
- Verify the key is copied correctly (no extra spaces)
- Check if the key has proper permissions
- Ensure your account is active and in good standing
- Try regenerating the key

#### Voice Recognition Not Working
- Grant microphone permissions in your browser
- Check if Web Speech API is supported in your browser
- Ensure ElevenLabs key is valid if using fallback transcription
- Test microphone with other applications

#### Rate Limits Exceeded
- Check your usage in the provider's dashboard
- Upgrade to a higher tier if needed
- Wait for limits to reset (usually monthly)
- Consider implementing conversation batching

#### Video Features Not Loading
- Verify Tavus API key is correct
- Check if your Tavus account has video generation enabled
- Ensure stable internet connection for video processing
- Contact Tavus support for enterprise-specific issues

### Getting Help

1. **Provider Documentation**:
   - [Google Gemini Docs](https://ai.google.dev/docs)
   - [ElevenLabs Docs](https://docs.elevenlabs.io/)
   - [Tavus Docs](https://docs.tavus.io/)

2. **Provider Support**:
   - Check respective provider's support channels
   - Use their community forums
   - Contact their support teams for specific issues

3. **TherapAI Issues**:
   - Check the console for error messages
   - Verify all API keys are properly formatted
   - Try refreshing the application
   - Clear browser cache if needed

## Privacy & Data Handling

### Your Data
- API keys stored locally in browser only
- Conversations processed by respective AI providers
- No data stored on TherapAI servers
- You control your data through provider settings

### Provider Policies
- **Google**: Subject to Google's AI usage policies
- **ElevenLabs**: Voice data processed according to their privacy policy
- **Tavus**: Video generation subject to their enterprise terms

### Recommendations
- Review each provider's privacy policy
- Understand data retention policies
- Consider data residency requirements for professional use
- Implement additional security measures for sensitive deployments

---

## Quick Start Checklist

- [ ] Create Google account and get Gemini API key
- [ ] Add Gemini key to TherapAI Settings
- [ ] Test basic chat functionality
- [ ] (Optional) Sign up for ElevenLabs free account
- [ ] (Optional) Add ElevenLabs key for voice features
- [ ] (Optional) Contact Tavus for enterprise video features
- [ ] Review privacy policies and terms of service
- [ ] Set up usage monitoring and alerts
- [ ] Bookmark provider dashboards for easy access

Ready to start your AI therapy journey! 🧠✨

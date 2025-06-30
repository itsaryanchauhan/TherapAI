# TherapAI 🧠💬
**AI-Powered Mental Health Platform | The Future of Accessible Therapy**

> Democratizing mental health care through AI-powered conversations, voice interactions, and video therapy sessions. Built for scale, designed for impact.

## � What is TherapAI?

TherapAI is a comprehensive mental health platform that combines artificial intelligence with proven therapeutic techniques to provide 24/7 accessible mental health support. Unlike traditional therapy that can be expensive and hard to access, TherapAI offers:

- **Instant AI Therapy Sessions** - Available 24/7 with Google Gemini-powered therapeutic conversations
- **Voice & Video Interactions** - Natural conversations using ElevenLabs and Tavus technology  
- **Subscription-Based Model** - Scalable revenue through tiered access plans
- **Multi-Language Support** - Global accessibility with i18next localization
- **Privacy-First Design** - Secure, HIPAA-compliant data handling

## 💡 Why TherapAI Matters

### The Mental Health Crisis
- **1 billion people** worldwide suffer from mental health disorders
- **Average therapy cost**: $100-200 per session
- **Therapist shortage**: 1 therapist per 350 people who need help
- **Wait times**: 2-8 weeks for first appointment

### Our Solution
- **$0-50/month** subscription model vs $400-800/month traditional therapy
- **Instant access** to therapeutic support anytime, anywhere
- **Scalable AI therapists** that never sleep or take vacations
- **Privacy by design** - no judgment, complete anonymity

## 🚀 Complete Netlify Deployment Guide

### Prerequisites
1. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
2. **GitHub Repository** - Push this code to GitHub
3. **Required API Keys**:
   - Supabase (Database & Auth)
   - Google Gemini (AI Conversations)
   - ElevenLabs (Voice Synthesis)
   - Tavus (Video Personas)
   - RevenueCat (Subscriptions)

### Option 1: Automatic Deployment (Recommended)
```bash
# Easy one-command deployment
.\deploy-netlify.ps1
```

### Option 2: Manual Deployment

#### Step 1: Connect GitHub to Netlify
1. Push your code to GitHub
2. Go to [Netlify Dashboard](https://app.netlify.com)
3. Click "New site from Git"
4. Connect your GitHub repo
5. Set build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `../backend/netlify/functions`

#### Step 2: Configure Environment Variables
In Netlify Dashboard → Site Settings → Environment Variables:

**Frontend Variables:**
```bash
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_TAVUS_API_KEY=your_tavus_api_key_here
VITE_REVENUECAT_PUBLIC_KEY=your_revenuecat_public_key_here
```

**Backend Variables (for Functions):**
```bash
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
TAVUS_API_KEY=your_tavus_api_key_here
REVENUECAT_API_KEY=your_revenuecat_secret_key_here
JWT_SECRET=your_generated_jwt_secret
```

### Step 3: Database Setup
```sql
-- Run this in Supabase SQL editor
-- (Found in supabase/migrations/20250630113410_late_valley.sql)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables and policies
-- (Full SQL in the migration file)
```

### Step 4: Custom Domain & SSL (Optional)
1. **Custom Domain**: Add your domain in Netlify Dashboard
2. **SSL Certificate**: Automatic with Netlify
3. **DNS**: Point your domain to Netlify's servers

### Step 5: Launch! 🚀
Your TherapAI startup is now live at: `https://your-site.netlify.app`

## 📊 Business Model

### Revenue Streams
1. **Freemium Model**
   - Free: 10 messages/day, text only
   - Pro ($19/month): Unlimited messages, voice
   - Premium ($49/month): Video therapy, priority support

2. **B2B Enterprise**
   - White-label solutions for healthcare providers
   - Employee assistance programs
   - University counseling services

3. **Marketplace**
   - Licensed therapist connections
   - Specialized AI models for specific conditions
   - Therapeutic content and exercises

### Market Opportunity
- **Global Mental Health Market**: $383 billion by 2025
- **Digital Therapy Market**: $7.6 billion by 2030
- **Target Users**: 18-45 years old, tech-savvy, privacy-conscious

## 🛠️ Tech Stack

### Frontend (React App)
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS for modern UI
- **State**: React Context + Hooks
- **Routing**: React Router for SPA navigation
- **Build**: Optimized production builds with Vite

### Backend (API Server)
- **Runtime**: Node.js + Express.js + TypeScript
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Authentication**: JWT + Supabase Auth
- **File Storage**: Supabase Storage for media files

### AI & Media Services
- **AI Chat**: Google Gemini for therapeutic conversations
- **Voice**: ElevenLabs for natural speech synthesis
- **Video**: Tavus for AI-powered video personas
- **Payments**: RevenueCat for subscription management

### Infrastructure
- **Hosting**: Netlify (frontend + serverless functions)
- **Database**: Supabase (managed PostgreSQL)
- **CDN**: Netlify Edge Network
- **Functions**: Netlify Serverless Functions
- **Security**: HTTPS, CORS, rate limiting

## 📁 Project Structure
```
TherapAI/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API integrations
│   │   └── types/          # TypeScript definitions
│   └── package.json
├── backend/                  # Express.js API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Helper functions
│   └── package.json
└── supabase/                # Database schema
    └── migrations/         # SQL migration files
```

## � Security & Compliance

### Data Protection
- **Encryption**: All data encrypted at rest and in transit
- **Privacy**: No conversation data stored permanently
- **GDPR Compliant**: User data deletion and export
- **HIPAA Ready**: Healthcare compliance features

### Security Features
- Rate limiting on all endpoints
- JWT token authentication
- CORS protection
- Input validation and sanitization
- SQL injection prevention

## 🚀 Scaling Strategy

### Technical Scaling
- **CDN**: Global content delivery via Vercel Edge
- **Database**: Supabase auto-scaling PostgreSQL
- **Caching**: Redis for session and API response caching
- **Load Balancing**: Automatic with Vercel serverless functions

### Business Scaling
- **Geographic Expansion**: Multi-language, cultural adaptation
- **Vertical Integration**: Specialized models for anxiety, depression, PTSD
- **Partnership Network**: Integration with healthcare providers
- **Mobile Apps**: React Native or native iOS/Android apps

## 📈 Monetization Timeline

### Month 1-3: MVP Launch
- Deploy basic AI chat functionality
- Implement user authentication
- Launch freemium model

### Month 4-6: Feature Expansion  
- Add voice interactions
- Implement subscription tiers
- User analytics and feedback

### Month 7-12: Scale & Growth
- Video therapy sessions
- Mobile app launch
- B2B pilot programs
- International expansion

## 🤝 Contributing

This is an open-source mental health initiative. Contributions welcome:

1. **Developers**: Frontend, backend, AI improvements
2. **Mental Health Professionals**: Therapeutic accuracy review
3. **Designers**: UX/UI improvements
4. **Translators**: Multi-language support

## 📄 License

MIT License - Free for personal and commercial use.

---

**Ready to revolutionize mental health care?** 
Deploy TherapAI today and start making therapy accessible to everyone, everywhere.

## 📧 Email Configuration (SMTP)

**What is SMTP?** Simple Mail Transfer Protocol - how your app sends emails.

**Why do you need it?**
- **Password reset emails** - When users forget their password
- **Account verification** - Confirm email addresses during signup
- **Subscription notifications** - Payment confirmations, upgrades, cancellations
- **Therapeutic summaries** - Weekly progress reports (optional)
- **Emergency alerts** - Crisis detection notifications to support team

**Popular Email Services:**
1. **Gmail** (Free tier: 100 emails/day)
   - SMTP Host: `smtp.gmail.com`
   - Port: `587`
   - Requires: App password (not your regular Gmail password)
   
2. **SendGrid** (Free tier: 100 emails/day)
   - SMTP Host: `smtp.sendgrid.net`
   - Port: `587`
   - Requires: API key
   
3. **Mailgun** (Free tier: 1000 emails/month)
   - More developer-friendly
   - Better deliverability for businesses

**For Production:** Use SendGrid or Mailgun for better deliverability and analytics.

# TherapAI 🧠💬
**AI-Powered Ment2. **GitHub Repository** - Push this code to GitHub
3. **Supabase Account** - For user authentication and database
4. **Users provide their own API keys** through Settings page:
   - Google Gemini (required for AI chat)
   - ElevenLabs (optional for voice)
   - Tavus (optional for video)th Platform | The Future of Accessible Therapy**

> Democratizing mental health care through AI-powered conversations, voice interactions, and video therapy sessions. Built for scale, designed for impact.

## 💡 What is TherapAI?

TherapAI is a **free, open-source** mental health platform that combines artificial intelligence with proven therapeutic techniques to provide 24/7 accessible mental health support. Unlike traditional therapy apps with subscriptions, TherapAI lets users bring their own AI API keys for a truly personalized experience:

- **Instant AI Therapy Sessions** - Available 24/7 with Google Gemini-powered therapeutic conversations
- **Voice & Video Interactions** - Optional ElevenLabs and Tavus integration for premium features  
- **User-Controlled API Keys** - No subscriptions, users pay AI providers directly for their usage
- **Privacy-First Design** - API keys stored locally, no server-side key storage
- **Open Source** - Complete transparency and customization freedom

## 💡 Why TherapAI Matters

### The Mental Health Crisis
- **1 billion people** worldwide suffer from mental health disorders
- **Average therapy cost**: $100-200 per session
- **Therapist shortage**: 1 therapist per 350 people who need help
- **Wait times**: 2-8 weeks for first appointment

### Our Solution
- **$0 upfront cost** - Free platform with bring-your-own-API-keys model
- **Direct AI provider pricing** - Pay only for actual usage (typically $0.001-0.01 per session)
- **Instant access** to therapeutic support anytime, anywhere
- **Unlimited usage** - No artificial limits, only limited by your API budget
- **Complete privacy** - Keys stored locally, no tracking or data collection

## 🚀 Complete Netlify Deployment Guide

### Prerequisites
1. **Node.js & npm** - Download from [nodejs.org](https://nodejs.org) (LTS version)
2. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
3. **GitHub Repository** - Push this code to GitHub
4. **Required API Keys**:
   - Supabase (Database & Auth)
   - Google Gemini (AI Conversations)
   - ElevenLabs (Voice Synthesis)
   - Tavus (Video Personas)
   - RevenueCat (Subscriptions)

### Option 1: Automatic Deployment (Recommended)
```powershell
# Step 1: Install Node.js from https://nodejs.org (if not already installed)
# Step 2: Open PowerShell in the TherapAI folder
# Step 3: Run the deployment script
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

**Frontend Variables (Public - Safe to expose):**
```bash
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# For Netlify: API is on same domain as frontend
VITE_BACKEND_URL=/api
```

**Backend Variables (Private - Keep secret!):**
```bash
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
JWT_SECRET=your_generated_jwt_secret

# CORS setup - replace with your actual Netlify URL
FRONTEND_URL=https://your-therapai-site.netlify.app

# Optional: Email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**🔑 AI API Keys:**
Users add their own API keys through the Settings page. Keys are stored securely in browser localStorage and never sent to your server!

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

### 📋 **Deployment Checklist**

#### Before Deployment:
1. ✅ Set `VITE_BACKEND_URL=/api` in Netlify environment variables
2. ✅ Set `FRONTEND_URL=https://your-actual-domain.netlify.app` in backend
3. ✅ Update Supabase CORS settings to allow your Netlify domain
4. ✅ Test API calls work with relative URLs

#### After Deployment:
1. 🌐 Note your Netlify URL (e.g., `https://amazing-therapai-123.netlify.app`)
2. 🔧 Update `FRONTEND_URL` in backend environment with actual URL
3. 🔄 Redeploy to apply CORS changes
4. ✅ Test all features work on live site

## 🌐 **Netlify URL Structure**

### How It Works:
```
Your TherapAI Domain: https://therapai.netlify.app
├── Frontend: https://therapai.netlify.app (React app)
└── Backend API: https://therapai.netlify.app/api/* (Serverless functions)
```

### Environment Variables:
```bash
# Development (local)
VITE_BACKEND_URL=http://localhost:3001/api

# Production (Netlify)  
VITE_BACKEND_URL=/api  # Relative URL - same domain!
```

### Why `/api` instead of full URL?
- **Same Domain**: Frontend and backend on same Netlify site
- **No CORS Issues**: Same-origin requests
- **Simpler**: No need to hardcode domain names
- **SSL Automatic**: HTTPS everywhere

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
- **Subscriptions**: RevenueCat for cross-platform subscription management

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

## 🔒 **Critical Security Note**

**❌ NEVER put secret API keys in frontend code!**

### Why?
- Frontend code is **public** - anyone can see it
- API keys in frontend = **instant security breach**
- Hackers can steal your keys and rack up charges

### Correct Architecture:
```
Frontend (Public)     Backend (Private)
├── Supabase URL      ├── Gemini API Key  
├── Anon Key          ├── ElevenLabs Key
└── RevenueCat Public └── All Secret Keys
```

### How TherapAI Works Securely:
1. **Frontend** calls your backend API
2. **Backend** uses secret keys to call AI services
3. **Never expose** secret keys to users

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

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. **npm not recognized / Node.js not installed**
```bash
# Error: 'npm' is not recognized as a command
```
**Solution**: 
1. Download Node.js LTS from [nodejs.org](https://nodejs.org)
2. Install using default settings (includes npm)
3. Restart your terminal/PowerShell
4. Test: `node --version` and `npm --version`

#### 2. **Package version not found (like elevenlabs@^0.3.4)**
```bash
# Error: npm error notarget No matching version found
```
**Solution**: The package.json has been fixed! We removed the incorrect `elevenlabs` package.

#### 3. **Netlify build fails**
**Solution**: 
1. Check environment variables are set correctly
2. Ensure `VITE_BACKEND_URL=/api` (not full URL)
3. Verify all required API keys are added

#### 4. **API calls fail in production**
**Solution**: 
1. Update `FRONTEND_URL` in backend environment to your actual Netlify URL
2. Check Supabase CORS settings allow your domain
3. Verify API endpoints use relative URLs (`/api/...`)

#### 5. **TypeScript errors in backend**
```bash
# Error: Cannot find name 'process'
```
**Solution**: The backend already includes `@types/node` in devDependencies. If issues persist:
```bash
cd backend
npm install
```

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

## 🔑 Required API Keys

### 1. **Supabase** (Database & Auth)
- **Get at**: https://supabase.com
- **Free tier**: 500MB database, 50,000 monthly active users
- **Cost**: $25/month for production

### 2. **RevenueCat** (Subscriptions)
- **Get at**: https://revenuecat.com
- **Free tier**: Up to $10k Monthly Tracked Revenue
- **Cost**: 1% of revenue above free tier
- Use the **public API key** in frontend
- Use the **secret API key** in backend
- Set up webhook endpoint: `https://your-site.netlify.app/api/subscription/webhook`
- Configure products/offerings in RevenueCat dashboard

### 3. **Google Gemini** (AI Chat)
- **Get at**: https://makersuite.google.com/app/apikey
- **Free tier**: 60 requests/minute
- **Cost**: $0.00025 per 1K characters

### 4. **ElevenLabs** (Voice)
- **Get at**: https://elevenlabs.io
- **Free tier**: 10,000 characters/month
- **Cost**: $5/month for 30K characters

### 5. **Tavus** (Video Avatars)
- **Get at**: https://tavus.io
- **Cost**: Pay-per-use, ~$1 per minute of video

## 💰 Pricing Strategy

### TherapAI Plans:
- **Free**: $0/month
  - 5 AI sessions per month
  - Text chat only
  - Basic support

- **Premium**: $19.99/month  
  - Unlimited AI sessions
  - Voice responses
  - Priority support

- **Pro**: $39.99/month
  - All Premium features
  - Video avatar therapy
  - Custom therapy plans
  - 1-on-1 human therapist connection

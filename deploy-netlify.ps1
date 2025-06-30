# TherapAI Netlify Deployment Script
Write-Host "🚀 Deploying TherapAI to Netlify..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install from https://nodejs.org" -ForegroundColor Red
    Write-Host "💡 Download the LTS version and restart your terminal" -ForegroundColor Yellow
    exit 1
}

# Check if Netlify CLI is installed
try {
    netlify --version | Out-Null
    Write-Host "✅ Netlify CLI found" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Netlify CLI..." -ForegroundColor Yellow
    npm install -g netlify-cli
}

# Check if we're in the right directory
if (-not (Test-Path "frontend") -or -not (Test-Path "backend")) {
    Write-Host "❌ Please run this script from the TherapAI root directory" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Write-Host "  Frontend..." -ForegroundColor Cyan
Set-Location frontend
npm install
Set-Location ..

Write-Host "  Backend..." -ForegroundColor Cyan
Set-Location backend
npm install
Set-Location ..

# Build frontend
Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host "✅ Frontend build successful!" -ForegroundColor Green

# Deploy to Netlify
Write-Host "🌐 Deploying to Netlify..." -ForegroundColor Yellow

# Check if site is already linked
if (Test-Path ".netlify") {
    Write-Host "🔄 Updating existing site..." -ForegroundColor Cyan
    netlify deploy --prod
} else {
    Write-Host "🆕 Creating new Netlify site..." -ForegroundColor Cyan
    netlify deploy --prod --open
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔐 IMPORTANT: Configure environment variables in Netlify dashboard:" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Frontend (Public - Site settings > Environment variables):" -ForegroundColor Yellow
    Write-Host "   • VITE_SUPABASE_URL" -ForegroundColor White
    Write-Host "   • VITE_SUPABASE_ANON_KEY" -ForegroundColor White
    Write-Host "   • VITE_BACKEND_URL=/api" -ForegroundColor White
    Write-Host ""
    Write-Host "   Backend (Private - Functions environment):" -ForegroundColor Yellow
    Write-Host "   • SUPABASE_SERVICE_KEY" -ForegroundColor White
    Write-Host "   • JWT_SECRET" -ForegroundColor White
    Write-Host "   • FRONTEND_URL=https://your-actual-site.netlify.app" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 API Keys: Users add their own keys in app Settings (stored locally)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔒 Security Note: Never put secret API keys in frontend!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Set up custom domain (optional)" -ForegroundColor Gray
    Write-Host "2. Test all features in production" -ForegroundColor Gray
    Write-Host "3. Launch your TherapAI startup! 🚀" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 Tip: Use 'netlify open' to access your site dashboard" -ForegroundColor Blue
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "💡 Check the error above and try again" -ForegroundColor Yellow
}

# TherapAI Netlify Deployment Guide

## Quick Deployment Steps:

1. **Build the frontend:**
   ```powershell
   cd frontend
   npm install --legacy-peer-deps
   npm run build
   cd ..
   ```

2. **Deploy to Netlify:**
   ```powershell
   netlify deploy --prod --dir frontend/dist
   ```

## Debugging Chat Issues on Netlify:

After deployment, if chat isn't working:

1. **Open your deployed site**
2. **Look for a small red "Debug" button** in the bottom-right corner
3. **Click it and run the debug tests** - this will show you exactly what's wrong
4. **Common issues and fixes:**

### Issue: "API Key not found"
- Go to Settings in your app
- Re-enter your Gemini API key
- Make sure it starts with "AIza" and is about 39 characters

### Issue: "CORS Error" or "Network Error"
- This means direct API calls are blocked
- You might need to use the backend API functions instead
- Check if `/api/*` routes are working

### Issue: "403 Forbidden"
- Your API key doesn't have permission
- Go to https://makersuite.google.com/app/apikey
- Make sure "Generative AI API" is enabled
- Check your billing settings

### Issue: "Invalid API key format"
- Your API key might be copied incorrectly
- Make sure there are no extra spaces or characters
- Re-copy from Google AI Studio

## Environment Check:
The debug panel will show you:
- ✅ localStorage working
- ✅ API key present and format
- ✅ Network connectivity
- ✅ Gemini API test call
- 📊 Environment details

## If Debug Button Doesn't Appear:
The debug panel is included in the build. If you don't see it:
1. Hard refresh the page (Ctrl+F5)
2. Check browser console for JavaScript errors
3. Make sure the build completed successfully

## Netlify-Specific Issues:
1. **Build fails**: Check Node.js version in build logs
2. **Routes don't work**: Check `netlify.toml` redirects
3. **API calls fail**: Verify function routing in `netlify.toml`

For support, copy the debug information and share it.

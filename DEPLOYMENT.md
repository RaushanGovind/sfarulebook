# Deploying SFA Rules Book to Vercel

## 📋 Pre-Deployment Checklist

### ✅ Completed:
1. ✅ Vercel configuration file (`vercel.json`) created
2. ✅ API endpoint structure configured (`/api/index.js`)
3. ✅ Server modified to support serverless deployment
4. ✅ Code pushed to GitHub

### 🔧 Required Environment Variables

Before deploying to Vercel, you need to set up these environment variables in your Vercel project:

```
MONGO_URI=mongodb+srv://sfarulebook:Raushan236@cluster0.rwxvzfk.mongodb.net/sfa_rules_book?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=sfa_secret_key_123
MASTER_SECRET=sfa_master_key_promote
GOOGLE_CLIENT_ID=303925272558-n32fq4gjrd9hr69jhf58jmnc5933su4p.apps.googleusercontent.com
PORT=5000
```

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - Link to your GitHub repository
   - Set environment variables when prompted

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository: `RaushanGovind/SFARuleBook`
4. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all the variables listed above
   - Make sure to add them for **Production**, **Preview**, and **Development**

6. Click **Deploy**

## 📝 Post-Deployment

### Update API URL in Frontend

After deployment, you'll get a Vercel URL (e.g., `https://your-app.vercel.app`).

Update the API URL in `src/App.jsx`:
```javascript
const API_URL = 'https://your-app.vercel.app/api';
```

### Update Google OAuth Redirect URIs

Add your Vercel URL to Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth client
3. Add authorized redirect URIs:
   - `https://your-app.vercel.app`
   - `https://your-app.vercel.app/`

## 🔍 Troubleshooting

### API Routes Not Working
- Ensure `/api` routes are properly configured in `vercel.json`
- Check environment variables are set correctly
- Verify MongoDB connection string allows connections from anywhere (0.0.0.0/0)

### Build Failures
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Database Connection Issues
- Whitelist Vercel IPs in MongoDB Atlas
- Or better: Allow connections from anywhere (0.0.0.0/0) in MongoDB Atlas Network Access

## 📞 Support

For issues, check:
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Repository Issues](https://github.com/RaushanGovind/SFARuleBook/issues)

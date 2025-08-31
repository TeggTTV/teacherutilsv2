# Deployment Guide for Vercel

## Environment Configuration

This app uses environment-based URL configuration to handle different deployment environments (local, staging, production).

### Environment Variables

Set these in your Vercel project settings:

#### Required Variables:
```
DATABASE_URL=your-mongodb-connection-string
NEXTAUTH_SECRET=your-secure-secret-key
NEXT_PUBLIC_ENV_KEY=production
NEXT_PUBLIC_PRODUCTION_URL=https://your-app.vercel.app
```

#### Optional Variables:
```
NEXT_PUBLIC_CUSTOM_URL=https://your-custom-domain.com
NEXT_PUBLIC_STAGING_URL=https://staging-your-app.vercel.app
```

### How it works:

The app uses `getApiUrl()` from `/src/lib/config.ts` to determine the correct API URL based on the environment:

1. **Local Development** (`NEXT_PUBLIC_ENV_KEY=local`): Uses `http://localhost:3000`
2. **Production** (`NEXT_PUBLIC_ENV_KEY=production`): Uses `NEXT_PUBLIC_PRODUCTION_URL`
3. **Custom Domain**: If `NEXT_PUBLIC_CUSTOM_URL` is set, it takes precedence
4. **Auto-detection**: Falls back to Vercel's automatic URL detection

### Deployment Steps:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables

3. **Set Environment Variables in Vercel**:
   - Go to Project Settings → Environment Variables
   - Add all required variables from `.env.example`
   - Set `NEXT_PUBLIC_ENV_KEY=production`
   - Set `NEXT_PUBLIC_PRODUCTION_URL=https://your-app.vercel.app`

4. **Deploy**:
   - Vercel will automatically deploy on every push to main
   - First deployment might take a few minutes

### Testing Different Environments:

- **Local**: `NEXT_PUBLIC_ENV_KEY=local`
- **Staging**: `NEXT_PUBLIC_ENV_KEY=staging`
- **Production**: `NEXT_PUBLIC_ENV_KEY=production`

### Custom Domain Setup:

If you have a custom domain, set `NEXT_PUBLIC_CUSTOM_URL` in Vercel:
```
NEXT_PUBLIC_CUSTOM_URL=https://yourdomain.com
```

### Troubleshooting:

1. **API calls failing**: Check that `NEXT_PUBLIC_ENV_KEY` is set correctly
2. **Wrong URLs**: Verify `NEXT_PUBLIC_PRODUCTION_URL` matches your Vercel app URL
3. **Database connection**: Ensure `DATABASE_URL` is correct and accessible

### Local Development:

Create `.env.local`:
```
NEXT_PUBLIC_ENV_KEY=local
DATABASE_URL=your-local-or-cloud-mongodb-url
NEXTAUTH_SECRET=your-secret-key
```

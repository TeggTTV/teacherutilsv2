# Google Analytics Setup

## Getting Your Google Analytics Measurement ID

1. **Create a Google Analytics Account**
   - Go to [Google Analytics](https://analytics.google.com/)
   - Sign in with your Google account
   - Click "Start measuring" if you don't have an account

2. **Create a Property**
   - Click "Admin" (gear icon)
   - Under "Property", click "Create Property"
   - Enter your website name (e.g., "TeacherUtils")
   - Select your reporting time zone and currency

3. **Set Up Data Stream**
   - Choose "Web" platform
   - Enter your website URL
   - Enter a stream name
   - Click "Create stream"

4. **Get Your Measurement ID**
   - After creating the stream, you'll see your "Measurement ID"
   - It will look like `G-XXXXXXXXXX`
   - Copy this ID

## Configuration

1. **Update Environment Variables**
   ```bash
   # In your .env.local file
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
   Replace `G-XXXXXXXXXX` with your actual Measurement ID.

2. **Deployment**
   Make sure to set the environment variable in your production deployment platform:
   - Vercel: Add it in Project Settings → Environment Variables
   - Netlify: Add it in Site Settings → Environment Variables
   - Other platforms: Check their documentation for environment variables

## Features Implemented

### Automatic Page Tracking
- Page views are automatically tracked when users navigate
- No additional code needed for basic page tracking

### Custom Event Tracking
The following events are automatically tracked:
- **Game Play**: When a user clicks to play a game
- **Game Save**: When a user saves/favorites a game
- **Search**: When a user searches for games (after 3+ characters)
- **User Registration**: When a new user signs up
- **User Login**: When a user logs in

### Cookie Consent
- GDPR-compliant cookie consent banner
- Users can accept or decline analytics cookies
- Analytics is disabled if user declines

## Viewing Analytics Data

1. **Real-time Data**
   - Go to Reports → Realtime in Google Analytics
   - See current active users and their activity

2. **Event Tracking**
   - Go to Reports → Engagement → Events
   - View all custom events (game_play, save_game, etc.)

3. **User Behavior**
   - Go to Reports → Engagement → Pages and screens
   - See most popular pages and user flow

## Privacy Compliance

The implementation includes:
- Cookie consent banner
- Option to decline analytics
- No personal data is sent to Google Analytics
- IP addresses are anonymized by default in GA4

## Testing

To test if Google Analytics is working:
1. Deploy your app with the GA_MEASUREMENT_ID set
2. Visit your website
3. Go to Google Analytics → Reports → Realtime
4. You should see your visit in real-time data
5. Test custom events by playing games, searching, etc.

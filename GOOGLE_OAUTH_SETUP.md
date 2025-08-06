# Google OAuth Setup with Clerk

This guide will help you set up Google OAuth authentication for your hotel booking application.

## Prerequisites

1. A Clerk account (https://clerk.com)
2. A Google Cloud Console account (https://console.cloud.google.com)

## Step 1: Set up Google OAuth in Google Cloud Console

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

### 1.2 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized redirect URIs:
   - `https://clerk.your-app.com/v1/oauth_callback`
   - `http://localhost:3000/v1/oauth_callback` (for development)
5. Note down your **Client ID** and **Client Secret**

## Step 2: Configure Clerk Dashboard

### 2.1 Set up Google OAuth Provider
1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to "User & Authentication" > "Social Connections"
3. Find "Google" and click "Configure"
4. Enter your Google OAuth credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
5. Save the configuration

### 2.2 Configure Redirect URLs
1. In your Clerk Dashboard, go to "Paths & URLs"
2. Set the following URLs:
   - **Sign in URL**: `/sign-in`
   - **Sign up URL**: `/sign-up`
   - **After sign in URL**: `/`
   - **After sign up URL**: `/`

## Step 3: Update Environment Variables

### 3.1 Client Environment Variables
Create or update your `client/.env` file:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
VITE_API_URL=http://localhost:5000/api
```

### 3.2 Server Environment Variables
Update your `server/.env` file:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hotel-booking
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
CLIENT_URL=http://localhost:5173
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
```

## Step 4: Test the Implementation

### 4.1 Start the Application
```bash
npm run dev
```

### 4.2 Test Google Sign-In
1. Navigate to `http://localhost:5173/sign-in`
2. Click "Continue with Google"
3. Complete the Google OAuth flow
4. Verify you're redirected back to the home page

## Features Implemented

### ✅ Google OAuth Authentication
- One-click Google sign-in
- Automatic user creation
- Secure token management

### ✅ User Management
- **Sign In**: `/sign-in` - Beautiful sign-in page with Google OAuth
- **Sign Up**: `/sign-up` - Registration page with Google OAuth
- **Sign Out**: Available in user menu dropdown
- **User Profile**: Accessible via user button in navbar

### ✅ UI/UX Features
- Modern, responsive design
- Loading states
- Error handling
- Smooth transitions
- Mobile-friendly interface

### ✅ Security Features
- Secure token storage
- Automatic session management
- Protected routes (when needed)
- CSRF protection (handled by Clerk)

## Troubleshooting

### Common Issues

1. **"Authentication not available" error**
   - Check if Clerk publishable key is set correctly
   - Verify the key starts with `pk_test_` or `pk_live_`

2. **Google OAuth not working**
   - Verify Google OAuth credentials in Clerk dashboard
   - Check redirect URIs are correct
   - Ensure Google+ API is enabled

3. **User not redirected after sign-in**
   - Check "After sign in URL" in Clerk dashboard
   - Verify the route exists in your app

### Debug Steps

1. **Check Console Logs**
   ```javascript
   // Add this to debug Clerk initialization
   console.log('Clerk Key:', import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
   ```

2. **Verify Environment Variables**
   ```bash
   # Check if .env file exists and has correct values
   cat client/.env
   ```

3. **Test Clerk Connection**
   ```javascript
   // Add this to test Clerk availability
   try {
     const { useClerk } = await import('@clerk/clerk-react');
     console.log('Clerk is available');
   } catch (error) {
     console.log('Clerk not available:', error);
   }
   ```

## Next Steps

### Optional Enhancements

1. **Add More OAuth Providers**
   - Facebook
   - GitHub
   - Twitter

2. **User Profile Management**
   - Profile editing
   - Avatar upload
   - Preferences

3. **Role-Based Access**
   - Admin dashboard
   - User permissions
   - Booking management

4. **Email Verification**
   - Email confirmation
   - Password reset
   - Account recovery

## Support

If you encounter any issues:

1. Check the [Clerk Documentation](https://clerk.com/docs)
2. Review [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
3. Check the browser console for error messages
4. Verify all environment variables are set correctly

## Security Notes

- Never commit your `.env` files to version control
- Use environment variables for all sensitive data
- Regularly rotate your OAuth secrets
- Monitor your application logs for suspicious activity
- Keep your dependencies updated 
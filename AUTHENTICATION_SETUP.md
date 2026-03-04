# Authentication Setup Guide

This application uses Supabase for authentication with support for multiple authentication methods.

## Supported Authentication Methods

1. **Email/Password** - Ready to use (no additional setup needed)
2. **Phone/SMS (OTP)** - Requires Twilio configuration
3. **Google OAuth** - Requires Google OAuth configuration
4. **Apple OAuth** - Requires Apple OAuth configuration

## Configuration

### 1. Email/Password Authentication
✅ Already configured and ready to use!

### 2. Phone/SMS Authentication (Optional)

To enable phone authentication:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Phone** provider
4. Configure Twilio integration:
   - Add your Twilio Account SID
   - Add your Twilio Auth Token
   - Add your Twilio phone number

### 3. Google OAuth (Optional)

To enable Google authentication:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Add authorized redirect URI: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
5. Copy the Client ID and Client Secret
6. In Supabase Dashboard:
   - Navigate to **Authentication** → **Providers**
   - Enable **Google** provider
   - Paste your Client ID and Client Secret

### 4. Apple OAuth (Optional)

To enable Apple authentication:

1. Go to [Apple Developer Console](https://developer.apple.com/)
2. Create an App ID
3. Enable "Sign in with Apple" capability
4. Create a Service ID
5. Configure Sign in with Apple:
   - Add redirect URL: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
6. Create a private key for Sign in with Apple
7. In Supabase Dashboard:
   - Navigate to **Authentication** → **Providers**
   - Enable **Apple** provider
   - Add your credentials

## How It Works

### User Flow

1. **Browsing**: Users can browse products, view details, and add items to cart without authentication
2. **Protected Actions**: When users try to:
   - Checkout
   - View their profile
   - View their orders
   - They are prompted to sign in

### Authentication Context

The app uses a comprehensive `AuthContext` that provides:
- `user`: Current authenticated user
- `profile`: User profile data from database
- `signUp()`: Create account with email/password
- `signIn()`: Sign in with email/password
- `signInWithPhone()`: Send OTP to phone
- `verifyOTP()`: Verify phone OTP
- `signInWithGoogle()`: Sign in with Google
- `signInWithApple()`: Sign in with Apple
- `signOut()`: Sign out current user
- `updateProfile()`: Update user profile

### Database Schema

The app automatically creates a user profile when someone signs up:
- User data is stored in Supabase's `auth.users` table
- Extended profile data is stored in the `profiles` table
- Profile includes: full_name, phone, avatar_url, role, address, city

### Row Level Security (RLS)

All database tables have RLS enabled:
- Users can only view and update their own profile
- Authentication is required for protected resources
- Role-based access for admin and store manager features

## Testing Authentication

1. **Sign Up**: Create a new account with email/password
2. **Sign In**: Log in with existing credentials
3. **Profile**: View and update your profile information
4. **Checkout**: Authentication is required before checkout
5. **Sign Out**: Log out from your account

## Troubleshooting

### OAuth Providers Not Working
- Verify redirect URLs are correctly configured in provider settings
- Check that provider credentials are saved in Supabase Dashboard
- Ensure providers are enabled in Authentication settings

### Phone Authentication Not Working
- Verify Twilio credentials are correct
- Check that phone provider is enabled
- Ensure phone number format is correct (E.164 format)

### Profile Not Loading
- Check browser console for errors
- Verify database migrations have been applied
- Check that RLS policies are configured correctly

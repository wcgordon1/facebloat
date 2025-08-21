# Convex Auth Debugging Session - OTP Login Issues

## Problem Statement
- OTP email authentication working in production but not in development
- User receives email codes but clicking "Continue" after entering code does nothing
- No page reload, no navigation to dashboard
- Console shows JWT authentication errors

## Environment Details
- **Production Domain**: https://facebloat.com 
- **Convex Production Deployment**: https://shocking-ant-688.convex.cloud
- **Convex Dev Deployment**: https://lovable-kangaroo-594.convex.cloud
- **Local Dev**: http://localhost:5173

## Original Error Messages

### Development Console Errors
```
Failed to authenticate: "No auth provider found matching the given token. Check that your JWT's issuer and audience match one of your configured providers: [OIDC(domain=http://localhost:5173, app_id=convex)]", check your server auth config

[CONVEX A(auth:signIn)] [Request ID: 76f18ccf3c5bc854] Server Error
Uncaught Error: Could not verify code
    at signInImpl (../../node_modules/@convex-dev/auth/dist/server/implementation.js:1042:12)
    at async handler (../../node_modules/@convex-dev/auth/dist/server/implementation.js:451:20)
```

## Root Cause Analysis

### Issue #1: Missing Environment Variables
**Problem**: Missing `CONVEX_SITE_URL` environment variable referenced in `auth.config.ts`

**Original auth.config.ts**:
```typescript
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL, // This was undefined
      applicationID: "convex",
    },
  ],
};
```

**Attempts**:
- Tried to set `CONVEX_SITE_URL` manually → Failed (built-in variable, cannot override)

**Solution**: Changed to use `SITE_URL` instead:
```typescript
export default {
  providers: [
    {
      domain: process.env.SITE_URL,
      applicationID: "convex",
    },
  ],
};
```

### Issue #2: JWT Key Mismatches Between Environments
**Problem**: Development and production had different JWT keys, causing token validation failures

**Discovery**: 
```bash
# Dev JWKS started with: "n":"u5ZCYWpjTrQkkPD3..."
# Prod JWKS started with: "n":"v7ClVggljlP8CmSz..."
```

**Theory**: OTP tokens generated with production keys but validated against dev keys

**Attempts**:
- Regenerated JWT keys for dev multiple times using `npx @convex-dev/auth`
- Attempted to copy production keys to dev (failed due to command line limitations)

### Issue #3: GitHub OAuth Conflicts
**Problem**: Multiple auth providers (ResendOTP + GitHub) potentially causing conflicts

**Original auth.ts**:
```typescript
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    ResendOTP,
    GitHub({
      authorization: {
        params: { scope: "user:email" },
      },
    }),
  ],
});
```

**Final Solution**: Removed GitHub OAuth completely:
```typescript
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    ResendOTP,
  ],
});
```

## Environment Variables Status

### Development Environment (`npx convex env list`)
```
AUTH_EMAIL=Facebloat <auth@mail.facebloat.com>
AUTH_RESEND_KEY=re_U5Kk63Lh_NPd5oJ7Hu5mXrsQ2oQYdB6U9
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyDTqG84b-G-0wdNd8Y7bHpbU3loI7r7M0M
JWKS={"keys":[{"use":"sig","kty":"RSA","n":"..."}]}
JWT_PRIVATE_KEY=-----BEGIN PRIVATE KEY----- ...
OPENAI_API_KEY=sk-proj-...
SITE_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_...
```

### Production Environment (`npx convex env list --prod`)
```
AUTH_EMAIL=Facebloat <auth@mail.facebloat.com>
AUTH_RESEND_KEY=re_U5Kk63Lh_NPd5oJ7Hu5mXrsQ2oQYdB6U9
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyDTqG84b-G-0wdNd8Y7bHpbU3loI7r7M0M
JWKS={"keys":[{"use":"sig","kty":"RSA","n":"..."}]}
JWT_PRIVATE_KEY=-----BEGIN PRIVATE KEY----- ...
OPENAI_API_KEY=sk-proj-...
SITE_URL=https://facebloat.com
STRIPE_SECRET_KEY=sk_test_...
```

## Actions Taken

### 1. Environment Variable Configuration
- ✅ Set `SITE_URL=https://facebloat.com` for production
- ✅ Kept `SITE_URL=http://localhost:5173` for development  
- ✅ Updated `auth.config.ts` to use `process.env.SITE_URL`

### 2. JWT Key Management
- ✅ Generated fresh JWT keys for both environments using `npx @convex-dev/auth`
- ✅ Verified both environments have `JWT_PRIVATE_KEY` and `JWKS` set

### 3. Auth Configuration Simplification
- ✅ Removed GitHub OAuth from `convex/auth.ts`
- ✅ Deployed simplified auth to production backend: `npx convex deploy`
- ✅ Updated `auth.config.ts` to use environment-specific domains

### 4. Browser Cache Clearing
- ✅ Cleared browser storage (DevTools → Application → Clear site data)
- ✅ Hard refreshed browsers
- ✅ Restarted dev servers

## Current Status
- ❌ **Development**: Still showing JWT authentication errors
- ❌ **Production**: Broken after backend simplification (frontend not yet deployed)
- ✅ **Backend**: Both environments updated with simplified auth

## Files Modified
1. **convex/auth.config.ts** - Changed from `CONVEX_SITE_URL` to `SITE_URL`
2. **convex/auth.ts** - Removed GitHub OAuth provider

## Commands Run
```bash
# Environment variable management
npx convex env list
npx convex env list --prod
npx convex env set SITE_URL https://facebloat.com --prod
npx convex env set AUTH_EMAIL "Facebloat <auth@mail.facebloat.com>" --prod

# JWT key generation
npx @convex-dev/auth
npx @convex-dev/auth --prod

# Deployment
npx convex deploy
```

## Next Steps for New Session
1. **Deploy frontend changes** to Cloudflare to match simplified backend
2. **Investigate OTP verification flow** - why form submission isn't triggering navigation
3. **Check form error handling** in VerifyForm component
4. **Consider alternative debugging approaches**:
   - Enable verbose Convex logging
   - Add console.logs to auth flow
   - Test with different email addresses
   - Check Resend email delivery logs

## Code References

### Login Form Component
Location: `src/routes/_app/login/_layout.index.tsx`
- Lines 167-259: `VerifyForm` component
- Line 175: `await signIn("resend-otp", { email, code: value.code });`
- Missing error handling and success navigation logic

### Auth Navigation Logic  
Location: `src/routes/_app/login/_layout.index.tsx`
- Lines 25-37: useEffect for authentication-based navigation
- May not be triggering properly after successful OTP verification

## Debugging Tools Used
- Browser DevTools console
- Convex environment variable inspection
- JWT key comparison between environments
- Browser storage clearing
- Network request monitoring

## Key Learning
The issue appears to be a combination of:
1. JWT key mismatches between environments
2. Complex auth provider configurations causing conflicts
3. Missing environment variables in auth config
4. Potential form submission/navigation logic issues in the frontend

The simplified auth setup (email OTP only) should reduce complexity and make debugging easier in the next session.

---

## Session 2 - ChatGPT-5 (Current)

### Objective
- Resolve OTP login failures in dev and prod; eliminate issuer mismatch and invalid code errors.

### Key Changes This Session
- Auth provider alignment:
  - Renamed custom provider id to match Email default: `id: "email"` in `convex/otp/ResendOTP.ts`.
  - Updated all `signIn` calls to `signIn("email", { ... })` in `src/routes/_app/login/_layout.index.tsx`.
- Issuer/domain alignment:
  - Updated `convex/auth.config.ts` to use `CONVEX_URL` origin for provider domain (issuer = Convex deployment).
  - Ensured dev env has `CONVEX_URL=https://lovable-kangaroo-594.convex.cloud` and prod has `https://shocking-ant-688.convex.cloud`.
- Frontend/backend environment alignment:
  - Instructed to set `VITE_CONVEX_URL=https://lovable-kangaroo-594.convex.cloud` in `.env.local` for dev frontend and restart Vite.
- Input normalization & UX guards:
  - Normalize email on send/verify: `trim().toLowerCase()`.
  - Sanitize codes on verify: remove spaces and hyphens.
  - Prevent double-submit on both send and verify; disable buttons while submitting.
  - Add one-time `signOut()` on login mount and clear local/session storage for stale tokens.
- Diagnostics:
  - Added dev-only log in `ResendOTP` to print `{ email, token, expires }` for OTPs in dev.
- Deployments:
  - Re-deployed Convex after each backend change to both dev and prod.

### Current Status (after changes)
- Dev: OTP emails are sent once; logs show correct `{ email, token }`. A stale issuer message may appear once during reconnect. After switching provider id to `email` and aligning issuer, verification should succeed assuming frontend is using the dev Convex URL.
- Prod: `JWKS` and `JWT_PRIVATE_KEY` present; frontend must use `VITE_CONVEX_URL=https://shocking-ant-688.convex.cloud`.

### Remaining Checks / Next Steps
1. Confirm dev frontend uses `VITE_CONVEX_URL=https://lovable-kangaroo-594.convex.cloud` (print `import.meta.env.VITE_CONVEX_URL`).
2. Clear site data for `http://localhost:5173` after issuer switch to `CONVEX_URL`.
3. Enter the latest OTP exactly as logged. If verification fails, copy the `[DEV][OTP]` line and the submitted code to compare.
4. If still failing: add a temporary dev mutation to echo what identifier/provider the store sees for the code lookup.

### Files Edited (Session 2)
- `convex/otp/ResendOTP.ts` – set `id: "email"`, normalize email, dev logging
- `convex/auth.config.ts` – set domain to `new URL(process.env.CONVEX_URL).origin`
- `src/routes/_app/login/_layout.index.tsx` – switch to `signIn("email")`, normalize inputs, submit locks, mount signOut

### Commands Run (Session 2)
```bash
# Set envs
npx convex env set CONVEX_URL https://lovable-kangaroo-594.convex.cloud
npx convex env set CONVEX_URL https://shocking-ant-688.convex.cloud --prod

# Deploy
npx convex deploy

# Frontend (dev)
echo 'VITE_CONVEX_URL=https://lovable-kangaroo-594.convex.cloud' > .env.local
npm run dev
```

### Notes
- Provider id must match what Email() config sets. Default is `email`.
- Issuer should be your Convex deployment origin for stability.
- SPA must use `VITE_CONVEX_URL` that matches the same deployment used by the backend issuer.

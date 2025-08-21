# Auth Backend Changes Log - Convex OTP Implementation

## Problem Statement
OTP email authentication was receiving codes but verification was failing. Users could enter codes but clicking "Continue" would either do nothing or return to email input screen.

## Original Working State
- **Commit**: e2b76df6188310fb8241bdb5ee8d7040092bb47d
- **Status**: Auth worked in production at this commit

## Backend Changes Made

### 1. ResendOTP Provider (convex/otp/ResendOTP.ts)

#### Initial State
```typescript
export const ResendOTP = Email({
  id: "email",
  apiKey: AUTH_RESEND_KEY,
  maxAge: 60 * 20,
  // No custom token generation
});
```

#### Changes Attempted

**Attempt 1: Added custom 5-digit token generation**
```typescript
generateVerificationToken() {
  return generateRandomString(5, alphabet("0-9"));
}
```
- **Issue**: Custom generation interfered with Convex Auth's verification mechanism
- **Result**: Tokens stored but verification still failed

**Attempt 2: Updated to @oslojs/crypto**
```typescript
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

async generateVerificationToken() {
  const random: RandomReader = {
    read(bytes) {
      crypto.getRandomValues(bytes);
    },
  };
  const alphabet = "0123456789";
  const length = 5;
  return generateRandomString(random, alphabet, length);
}
```
- **Issue**: Still interfered with built-in verification
- **Result**: Generated new tokens during verification attempts

**Attempt 3: Provider ID changes**
- Changed from `id: "email"` to `id: "resend-otp"` (per docs)
- Updated all frontend calls to match

**Final State: Removed custom token generation completely**
```typescript
export const ResendOTP = Email({
  id: "resend-otp", 
  apiKey: AUTH_RESEND_KEY,
  maxAge: 60 * 15, // 15 minutes
  // Let Convex Auth handle token generation and verification
});
```

### 2. Auth Configuration (convex/auth.ts)

#### Changes Made
```typescript
// Original
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [ResendOTP],
});

// Attempted to add isAuthenticated (failed - doesn't exist)
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [ResendOTP],
});

// Final - back to original
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [ResendOTP],
});
```

### 3. Auth Config (convex/auth.config.ts)

#### Issue: JWT Issuer Mismatch
**Problem**: Frontend connecting to different deployment than backend
```typescript
// Fixed to use CONVEX_URL dynamically
const convexUrl = process.env.CONVEX_URL;
if (!convexUrl) {
  throw new Error("Missing CONVEX_URL environment variable");
}
const domain = new URL(convexUrl).origin;

export default {
  providers: [
    {
      domain, // Now matches deployment URL
      applicationID: "convex",
    },
  ],
};
```

### 4. Schema Changes (convex/schema.ts)

#### Removed Custom OTP Table
```typescript
// Removed this custom table
customOTP: defineTable({
  identifier: v.string(),
  code: v.string(), 
  expires: v.number(),
  verified: v.optional(v.boolean()),
}).index("identifier", ["identifier"]),
```

#### User Table Structure
```typescript
// Kept authTables from Convex Auth
...authTables,
users: defineTable({
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  email: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  phone: v.optional(v.string()),
  phoneVerificationTime: v.optional(v.number()),
  isAnonymous: v.optional(v.boolean()),
}).index("email", ["email"]), // Required for Convex Auth
```

### 5. Environment Variables

#### Required Variables
```bash
# Development
AUTH_EMAIL=Facebloat <auth@mail.facebloat.com>
AUTH_RESEND_KEY=re_U5Kk63Lh_NPd5oJ7Hu5mXrsQ2oQYdB6U9
CONVEX_URL=https://lovable-kangaroo-594.convex.cloud
SITE_URL=http://localhost:5173
VITE_CONVEX_URL=https://lovable-kangaroo-594.convex.cloud

# Production  
AUTH_EMAIL=Facebloat <auth@mail.facebloat.com>
AUTH_RESEND_KEY=re_U5Kk63Lh_NPd5oJ7Hu5mXrsQ2oQYdB6U9
CONVEX_URL=https://shocking-ant-688.convex.cloud
SITE_URL=https://facebloat.com
```

## Custom OTP System Attempt (FAILED)

### Created convex/customOTP.ts
**Approach**: Bypass Convex Auth entirely with custom system
```typescript
export const sendOTP = action({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Generate 5-digit code
    // Store in custom table
    // Send via Resend
  }
});

export const verifyOTP = mutation({
  args: { email: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    // Find and verify code
    // Create user session manually
  }
});
```

**Issues**:
- Can't use fetch() in mutations (needed actions)
- Couldn't properly create user sessions
- Dynamic imports failed in Convex environment
- Abandoned this approach

## Current Status

### What's Working
✅ **OTP Generation**: Tokens are generated and sent via email
✅ **Token Storage**: Codes appear in `authVerificationCodes` table
✅ **Provider Configuration**: Using standard Convex Auth Email provider
✅ **Environment Setup**: Correct URLs and variables

### What's Not Working
❌ **Step Transition**: Frontend doesn't switch from email to code input
❌ **Verification**: When codes are entered, verification fails
❌ **Session Creation**: Users don't get authenticated after correct code

## Key Learnings

1. **Don't Override Built-in Functions**: Custom `generateVerificationToken()` broke verification
2. **Provider ID Consistency**: Must match between backend (`id: "resend-otp"`) and frontend (`signIn("resend-otp")`)
3. **JWT Issuer Critical**: Frontend and backend must use same Convex deployment URL
4. **Convex Auth Tables**: Use `authTables` from `@convex-dev/auth/server`, don't create custom
5. **Environment Variables**: `VITE_CONVEX_URL` required for frontend to match backend

## Next Steps for New Session

1. **Check Frontend Logic**: Step transition in `src/routes/_app/login/_layout.index.tsx`
2. **Verify Provider Calls**: Ensure consistent `"resend-otp"` usage
3. **Test Basic Flow**: Email send → step change → code verification
4. **Debug Console**: Add logging to track where process fails
5. **Compare Working Commit**: Reference e2b76df6188310fb8241bdb5ee8d7040092bb47d

## Files Modified

### Backend (Convex)
- `convex/auth.ts` - Provider registration
- `convex/auth.config.ts` - JWT issuer configuration  
- `convex/otp/ResendOTP.ts` - Email provider setup
- `convex/schema.ts` - Database tables and indexes
- `convex/customOTP.ts` - Created and deleted (failed approach)

### Frontend
- `src/routes/_app/login/_layout.index.tsx` - Login forms and state management
- `.env.local` - Added VITE_CONVEX_URL

### Environment
- Set correct CONVEX_URL for both dev and prod
- Ensured JWT keys match between environments

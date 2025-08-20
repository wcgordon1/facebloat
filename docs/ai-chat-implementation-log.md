# AI Chat Implementation Log

## Project: Facebloat - AI Health Assistant Integration

### Goal
Integrate AI SDK with Google Gemini to create a chat interface for health and fitness advice.

## Current Status: ❌ NOT WORKING
- Chat shows "API Error: 404" messages
- TypeScript errors preventing proper Convex deployment
- Multiple approaches attempted

## Environment Details
- **Framework**: TanStack Router + Convex backend
- **Dev Server**: http://localhost:5174/
- **Convex Dev**: https://lovable-kangaroo-594.convex.cloud
- **Convex Prod**: https://shocking-ant-688.convex.cloud
- **Google API Key**: Set in both dev and prod environments (working in other projects)

## Files Created/Modified

### 1. UI Components Created
- `src/ui/simple-chat.tsx` - Main chat component (latest version)
- `src/ui/chatbox.tsx` - Original AI SDK version (has issues)
- `src/ui/conversation.tsx` - Chat UI components
- `src/ui/message.tsx` - Message display components
- `src/ui/prompt-input.tsx` - Input form components
- `src/ui/response.tsx` - Response rendering
- `src/ui/source.tsx` - Source citations
- `src/ui/reasoning.tsx` - AI reasoning display
- `src/ui/loader.tsx` - Loading indicators

### 2. Backend Integration
- `convex/http.ts` - Added `/api/chat` endpoint (multiple versions attempted)
- `convex/env.ts` - Added `GOOGLE_GENERATIVE_AI_API_KEY`

### 3. Frontend Integration
- `src/routes/index.tsx` - Added SimpleChat component to landing page

## Approaches Attempted

### Approach 1: AI SDK with TanStack Router ❌
**Issue**: Tried to create TanStack Start server routes, but project uses TanStack Router (not Start)
- Created `src/routes/api/chat.ts` (deleted)
- Wrong framework assumption

### Approach 2: AI SDK with Convex HTTP Router ❌
**Issues**: 
- Version compatibility problems with AI SDK
- `useChat` hook API mismatches
- TypeScript errors with imports
- Enter key not working
- Streaming response parsing issues

**Code Pattern**:
```typescript
import { useChat } from '@ai-sdk/react';
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

// This approach had multiple compatibility issues
```

### Approach 3: Direct Google API Calls ⚠️ PARTIALLY WORKING
**Current Implementation** (latest attempt):

**Backend** (`convex/http.ts`):
```typescript
// Direct Google Gemini API call
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_GENERATIVE_AI_API_KEY}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })),
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.7,
    }
  })
});
```

**Frontend** (`src/ui/simple-chat.tsx`):
```typescript
const convexUrl = 'https://shocking-ant-688.convex.cloud';
const response = await fetch(`${convexUrl}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [...messages, userMessage].map(m => ({
      role: m.role,
      content: m.content,
    })),
  }),
});
```

## Current Blocking Issues

### 1. TypeScript Errors in `convex/http.ts`
```
convex/http.ts:271:21 - error TS2304: Cannot find name 'google'.
convex/http.ts:273:28 - error TS2304: Cannot find name 'streamText'.
```
**Cause**: Old AI SDK imports still referenced after switching to direct API approach

### 2. API Endpoint Returns 404 or Empty Response
- Convex HTTP route not properly deployed due to TypeScript errors
- Even when accepting requests, returns empty responses

### 3. Environment Configuration
- Google API key is set but may not be accessible in runtime
- Dev vs Prod deployment confusion

## Working Components
✅ **UI Components**: Chat interface renders correctly
✅ **Form Handling**: Enter key and button clicks work
✅ **Environment**: Google API key is valid (works in other projects)
✅ **Convex Setup**: Basic HTTP routing works (Stripe webhooks work)

## Next Steps for New Chat

### Immediate Fixes Needed:
1. **Clean up TypeScript errors in `convex/http.ts`**:
   - Remove all AI SDK imports
   - Fix undefined variable references
   - Ensure clean direct Google API implementation

2. **Test API endpoint directly**:
   ```bash
   curl https://shocking-ant-688.convex.cloud/api/chat -X POST \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"Hello"}]}'
   ```

3. **Verify Google API key access**:
   - Test direct Google API call from Convex environment
   - Add console.log for API key (first 10 chars only)

### Alternative Approaches to Consider:
1. **Simplify further**: Create a basic non-streaming implementation first
2. **Use Convex actions**: Move Google API calls to Convex actions instead of HTTP routes
3. **Client-side API calls**: Call Google API directly from frontend (less secure but for testing)

## Code Files Status
- `src/ui/simple-chat.tsx` - Latest working frontend component
- `convex/http.ts` - Has TypeScript errors, needs cleanup
- All other UI components created but may need adjustment

## Dependencies Installed
```json
{
  "ai": "5.0.19",
  "@ai-sdk/react": "2.0.19", 
  "@ai-sdk/google": "2.0.7",
  "react-dropzone": "14.2.9"
}
```

**Note**: AI SDK dependencies may not be needed if using direct API approach.

## Key Learnings
1. TanStack Router ≠ TanStack Start (important distinction)
2. AI SDK has version compatibility issues with existing setup
3. Direct Google API calls may be more reliable than AI SDK
4. Convex HTTP routes require proper TypeScript compilation
5. Environment variables need proper configuration in both dev and prod

## Recommended Fresh Start Approach
1. Start with direct Google API call (skip AI SDK entirely)
2. Get basic non-streaming chat working first
3. Add streaming later if needed
4. Focus on one environment (prod) to avoid confusion
5. Test API endpoint directly before integrating with frontend

---
*Created: 2025-08-20*
*Status: Ready for fresh chat session*

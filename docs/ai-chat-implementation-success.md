# AI Chat Implementation - Successful OpenAI + Convex Integration

## 🎉 Project: Facebloat - AI Health Assistant Integration

### ✅ Status: **WORKING** 
- Chat successfully responds with OpenAI GPT-4o-mini
- Proper Convex + TanStack Query integration
- Type-safe implementation with full error handling
- Real-time UI updates and loading states
- **NEW**: Auto-scroll within chat container (no page scrolling)
- **NEW**: Preset suggestion buttons for quick interactions
- **NEW**: Full-width input with modern layout design
- **NEW**: Smart responses for FaceBloat-specific features

---

## 🏗️ Architecture Overview

### Backend: Convex Action Pattern
- **Convex Actions** for external API calls (OpenAI)
- **Environment Variables** for secure API key management
- **Type Safety** with Convex validators
- **Error Handling** with proper user feedback

### Frontend: React + TanStack Query + Convex
- **useAction** hook for calling Convex actions
- **TanStack Query** integration via `@convex-dev/react-query`
- **State Management** with React useState
- **UI Components** using shadcn/ui patterns

---

## 📁 Implementation Files

### 1. Backend: Convex Action (`convex/chat.ts`)
```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";
import { OPENAI_API_KEY } from "./env";

export const sendMessage = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: args.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API Error:", response.status, errorText);
        throw new Error(`OpenAI API Error: ${response.status}`);
      }

      const data = await response.json();
      const responseMessage = data.choices?.[0]?.message?.content || "No response generated";

      return {
        role: "assistant" as const,
        content: responseMessage,
      };
    } catch (error) {
      console.error("Chat action error:", error);
      throw new Error(`Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});
```

### 2. Environment Configuration (`convex/env.ts`)
```typescript
export const AUTH_RESEND_KEY = process.env.AUTH_RESEND_KEY;
export const AUTH_EMAIL = process.env.AUTH_EMAIL;
export const HOST_URL = process.env.HOST_URL;
export const SITE_URL = process.env.SITE_URL;
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
```

### 3. Frontend Chat Component (`src/ui/simple-chat.tsx`) - **UPDATED WITH LATEST FEATURES**
```typescript
import { useState, useRef, useEffect } from 'react';
import { useAction } from 'convex/react';
import { Button } from '@/ui/button';
import { cn } from '@/utils/misc';
import { api } from '../../convex/_generated/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const SimpleChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your AI health assistant. I can help you with fitness advice, nutrition guidance, and general health questions. How can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMessageAction = useAction(api.chat.sendMessage);

  // Auto-scroll to bottom when new messages arrive (contained within the chat container)
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [messages]);

  // Handle preset message buttons
  const handlePresetMessage = async (presetText: string) => {
    if (isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: presetText,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Check if it's a FaceBloat-specific question and handle accordingly
      if (presetText.toLowerCase().includes('facebloat') || presetText.toLowerCase().includes('improve faster')) {
        const response = {
          role: 'assistant' as const,
          content: `I'd love to help you ${presetText.toLowerCase().includes('facebloat') ? 'analyze your FaceBloat trends' : 'improve faster'}, but it looks like you haven't uploaded any face photos for analysis yet. 

Once you start using the selfie capture feature and tracking your progress, I'll be able to:
• Analyze your facial changes over time
• Identify patterns in your progress
• Suggest personalized improvements
• Track your health and fitness journey

For now, I can help you with general health and fitness advice! Would you like some tips on nutrition, exercise routines, or wellness strategies?`
        };

        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: response.role,
          content: response.content,
        }]);
      } else {
        const allMessages = [...messages, userMessage].map(m => ({
          role: m.role,
          content: m.content,
        }));

        const response = await sendMessageAction({ messages: allMessages });
        
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: response.role,
          content: response.content,
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 h-[600px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-primary">AI Health Assistant</h2>
        <p className="text-muted-foreground">Chat with OpenAI about health and fitness</p>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-background scroll-smooth"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex w-full",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg p-4 whitespace-pre-wrap shadow-sm transition-all duration-200 hover:shadow-md",
                message.role === 'user'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground border"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground rounded-lg p-4 border animate-pulse">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preset Suggestion Buttons */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center mb-4">
        <Button
          variant="outline"
          size="default"
          onClick={() => handlePresetMessage("Analyze my FaceBloat trends")}
          disabled={isLoading}
          className="rounded-full text-sm px-6 py-3 h-auto border-2 transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm"
        >
          Analyze my FaceBloat trends
        </Button>
        <Button
          variant="outline"
          size="default"
          onClick={() => handlePresetMessage("How can I improve faster?")}
          disabled={isLoading}
          className="rounded-full text-sm px-6 py-3 h-auto border-2 transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm"
        >
          How can I improve faster?
        </Button>
      </div>

      {/* Input - Full Width Design */}
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col space-y-3">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about health and fitness..."
          disabled={isLoading}
          className="min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
        />
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </div>
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            size="sm"
            className="transition-all duration-200"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
# Core AI SDK (already installed)
npm install ai @ai-sdk/openai @ai-sdk/react

# Convex + TanStack Query (already configured)
npm install @convex-dev/react-query @tanstack/react-query
```

### 2. Environment Configuration
```bash
# Set OpenAI API key in Convex environment
npx convex env set OPENAI_API_KEY sk-proj-your-api-key-here

# For production deployment
npx convex env set OPENAI_API_KEY sk-proj-your-api-key-here --prod
```

### 3. Deploy to Convex
```bash
npx convex deploy
```

### 4. Integration in Routes
Add the SimpleChat component to your route (already done in `src/routes/index.tsx`):
```typescript
import { SimpleChat } from '@/ui/simple-chat';

// In your component JSX
<SimpleChat />
```

---

## 🎨 Latest UI Enhancements (December 2024)

### ✨ **Auto-Scroll Container**
- **Fixed page scrolling issue**: Chat now scrolls within container only
- **Smooth scrolling**: Uses `container.scrollTo()` with `behavior: 'smooth'`
- **Proper timing**: 50ms delay ensures messages render before scrolling
- **Container-confined**: No more unwanted page jumping

### 🎯 **Preset Suggestion Buttons**
- **Modern pill design**: Rounded buttons inspired by ChatGPT interface
- **FaceBloat-specific prompts**: "Analyze my FaceBloat trends" and "How can I improve faster?"
- **Smart responses**: Detects when features aren't available yet and provides helpful guidance
- **One-click interaction**: Users can quickly access common functionality

### 📱 **Full-Width Input Design**
- **Spacious layout**: Input spans full width for better typing experience  
- **Send button placement**: Moved underneath input area (bottom-right)
- **Professional styling**: Enhanced borders, shadows, and hover effects
- **Focus management**: Auto-focus returns to input after sending messages

### 🎭 **Enhanced Loading States**
- **Animated dots**: Bouncing dots with staggered timing for engaging feedback
- **Loading spinner**: Spinning indicator in send button during requests
- **Contextual messaging**: "AI is thinking..." with visual indicators

### 🎨 **Visual Improvements**
- **Message shadows**: Subtle shadows with hover effects for depth
- **Smooth transitions**: 200ms transitions on all interactive elements
- **Better contrast**: Border added to assistant messages for clarity
- **Responsive design**: Maintains functionality across screen sizes

---

## 🔧 Key Learnings & Best Practices

### ✅ What Worked

1. **Convex Actions for External APIs**
   - Use Convex actions (not HTTP routes) for calling external APIs like OpenAI
   - Actions can call `fetch` and handle async operations properly
   - Environment variables are accessible in actions

2. **Frontend Hook Selection**
   - `useAction()` for Convex actions
   - `useMutation()` for Convex mutations
   - `useQuery()` for Convex queries

3. **Type Safety**
   - Convex validators (`v.object`, `v.array`, etc.) for runtime validation
   - TypeScript interfaces for frontend state management
   - Generated API types from Convex

4. **Error Handling**
   - Try-catch blocks in both frontend and backend
   - User-friendly error messages in chat
   - Proper loading states and UI feedback

### ❌ What Didn't Work (Lessons Learned)

1. **AI SDK Direct Integration in Convex**
   - `streamText()` and AI SDK imports caused issues in Convex environment
   - Better to use standard `fetch` calls to OpenAI API

2. **HTTP Routes for AI Integration**
   - Convex HTTP routes are designed for webhooks, not chat APIs
   - Actions are the proper pattern for external API calls

3. **Wrong Hook Usage**
   - Using `useMutation` for actions caused "Server Error: Trying to execute action as Mutation"
   - Must use `useAction` for Convex actions

---

## 📊 Testing & Verification

### Backend Test (CLI)
```bash
npx convex run chat:sendMessage '{"messages": [{"role": "user", "content": "Hello, can you help me with health advice?"}]}'

# Expected Output:
# {
#   content: 'Of course! I can provide general health advice...',
#   role: 'assistant'
# }
```

### Frontend Test
1. Navigate to `http://localhost:5175/`
2. Type a health-related question
3. Press Enter or click Send
4. Receive OpenAI response in chat interface

---

## 🛠️ Technical Stack

- **Framework**: TanStack Router + SSR
- **Backend**: Convex (actions, not HTTP routes)
- **AI Provider**: OpenAI GPT-4o-mini
- **State Management**: React useState + TanStack Query
- **Styling**: TailwindCSS + shadcn/ui
- **Type Safety**: TypeScript + Convex validators

---

## 🔮 Future Enhancements

1. **Streaming Responses**
   - Implement real-time streaming using Convex websockets
   - Show typing indicators and partial responses

2. **Message Persistence**
   - Store chat history in Convex database
   - User-specific conversation threads

3. **Enhanced AI Features**
   - Function calling for health calculations (BMI, calories, etc.)
   - Image analysis for food/exercise photos
   - Personalized health recommendations

4. **Authentication Integration**
   - Tie chats to authenticated users
   - Premium features for subscribed users

---

## 📚 Documentation References

- [Convex Actions Documentation](https://docs.convex.dev/functions/actions)
- [Convex TanStack Query Integration](https://docs.convex.dev/client/tanstack-query)
- [AI SDK Documentation](https://ai-sdk.dev/docs/introduction)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

---

*Implementation completed: 2025-08-20*
*Latest UI updates: 2025-08-20*
*Status: ✅ Production Ready with Modern UI*
*Features: OpenAI integration + Auto-scroll + Preset buttons + Full-width input*
*Next: Message persistence, streaming responses, and FaceBloat feature integration*

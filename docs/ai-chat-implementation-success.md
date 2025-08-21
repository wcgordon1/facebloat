# AI Chat Implementation - Successful OpenAI + Convex Integration

## 🎉 Project: Facebloat - AI Health Assistant Integration

### ✅ Status: **WORKING** 
- Chat successfully responds with OpenAI GPT-4o-mini
- Proper Convex + TanStack Query integration
- Type-safe implementation with full error handling
- Real-time UI updates and loading states

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

### 3. Frontend Chat Component (`src/ui/simple-chat.tsx`)
```typescript
import { useState } from 'react';
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

  const sendMessageAction = useAction(api.chat.sendMessage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send all messages (including the new one) to the AI
      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendMessageAction({ messages: allMessages });
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: response.role,
        content: response.content,
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 h-[600px] flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-primary">AI Health Assistant</h2>
        <p className="text-muted-foreground">Chat with OpenAI about health and fitness</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-background">
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
                "max-w-[80%] rounded-lg p-4 whitespace-pre-wrap",
                message.role === 'user'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground rounded-lg p-4">
              <div className="animate-pulse">Thinking...</div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col space-y-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about health and fitness..."
          disabled={isLoading}
          className="min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            size="sm"
          >
            Send
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

## 📝 Markdown & Copy Features (Latest Update)

### 5. Markdown Support (`src/ui/memoized-markdown.tsx`)
```typescript
import { marked } from 'marked';
import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

// Performance-optimized markdown rendering based on AI SDK patterns
export const MemoizedMarkdown = memo(
  ({ content, id, className }: { content: string; id: string; className?: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);
    
    return (
      <div className={cn("markdown-wrapper markdown-content", className)}>
        {blocks.map((block, index) => (
          <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
        ))}
      </div>
    );
  },
);
```

**Features:**
- **Memoized rendering** prevents unnecessary re-renders during streaming
- **Custom styling** optimized for chat bubbles
- **Supports all markdown** - headers, lists, code blocks, tables, links
- **Dark/light theme** compatible with CSS variables

### 6. Copy Functionality (`src/ui/copy-button.tsx`)
```typescript
export const CopyButton = ({ text, className }: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };
  
  // Shows copy icon → checkmark + "Copied!" for 1.5s
}
```

**Features:**
- **Copy to clipboard** using modern Clipboard API
- **Visual feedback** with icon change and "Copied!" text
- **1.5 second timer** before reverting to copy icon
- **Only on AI responses** for better UX

### 7. Floating Chat Widget (`src/ui/floating-chat-widget.tsx`)
```typescript
export const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* Modal Dialog with Chat */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-[400px] h-[700px]">
          <SimpleChatWidget />
        </div>
      )}
      
      {/* Floating Button */}
      <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full">
        {/* Chat icon with notification dot */}
      </Button>
    </>
  );
};
```

**Features:**
- **Fixed position** bottom-right corner on all dashboard pages
- **Modal overlay** with backdrop blur and click-to-close
- **Responsive design** with proper z-index layering
- **Notification indicator** to attract attention
- **Compact chat interface** optimized for widget use

### Integration Points:
- **Dashboard Layout**: Added to `/_auth/dashboard/_layout.tsx`
- **All Dashboard Pages**: Widget appears on every dashboard route
- **Markdown Support**: AI responses render with full markdown formatting
- **Copy Function**: Every AI response includes copy button
- **Performance**: Memoized components prevent lag during long conversations

---

## 📚 Documentation References

- [Convex Actions Documentation](https://docs.convex.dev/functions/actions)
- [Convex TanStack Query Integration](https://docs.convex.dev/client/tanstack-query)
- [AI SDK Documentation](https://ai-sdk.dev/docs/introduction)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

---

*Implementation completed: 2025-08-20*
*Status: ✅ Production Ready*
*Next: Message persistence and streaming responses*

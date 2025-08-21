'use client';

import { useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/ui/conversation';
import { Message, MessageContent } from '@/ui/message';
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from '@/ui/prompt-input';
import { Response } from '@/ui/response';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/ui/source';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/ui/reasoning';
import { Loader } from '@/ui/loader';

const ChatBox = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatHelpers = useChat({
    // Note: API endpoint may need to be configured based on your setup
  });
  
  const { messages } = chatHelpers;
  // Fallback properties for compatibility
  const input = '';
  const handleInputChange = () => {};
  const handleSubmit = () => {};
  const isLoading = false;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        // Create a synthetic form event and submit
        const form = e.currentTarget.closest('form');
        if (form) {
          const formEvent = new Event('submit', { bubbles: true, cancelable: true });
          Object.defineProperty(formEvent, 'target', { value: form });
          Object.defineProperty(formEvent, 'currentTarget', { value: form });
          handleSubmit();
        }
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-screen">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-primary">AI Chat</h2>
          <p className="text-muted-foreground">Chat with AI models including Gemini</p>
        </div>

        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => {
              // Extract sources and content parts separately to avoid duplication
              const messageParts = (message as any).parts || [];
              const sources = messageParts.filter((part: any) => part.type === 'source-url');
              const contentParts = messageParts.filter((part: any) => part.type !== 'source-url');
              
              return (
                <div key={message.id}>
                  {/* Render sources once if they exist for assistant messages */}
                  {message.role === 'assistant' && sources.length > 0 && (
                    <Sources>
                      <SourcesTrigger count={sources.length} />
                      <SourcesContent>
                        {sources.map((part: any, i: number) => (
                          <Source
                            key={part.url || `source-${message.id}-${i}`}
                            href={part.url}
                            title={part.url}
                          />
                        ))}
                      </SourcesContent>
                    </Sources>
                  )}
                  
                  {/* Render message content */}
                  <Message from={message.role === 'system' ? 'assistant' : message.role}>
                    <MessageContent>
                      {(message as any).content ? (
                        <Response>{(message as any).content}</Response>
                      ) : (
                        contentParts.map((part: any, i: number) => {
                          switch (part.type) {
                            case 'text':
                              return (
                                <Response key={`text-${message.id}-${i}`}>
                                  {part.text}
                                </Response>
                              );
                            case 'reasoning':
                              return (
                                <Reasoning
                                  key={`reasoning-${message.id}-${i}`}
                                  className="w-full"
                                  isStreaming={isLoading}
                                >
                                  <ReasoningTrigger />
                                  <ReasoningContent>{part.text}</ReasoningContent>
                                </Reasoning>
                              );
                            default:
                              return null;
                          }
                        })
                      )}
                    </MessageContent>
                  </Message>
                </div>
              );
            })}
            {isLoading && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputTextarea
            ref={textareaRef}
            onChange={handleInputChange}
            value={input}
            placeholder="Ask me anything about health and fitness..."
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <PromptInputToolbar>
            <div className="flex-1" />
            <PromptInputSubmit 
              disabled={!input.trim() || isLoading}
              type="submit"
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatBox;

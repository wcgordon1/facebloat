import { useState, useRef, useEffect } from 'react';
import { useAction } from 'convex/react';
import { Button } from '@/ui/button';
import { cn } from '@/utils/misc';
import { api } from '../../convex/_generated/api';
import { MemoizedMarkdown } from '@/ui/memoized-markdown';
import { CopyButton } from '@/ui/copy-button';
import { useChatContext } from '@/ui/chat-context';

export const SimpleChatWidget = () => {
  const { messages, isLoading, setIsLoading, addMessage } = useChatContext();
  const [input, setInput] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMessageAction = useAction(api.chat.sendMessage);

  // Auto-scroll to bottom when new messages arrive
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
    };

    addMessage(userMessage);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send all messages (including the new one) to the AI
      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendMessageAction({ messages: allMessages });
      
      addMessage({
        id: Date.now().toString(),
        role: response.role,
        content: response.content,
      });
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto space-y-3 mb-4 scroll-smooth"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex w-full",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[85%]",
              message.role === 'user' ? "flex flex-col items-end" : "flex flex-col items-start"
            )}>
              <div
                className={cn(
                  "rounded-lg p-3 shadow-sm",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground text-sm"
                    : "bg-muted text-muted-foreground border text-sm"
                )}
              >
                {message.role === 'assistant' ? (
                  <MemoizedMarkdown 
                    content={message.content} 
                    id={message.id}
                    className="text-muted-foreground"
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
              </div>
              
              {/* Copy button for AI responses */}
              {message.role === 'assistant' && (
                <div className="mt-1 ml-1">
                  <CopyButton 
                    text={message.content}
                    className="opacity-50 hover:opacity-100 transition-opacity"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground rounded-lg p-3 border">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-xs">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about health and fitness..."
          disabled={isLoading}
          className="min-h-[60px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          rows={2}
        />
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Enter to send
          </div>
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            size="sm"
            className="text-xs px-3 py-1 h-7"
          >
            {isLoading ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

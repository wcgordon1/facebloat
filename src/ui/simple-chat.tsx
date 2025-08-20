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
      // Use smooth scrolling within the container
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    // Small delay to ensure the new message is rendered before scrolling
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [messages]);

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
      // Check if it's a Facebloat-specific question and handle accordingly
      if (presetText.toLowerCase().includes('facebloat') || presetText.toLowerCase().includes('improve faster')) {
        // For now, we'll provide a standard response since face tracking isn't set up yet
        const response = {
          role: 'assistant' as const,
          content: `I'd love to help you ${presetText.toLowerCase().includes('facebloat') ? 'analyze your Facebloat trends' : 'improve faster'}, but it looks like you haven't uploaded any face photos for analysis yet. 

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
        // For other preset messages, use the normal AI flow
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
      // Focus back to the textarea for continuous conversation
      textareaRef.current?.focus();
    }
  };

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
      // Focus back to the textarea for continuous conversation
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

      {/* Input */}
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

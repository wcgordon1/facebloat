import { useState } from 'react';
import { Button } from '@/ui/button';
import { SimpleChatWidget } from '@/ui/simple-chat-widget';
import { useChatContext } from '@/ui/chat-context';
import { cn } from '@/utils/misc';

export const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, markAsRead } = useChatContext();

  const toggleChat = () => {
    if (!isOpen) {
      markAsRead(); // Mark messages as read when opening
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat Dialog */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Chat Dialog */}
          <div className="fixed bottom-20 left-2 right-2 md:left-auto md:right-6 md:w-[400px] z-50 w-auto h-[700px] max-h-[80vh] bg-background border border-border rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="font-medium text-sm">FaceBloat Assistant</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
            
            {/* Chat Content */}
            <div className="h-[calc(100%-60px)] overflow-hidden">
              <SimpleChatWidget />
            </div>
          </div>
        </>
      )}

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <Button
          onClick={toggleChat}
          className={cn(
            "h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
            "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
            "text-white border-2 border-white/30 hover:border-white/50",
            "transform hover:scale-105 active:scale-95",
            isOpen && "scale-90 shadow-2xl"
          )}
          size="default"
        >
          {isOpen ? (
            // Close icon - better design
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            // Simple emoji chat icon
            <span className="text-3xl mt-1">💬</span>
          )}
        </Button>
        
        {/* Enhanced notification indicator */}
        {!isOpen && unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
            <span className="text-xs text-white font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </div>
        )}
      </div>
    </>
  );
};

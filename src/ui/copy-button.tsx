import { useState } from 'react';
import { Button } from '@/ui/button';
import { cn } from '@/utils/misc';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export const CopyButton = ({ text, className }: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      
      // Reset after 1.5 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors"
        disabled={isCopied}
      >
        {isCopied ? (
          // Checkmark icon
          <svg
            className="w-4 h-4 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          // Copy icon
          <svg
            className="w-4 h-4 text-muted-foreground hover:text-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </Button>
      
      {isCopied && (
        <span className="text-xs text-green-600 font-medium animate-in fade-in duration-200">
          Copied!
        </span>
      )}
    </div>
  );
};

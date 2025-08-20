import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/misc";
import { Button } from "@/ui/button";

const Conversation = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-4 overflow-hidden", className)}
    {...props}
  >
    {children}
  </div>
));
Conversation.displayName = "Conversation";

const ConversationContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto space-y-4 p-4", className)}
    {...props}
  >
    {children}
  </div>
));
ConversationContent.displayName = "ConversationContent";

const ConversationScrollButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    variant="outline"
    size="sm"
    className={cn(
      "absolute bottom-4 right-4 rounded-full p-2 shadow-lg hidden",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </Button>
));
ConversationScrollButton.displayName = "ConversationScrollButton";

export { Conversation, ConversationContent, ConversationScrollButton };

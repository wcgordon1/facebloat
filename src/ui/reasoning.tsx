import * as React from "react";
import { Brain, ChevronDown } from "lucide-react";
import { cn } from "@/utils/misc";
import { Button } from "@/ui/button";

const Reasoning = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isStreaming?: boolean;
  }
>(({ className, children, isStreaming, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  // TODO: Implement reasoning expansion functionality
  console.log(isOpen, setIsOpen); // Temporary to avoid unused variable error

  return (
    <div
      ref={ref}
      className={cn("border rounded-md", className)}
      {...props}
    >
      {children}
    </div>
  );
});
Reasoning.displayName = "Reasoning";

const ReasoningTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    size="sm"
    className={cn("w-full justify-start text-xs", className)}
    {...props}
  >
    <Brain className="h-3 w-3 mr-1" />
    Reasoning
    <ChevronDown className="h-3 w-3 ml-auto" />
  </Button>
));
ReasoningTrigger.displayName = "ReasoningTrigger";

const ReasoningContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-3 text-sm text-muted-foreground border-t", className)}
    {...props}
  >
    {children}
  </div>
));
ReasoningContent.displayName = "ReasoningContent";

export { Reasoning, ReasoningTrigger, ReasoningContent };

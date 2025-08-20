import * as React from "react";
import { Send } from "lucide-react";
import { cn } from "@/utils/misc";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

const PromptInput = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement>
>(({ className, children, ...props }, ref) => (
  <form
    ref={ref}
    className={cn("flex flex-col space-y-2", className)}
    {...props}
  >
    {children}
  </form>
));
PromptInput.displayName = "PromptInput";

const PromptInputTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
PromptInputTextarea.displayName = "PromptInputTextarea";

const PromptInputToolbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between", className)}
    {...props}
  >
    {children}
  </div>
));
PromptInputToolbar.displayName = "PromptInputToolbar";

const PromptInputTools = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center space-x-2", className)}
    {...props}
  >
    {children}
  </div>
));
PromptInputTools.displayName = "PromptInputTools";

const PromptInputButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "ghost" | "outline";
  }
>(({ className, variant = "ghost", children, ...props }, ref) => (
  <Button
    ref={ref}
    type="button"
    variant={variant}
    size="sm"
    className={cn("", className)}
    {...props}
  >
    {children}
  </Button>
));
PromptInputButton.displayName = "PromptInputButton";

const PromptInputModelSelect = Select;
const PromptInputModelSelectTrigger = SelectTrigger;
const PromptInputModelSelectValue = SelectValue;
const PromptInputModelSelectContent = SelectContent;
const PromptInputModelSelectItem = SelectItem;

const PromptInputSubmit = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    status?: "idle" | "submitted" | "streaming";
  }
>(({ className, status = "idle", disabled, ...props }, ref) => (
  <Button
    ref={ref}
    type="submit"
    size="sm"
    disabled={disabled || status === "streaming"}
    className={cn("", className)}
    {...props}
  >
    <Send className="h-4 w-4" />
  </Button>
));
PromptInputSubmit.displayName = "PromptInputSubmit";

export {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputSubmit,
};

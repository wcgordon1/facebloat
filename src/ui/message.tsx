import * as React from "react";
import { cn } from "@/utils/misc";

const Message = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    from: "user" | "assistant";
  }
>(({ className, from, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex w-full",
      from === "user" ? "justify-end" : "justify-start",
      className
    )}
    {...props}
  >
    <div
      className={cn(
        "max-w-[80%] rounded-lg p-4",
        from === "user"
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground"
      )}
    >
      {children}
    </div>
  </div>
));
Message.displayName = "Message";

const MessageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-2", className)}
    {...props}
  >
    {children}
  </div>
));
MessageContent.displayName = "MessageContent";

export { Message, MessageContent };

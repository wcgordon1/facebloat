import * as React from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/utils/misc";
import { Button } from "@/ui/button";

const Sources = React.forwardRef<
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
Sources.displayName = "Sources";

const SourcesTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    count: number;
  }
>(({ className, count, ...props }, ref) => (
  <Button
    ref={ref}
    variant="outline"
    size="sm"
    className={cn("text-xs", className)}
    {...props}
  >
    {count} source{count !== 1 ? "s" : ""}
  </Button>
));
SourcesTrigger.displayName = "SourcesTrigger";

const SourcesContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-1 border-l-2 border-muted pl-4", className)}
    {...props}
  >
    {children}
  </div>
));
SourcesContent.displayName = "SourcesContent";

const Source = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, children, href, title, ...props }, ref) => (
  <a
    ref={ref}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      "flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground",
      className
    )}
    {...props}
  >
    <ExternalLink className="h-3 w-3" />
    <span>{title || href}</span>
  </a>
));
Source.displayName = "Source";

export { Sources, SourcesTrigger, SourcesContent, Source };

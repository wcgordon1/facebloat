import * as React from "react";
import { cn } from "@/utils/misc";

const Response = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("prose prose-sm max-w-none dark:prose-invert", className)}
    {...props}
  >
    {children}
  </div>
));
Response.displayName = "Response";

export { Response };

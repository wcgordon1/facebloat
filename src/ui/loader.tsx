import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/misc";

const Loader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-center p-4", className)}
    {...props}
  >
    <Loader2 className="h-4 w-4 animate-spin" />
  </div>
));
Loader.displayName = "Loader";

export { Loader };

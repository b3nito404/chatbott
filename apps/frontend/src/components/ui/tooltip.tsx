"use client";
import * as React from "react";
import * as T from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export const TooltipProvider = T.Provider;
export const Tooltip         = T.Root;
export const TooltipTrigger  = T.Trigger;
export const TooltipContent  = React.forwardRef<React.ElementRef<typeof T.Content>, React.ComponentPropsWithoutRef<typeof T.Content>>(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <T.Content ref={ref} sideOffset={sideOffset}
      className={cn("z-50 rounded-md border border-[hsl(0,0%,25%)] bg-[hsl(0,0%,16%)] px-2.5 py-1 text-xs text-foreground shadow animate-in fade-in-0 zoom-in-95", className)}
      {...props} />
  )
);
TooltipContent.displayName = "TooltipContent";

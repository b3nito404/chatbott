"use client";
import * as React from "react";
import * as P from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";

export const ScrollArea = React.forwardRef<React.ElementRef<typeof P.Root>, React.ComponentPropsWithoutRef<typeof P.Root>>(
  ({ className, children, ...props }, ref) => (
    <P.Root ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
      <P.Viewport className="h-full w-full rounded-[inherit]">{children}</P.Viewport>
      <P.Scrollbar orientation="vertical" className="flex w-2 touch-none select-none p-[1px]">
        <P.Thumb className="relative flex-1 rounded-full bg-[hsl(0,0%,25%)]" />
      </P.Scrollbar>
    </P.Root>
  )
);
ScrollArea.displayName = "ScrollArea";

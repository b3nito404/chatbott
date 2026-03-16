"use client";

import { PanelLeft, Ghost } from "lucide-react";
import { useStore } from "@/lib/store";

export function TopBar() {
  const { sidebarOpen, toggleSidebar } = useStore();

  return (
    <div className="flex items-center justify-between h-11 px-3 shrink-0">
      {/* Show open-button only when sidebar is collapsed */}
      {!sidebarOpen ? (
        <button
          onClick={toggleSidebar}
          className="group p-1.5 rounded-lg text-[hsl(0,0%,40%)] hover:text-foreground hover:bg-[hsl(0,0%,16%)] transition-all duration-150"
        >
          <PanelLeft size={16} className="transition-transform duration-200 group-hover:scale-110" />
        </button>
      ) : (
        <div />
      )}

      <button className="group p-1.5 rounded-lg text-[hsl(0,0%,40%)] hover:text-foreground hover:bg-[hsl(0,0%,16%)] transition-all duration-150">
        <Ghost size={16} className="transition-transform duration-200 group-hover:scale-110" />
      </button>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { AlignLeft, Ghost, ChevronDown } from "lucide-react";
import { useStore } from "@/lib/store";
import { openMobileSidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

export function TopBar() {
  const sidebarOpen    = useStore(s => s.sidebarOpen);
  const toggleSidebar  = useStore(s => s.toggleSidebar);
  const incognito      = useStore(s => s.incognito);
  const toggleIncognito= useStore(s => s.toggleIncognito);
  const isMobile       = useIsMobile();

  const handleMenu = () => {
    if (isMobile) openMobileSidebar();
    else toggleSidebar();
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 shrink-0 bg-[hsl(0,0%,10%)]">
      <button
        onClick={handleMenu}
        className={cn(
          "p-1.5 rounded-lg text-[hsl(0,0%,50%)] hover:text-[#FAFAFA] hover:bg-[hsl(0,0%,16%)] transition-all",
          !isMobile && sidebarOpen && "invisible pointer-events-none"
        )}
      >
        <AlignLeft size={20} strokeWidth={2} />
      </button>

    
      <div className="flex items-center gap-1 text-[15px] font-semibold text-[#FAFAFA]">
        Clawd
        {isMobile && (
          <>
            <ChevronDown size={14} className="text-[hsl(0,0%,55%)]" />
            {incognito && (
              <span className="text-[11px] font-normal text-[hsl(0,0%,46%)] ml-1">
                · Private
              </span>
            )}
          </>
        )}
      </div>

      <button
        onClick={toggleIncognito}
        title={incognito ? "Exit incognito" : "Incognito mode"}
        className={cn(
          "p-1.5 rounded-lg transition-all",
          incognito
            ? "text-[#FAFAFA] bg-[hsl(0,0%,22%)]"
            : "text-[hsl(0,0%,45%)] hover:text-[#FAFAFA] hover:bg-[hsl(0,0%,16%)]"
        )}
      >
        <Ghost size={20} />
      </button>
    </header>
  );
}
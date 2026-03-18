"use client";

import { useEffect, useRef, useState } from "react";
import { Ghost } from "lucide-react";
import { useStore }         from "@/lib/store";
import { MessageBubble }    from "@/components/chat/MessageBubble";
import { ChatInput }        from "@/components/chat/ChatInput";
import { GeminiLogoStatic } from "@/components/layout/GeminiLogo";

const GREETINGS: Record<string, string[]> = {
  morning:   ["Good morning.", "Rise and shine.", "Morning — ready to create?", "Early bird energy.", "Fresh start."],
  afternoon: ["Good afternoon.", "Afternoon deep dive?", "What are we building today?", "Let's get into it.", "Ready when you are."],
  evening:   ["Good evening.", "Evening thoughts?", "Winding down or firing up?", "Night owl mode.", "The best ideas come at night."],
  night:     ["Burning the midnight oil?", "Still at it?", "Late-night spark.", "Night mode: on.", "The quiet hours are the best."],
};

function getGreeting(): string {
  const h    = new Date().getHours();
  const pool =
    h >= 5  && h < 12 ? GREETINGS.morning   :
    h >= 12 && h < 18 ? GREETINGS.afternoon :
    h >= 18 && h < 22 ? GREETINGS.evening   :
    GREETINGS.night;
  return pool[new Date().getMinutes() % pool.length];
}

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


function Welcome({ projectId }: { projectId?: string | null }) {
  const isMobile = useIsMobile();
  const greeting = getGreeting();

  if (isMobile) {

    return (
      <div className="flex-1 relative overflow-hidden">
       
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-36">
          <GeminiLogoStatic size={36} />
          <h1
            className="mt-5 text-center font-light text-[#FAFAFA] leading-snug"
            style={{ fontSize: "clamp(1.5rem, 7vw, 2rem)" }}
          >
            {greeting}
          </h1>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 pb-4 pt-2"
          style={{ background: "hsl(0,0%,10%)" }}
        >
          <ChatInput projectId={projectId} />
        </div>
      </div>
    );
  }


  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4">
        <div className="flex items-center gap-4 mb-9">
          <GeminiLogoStatic size={34} />
          <h1 className="text-[2.2rem] font-light tracking-tight text-foreground">{greeting}</h1>
        </div>
        <div className="w-full max-w-[680px]">
          <ChatInput projectId={projectId} />
        </div>
      </div>
    </div>
  );
}


function IncognitoScreen() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-36 text-center">
          <Ghost size={52} className="text-[hsl(0,0%,44%)] mb-6" />
          <h2 className="text-[1.1rem] font-medium text-foreground mb-3">Private conversation</h2>
          <p className="text-[13px] text-[hsl(0,0%,46%)] leading-relaxed max-w-xs">
            Incognito conversations are not saved to history, not added to memory,
            and not used to improve the model.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 pb-4 pt-2" style={{ background: "hsl(0,0%,10%)" }}>
          <ChatInput />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4 text-center">
        <Ghost size={52} className="text-[hsl(0,0%,40%)] mb-5" />
        <h2 className="text-[1.2rem] font-medium text-foreground mb-3">Private conversation</h2>
        <p className="text-[13px] text-[hsl(0,0%,46%)] max-w-xs leading-relaxed mb-2">
          Incognito conversations are not saved to history, not added to memory,
          and not used to improve the model.
        </p>
        <div className="w-full max-w-[680px] mt-8">
          <ChatInput />
        </div>
      </div>
    </div>
  );
}


export function ChatArea({ projectId = null }: { projectId?: string | null }) {
  const activeId      = useStore(s => s.activeId);
  const incognito     = useStore(s => s.incognito);
  const conversations = useStore(s => s.conversations);
  const messages      = conversations.find(c => c.id === activeId)?.messages ?? [];
  const bottomRef     = useRef<HTMLDivElement>(null);
  const isMobile      = useIsMobile();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, messages[messages.length - 1]?.content]);

  if (incognito && !messages.length) return <IncognitoScreen />;
  if (!messages.length)              return <Welcome projectId={projectId} />;

  if (isMobile) {
    return (
      <div className="flex-1 relative overflow-hidden">
       
        <div className="absolute inset-0 overflow-y-auto" style={{ paddingBottom: 160 }}>
          <div className="px-3 pt-6 flex flex-col gap-5">
            {messages.map(m => <MessageBubble key={m.id} message={m} />)}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
          <div className="h-10 w-full" style={{ background: "linear-gradient(to top, hsl(0,0%,10%) 0%, transparent 100%)" }} />
          <div className="pointer-events-auto pb-4 pt-1" style={{ background: "hsl(0,0%,10%)" }}>
            <ChatInput projectId={projectId} />
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 overflow-y-auto">
        <div className="max-w-[680px] mx-auto px-4 pt-8 flex flex-col gap-6" style={{ paddingBottom: 180 }}>
          {messages.map(m => <MessageBubble key={m.id} message={m} />)}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <div className="h-10 w-full" style={{ background: "linear-gradient(to top, hsl(0,0%,10%) 0%, transparent 100%)" }} />
        <div className="pointer-events-auto pb-5 pt-1" style={{ background: "hsl(0,0%,10%)" }}>
          <ChatInput projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
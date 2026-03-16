"use client";

import { useEffect, useRef } from "react";
import { useStore }          from "@/lib/store";
import { MessageBubble }     from "@/components/chat/MessageBubble";
import { ChatInput }         from "@/components/chat/ChatInput";
import { GeminiLogoStatic }  from "@/components/layout/GeminiLogo";

function Welcome({ projectId }: { projectId?: string | null }) {
  const h = new Date().getHours();
  const greeting = h < 12 ? "Good morning" : h < 18 ? "Afternoon" : "Good evening";

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

export function ChatArea({ projectId = null }: { projectId?: string | null }) {
  const { activeId, conversations } = useStore();
  const messages = conversations.find(c => c.id === activeId)?.messages ?? [];
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, messages[messages.length - 1]?.content]);

  if (!messages.length) return <Welcome projectId={projectId} />;

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 overflow-y-auto">
        <div
          className="max-w-[680px] mx-auto px-4 pt-8 flex flex-col gap-6"
          style={{ paddingBottom: "180px" }}
        >
          {messages.map(m => <MessageBubble key={m.id} message={m} />)}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <div
          className="h-10 w-full pointer-events-none"
          style={{ background: "linear-gradient(to top, hsl(0,0%,10%) 0%, transparent 100%)" }}
        />
        <div className="pointer-events-auto pb-5 pt-1" style={{ background: "hsl(0,0%,10%)" }}>
          <ChatInput projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
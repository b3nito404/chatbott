"use client";
import { useState, useRef, useCallback, KeyboardEvent } from "react";
import {
  ArrowUp, Square, Paperclip, Mic, ChevronDown,
  Code2, TrendingUp, GraduationCap, PenLine, Coffee,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { streamMessage, makeTitle } from "@/lib/api";
import { v4 as uuid } from "uuid";

const CHIPS = [
  { label: "Code",       Icon: Code2,        prompt: "Help me write or debug code for " },
  { label: "Strategize", Icon: TrendingUp,    prompt: "Help me strategize about "        },
  { label: "Learn",      Icon: GraduationCap, prompt: "Help me learn about "             },
  { label: "Write",      Icon: PenLine,       prompt: "Help me write "                   },
  { label: "Life stuff", Icon: Coffee,        prompt: "Give me advice on "               },
];

export function ChatInput({ projectId = null }: { projectId?: string | null }) {
  const [val, setVal] = useState("");
  const textRef  = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const {
    activeId, isStreaming,
    addMessage, patchMessage, stopStreaming,
    setTitle, setStreaming, abort, active,
    conversations,
  } = useStore();

  const resize = () => {
    if (textRef.current) {
      textRef.current.style.height = "auto";
      textRef.current.style.height = Math.min(textRef.current.scrollHeight, 200) + "px";
    }
  };

  const handleStop = () => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    abort();
  };


  const send = useCallback(async () => {
    const msg = val.trim();
    if (!msg || isStreaming) return;
    setVal("");
    if (textRef.current) textRef.current.style.height = "auto";


    let cid = activeId;

    if (!cid) {
      const id = uuid();
      useStore.setState(s => ({
        conversations: [{
          id, title: "New conversation", messages: [],
          starred: false, projectId: projectId ?? null,
          createdAt: new Date(), updatedAt: new Date(),
        }, ...s.conversations],
        activeId:    id,
        currentView: "chat",
      }));
      cid = id;
    } else {
      const current = conversations.find(c => c.id === cid);
      if (!current) {
        const id = uuid();
        useStore.setState(s => ({
          conversations: [{
            id, title: "New conversation", messages: [],
            starred: false, projectId: projectId ?? null,
            createdAt: new Date(), updatedAt: new Date(),
          }, ...s.conversations],
          activeId:    id,
          currentView: "chat",
        }));
        cid = id;
      }
    }

    const hist = (active()?.messages ?? []).map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    addMessage(cid, { role: "user", content: msg });
    if (!hist.length) setTitle(cid, makeTitle(msg));

    const aid = addMessage(cid, { role: "assistant", content: "", isStreaming: true });


    const controller = new AbortController();
    abortRef.current = controller;

    setStreaming(true, () => { controller.abort(); });
    let full = "";

    try {
      await streamMessage(msg, hist, {
        onChunk: t  => { full += t; patchMessage(cid!, aid, full); },
        onDone:  ()  => { stopStreaming(cid!, aid); setStreaming(false); abortRef.current = null; },
        onError: e   => { patchMessage(cid!, aid, ` ${e}`); stopStreaming(cid!, aid); setStreaming(false); abortRef.current = null; },
      }, cid, controller.signal);
    } catch {
      patchMessage(cid!, aid, "Impossible to reach backend (3001).");
      stopStreaming(cid!, aid);
      setStreaming(false);
      abortRef.current = null;
    }
  }, [val, isStreaming, activeId, active, conversations, addMessage, patchMessage, stopStreaming, setTitle, setStreaming, abort, projectId]);

  const canSend = val.trim().length > 0 && !isStreaming;

  return (
    <div className="w-full max-w-[680px] mx-auto px-4">
      <div className={cn(
        "relative bg-[hsl(0,0%,13%)] rounded-3xl transition-all duration-150",
        "border border-[hsl(0,0%,20%)]",
        "hover:border-[hsl(0,0%,26%)]",
        "focus-within:border-[hsl(0,0%,30%)]",
        "shadow-[0_2px_12px_rgba(0,0,0,0.4)]",
      )}>
        <textarea
          ref={textRef} value={val}
          onChange={e => { setVal(e.target.value); resize(); }}
          onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
          }}
          placeholder="How can I help you today?"
          rows={1} disabled={isStreaming}
          className="w-full bg-transparent text-foreground placeholder:text-[hsl(0,0%,36%)] resize-none outline-none text-sm leading-relaxed px-5 pt-[18px] pb-3 min-h-[56px] max-h-[200px] disabled:opacity-50"
          style={{ scrollbarWidth: "none" }}
        />
        <div className="flex items-center justify-between px-3 pb-3 pt-0.5">
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-xl text-[hsl(0,0%,40%)] hover:text-[hsl(0,0%,70%)] hover:bg-[hsl(0,0%,18%)] transition-colors">
              <Paperclip size={16} />
            </button>
            <button className="flex items-center gap-1.5 pl-1.5 pr-2 py-1.5 rounded-xl text-[hsl(0,0%,44%)] hover:text-[hsl(0,0%,70%)] hover:bg-[hsl(0,0%,18%)] transition-colors text-xs font-medium">
              Gemini Flash <ChevronDown size={12} strokeWidth={2.5} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-xl text-[hsl(0,0%,40%)] hover:text-[hsl(0,0%,70%)] hover:bg-[hsl(0,0%,18%)] transition-colors">
              <Mic size={16} />
            </button>

            {isStreaming ? (
              <button
                onClick={handleStop}
                className="p-2 rounded-xl bg-[hsl(0,0%,88%)] text-[hsl(0,0%,8%)] hover:bg-white transition-all duration-150"
                title="Stop generation"
              >
                <Square size={15} strokeWidth={0} fill="currentColor" />
              </button>
            ) : (
              
              <button
                onClick={send}
                disabled={!canSend}
                className={cn(
                  "p-2 rounded-xl transition-all duration-150",
                  canSend
                    ? "bg-[hsl(0,0%,88%)] text-[hsl(0,0%,8%)] hover:bg-white"
                    : "text-[hsl(0,0%,28%)] cursor-not-allowed"
                )}
              >
                <ArrowUp size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
        {CHIPS.map(({ label, Icon, prompt }) => (
          <button key={label}
            onClick={() => { setVal(prompt); textRef.current?.focus(); }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-sm border border-[hsl(0,0%,22%)] text-[hsl(0,0%,58%)] hover:text-[hsl(0,0%,82%)] hover:border-[hsl(0,0%,32%)] hover:bg-[hsl(0,0%,15%)] transition-all duration-150">
            <Icon size={13} strokeWidth={1.8} className="shrink-0" />
            <span className="leading-none">{label}</span>
          </button>
        ))}
      </div>

      <p className="text-center text-[11px] text-[hsl(0,0%,30%)] mt-3 pb-1 select-none">
        AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}
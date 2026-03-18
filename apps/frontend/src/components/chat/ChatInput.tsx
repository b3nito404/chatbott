"use client";

import {
  useState, useRef, useCallback, useEffect,
  KeyboardEvent,
} from "react";
import {
  ArrowUp, Square, Paperclip, ChevronDown,
  Mic, MicOff, Code2, TrendingUp,
  GraduationCap, PenLine, Coffee,
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


function useVoice(onTranscript: (t: string, final: boolean) => void) {
  const [listening, setListening]   = useState(false);
  const [supported, setSupported]   = useState(false);
  const recogRef = useRef<any>(null);

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    setSupported(true);

    const sr = new SR();
    sr.continuous     = false;
    sr.interimResults = true;
    sr.maxAlternatives = 1;
  
    sr.lang = navigator.language || "en-US";

    sr.onresult = (e: any) => {
      let interim = "";
      let finalT  = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalT += t;
        else interim += t;
      }
      if (finalT) {
        onTranscript(finalT, true);
      } else if (interim) {
        onTranscript(interim, false);
      }
    };

    sr.onerror = (e: any) => {
      console.warn("Speech error:", e.error);
      setListening(false);
    };

    sr.onend = () => setListening(false);

    recogRef.current = sr;
    return () => { try { sr.abort(); } catch {} };
  }, []); 

  const toggle = useCallback(() => {
    const sr = recogRef.current;
    if (!sr) return;
    if (listening) {
      try { sr.stop(); } catch {}
      setListening(false);
    } else {
      try { sr.start(); setListening(true); } catch (err) {
        console.warn("mic start error:", err);
      }
    }
  }, [listening]);

  return { listening, supported, toggle };
}


export function ChatInput({ projectId = null }: { projectId?: string | null }) {
  const [val, setVal] = useState("");
  const textRef  = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isMobile = useIsMobile();

  const {
    activeId, isStreaming,
    addMessage, patchMessage, stopStreaming,
    setTitle, setStreaming, abort, active,
    conversations,
  } = useStore();

  
  const { listening, supported, toggle: toggleVoice } = useVoice(
    (transcript, isFinal) => {
      setVal(transcript);
      // auto-resize
      if (textRef.current) {
        textRef.current.style.height = "auto";
        textRef.current.style.height =
          Math.min(textRef.current.scrollHeight, 200) + "px";
      }
    }
  );

  const resize = () => {
    if (textRef.current) {
      textRef.current.style.height = "auto";
      textRef.current.style.height =
        Math.min(textRef.current.scrollHeight, 200) + "px";
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    abort();
  };

  const send = useCallback(async () => {
    const msg = val.trim();
    if (!msg || isStreaming) return;
    setVal("");
    if (textRef.current) textRef.current.style.height = "auto";

    let cid = activeId;

    const ensureConv = (pid: string | null) => {
      const id = uuid();
      useStore.setState(s => ({
        conversations: [
          {
            id, title: "New conversation", messages: [],
            starred: false, projectId: pid ?? null,
            createdAt: new Date(), updatedAt: new Date(),
          },
          ...s.conversations,
        ],
        activeId: id,
        currentView: "chat",
      }));
      return id;
    };

    if (!cid) {
      cid = ensureConv(projectId);
    } else if (!conversations.find(c => c.id === cid)) {
      cid = ensureConv(projectId);
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
        onError: e   => {
          patchMessage(cid!, aid, ` ${e}`);
          stopStreaming(cid!, aid); setStreaming(false); abortRef.current = null;
        },
      }, cid, controller.signal);
    } catch {
      patchMessage(cid!, aid, "Cannot reach backend (port 3001).");
      stopStreaming(cid!, aid); setStreaming(false); abortRef.current = null;
    }
  }, [val, isStreaming, activeId, active, conversations, addMessage, patchMessage,
      stopStreaming, setTitle, setStreaming, abort, projectId]);

  const canSend = val.trim().length > 0 && !isStreaming;

  return (
    <div className={cn("w-full mx-auto", isMobile ? "px-3" : "max-w-[680px] px-4")}>
      <div className={cn(
        "relative bg-[hsl(0,0%,13%)] transition-all duration-150",
        isMobile ? "rounded-2xl" : "rounded-3xl",
        "border shadow-[0_2px_12px_rgba(0,0,0,0.4)]",
        listening
          ? "border-red-500/60 ring-2 ring-red-500/20"
          : "border-[hsl(0,0%,20%)] hover:border-[hsl(0,0%,26%)] focus-within:border-[hsl(0,0%,30%)]",
      )}>
        <textarea
          ref={textRef}
          value={val}
          onChange={e => { setVal(e.target.value); resize(); }}
          onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey && !isMobile) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={listening ? "Listening…" : "How can I help you today?"}
          rows={1}
          disabled={isStreaming}
          className={cn(
            "w-full bg-transparent text-foreground placeholder:text-[hsl(0,0%,36%)]",
            "resize-none outline-none leading-relaxed disabled:opacity-50",
            isMobile
              ? "text-[16px] px-4 pt-[14px] pb-2 min-h-[50px] max-h-[140px]"
              : "text-sm px-5 pt-[18px] pb-3 min-h-[56px] max-h-[200px]",
          )}
          style={{ scrollbarWidth: "none" }}
        />

        
        <div className="flex items-center justify-between px-3 pb-3 pt-0.5">
          <div className="flex items-center gap-1">
            <button className={cn(
              "rounded-xl text-[hsl(0,0%,40%)] hover:text-[hsl(0,0%,70%)] hover:bg-[hsl(0,0%,18%)] transition-colors",
              isMobile ? "p-2.5" : "p-2"
            )}>
              <Paperclip size={isMobile ? 18 : 16} />
            </button>
            {!isMobile && (
              <button className="flex items-center gap-1.5 pl-1.5 pr-2 py-1.5 rounded-xl text-[hsl(0,0%,44%)] hover:text-[hsl(0,0%,70%)] hover:bg-[hsl(0,0%,18%)] transition-colors text-xs font-medium">
                Clawd 1.O <ChevronDown size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
          
            <button
              onClick={toggleVoice}
              title={listening ? "Stop listening" : "Voice input"}
              className={cn(
                "transition-all duration-150",
                isMobile
                  ? "w-10 h-10 rounded-full flex items-center justify-center"
                  : "p-2 rounded-xl",
                listening
                  ? "text-red-400 bg-red-500/15 hover:bg-red-500/25 animate-pulse"
                  : isMobile
                    ? "bg-[hsl(0,0%,20%)] text-[hsl(0,0%,65%)] hover:bg-[hsl(0,0%,25%)]"
                    : "text-[hsl(0,0%,40%)] hover:text-[hsl(0,0%,70%)] hover:bg-[hsl(0,0%,18%)]"
              )}
            >
              {listening
                ? <MicOff size={isMobile ? 18 : 16} />
                : <Mic    size={isMobile ? 18 : 16} />
              }
            </button>

            
            {isStreaming ? (
              <button
                onClick={handleStop}
                className={cn(
                  "bg-[hsl(0,0%,88%)] text-[hsl(0,0%,8%)] hover:bg-white transition-all duration-150",
                  isMobile ? "w-10 h-10 rounded-full flex items-center justify-center" : "p-2 rounded-xl"
                )}
                title="Stop generation"
              >
                <Square size={isMobile ? 16 : 15} strokeWidth={0} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={send}
                disabled={!canSend}
                className={cn(
                  "transition-all duration-150",
                  isMobile
                    ? "w-10 h-10 rounded-full flex items-center justify-center"
                    : "p-2 rounded-xl",
                  canSend
                    ? "bg-[hsl(0,0%,88%)] text-[hsl(0,0%,8%)] hover:bg-white"
                    : isMobile
                      ? "bg-[hsl(0,0%,20%)] text-[hsl(0,0%,35%)]"
                      : "text-[hsl(0,0%,28%)] cursor-not-allowed"
                )}
              >
                <ArrowUp size={isMobile ? 18 : 16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      
      {!isMobile && (
        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          {CHIPS.map(({ label, Icon, prompt }) => (
            <button
              key={label}
              onClick={() => { setVal(prompt); textRef.current?.focus(); }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm border border-[hsl(0,0%,22%)] text-[hsl(0,0%,58%)] hover:text-[hsl(0,0%,82%)] hover:border-[hsl(0,0%,32%)] hover:bg-[hsl(0,0%,15%)] transition-all duration-150"
            >
              <Icon size={13} strokeWidth={1.8} className="shrink-0" />
              <span className="leading-none">{label}</span>
            </button>
          ))}
        </div>
      )}

      <p className={cn(
        "text-center text-[hsl(0,0%,30%)] mt-2 pb-1 select-none",
        isMobile ? "text-[10px]" : "text-[11px]"
      )}>
        Clawd can make mistakes. Verify important information.
      </p>
    </div>
  );
}
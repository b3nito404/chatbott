"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { Message } from "@/types";
import { GeminiLogo, GeminiLogoStatic } from "@/components/layout/GeminiLogo";

/* Inject once */
const STYLES = `
@keyframes msg-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0);   }
}
@keyframes stream-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.msg-enter   { animation: msg-in    0.22s ease-out both; }
.stream-text { animation: stream-in 0.12s ease-out both; }
`;

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1800); }}
      className="p-1.5 rounded bg-[hsl(0,0%,22%)] hover:bg-[hsl(0,0%,28%)] text-[hsl(0,0%,55%)] hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
    >
      {ok ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

/* Wrap streaming content so new chunks fade in smoothly */
function StreamContent({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  /* We keep a "committed" part and a "new" part.
     Every time content grows, the new suffix gets a fresh fade-in. */
  const prevLen = useRef(0);
  const [committed, setCommitted] = useState("");
  const [incoming, setIncoming]   = useState("");

  useEffect(() => {
    if (content.length > prevLen.current) {
      const fresh = content.slice(prevLen.current);
      prevLen.current = content.length;
      setCommitted(content.slice(0, content.length - fresh.length));
      setIncoming(fresh);
    }
  }, [content]);

  return (
    <div className="prose-chat">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
        code({ node, inline, className, children, ...props }: any) {
          const lang = /language-(\w+)/.exec(className || "")?.[1];
          const code = String(children).replace(/\n$/, "");
          if (!inline && lang) return (
            <div className="relative group my-3 rounded-lg overflow-hidden border border-[hsl(0,0%,22%)]">
              <div className="flex items-center justify-between px-4 py-1.5 bg-[hsl(0,0%,13%)] border-b border-[hsl(0,0%,22%)]">
                <span className="text-[11px] text-[hsl(0,0%,42%)] font-mono">{lang}</span>
                <CopyBtn text={code} />
              </div>
              <SyntaxHighlighter style={oneDark} language={lang} PreTag="div"
                customStyle={{ margin: 0, background: "hsl(0,0%,11%)", fontSize: "12px", borderRadius: 0 }}
                {...props}>
                {code}
              </SyntaxHighlighter>
            </div>
          );
          return <code className={className} {...props}>{children}</code>;
        },
      }}>
        {content}
      </ReactMarkdown>

      {isStreaming && (
        <span className="inline-block w-[2px] h-[13px] bg-foreground/40 ml-0.5 animate-blink align-middle rounded-full" />
      )}
    </div>
  );
}

let stylesInjected = false;

export function MessageBubble({ message }: { message: Message }) {
  /* inject CSS once */
  if (!stylesInjected && typeof document !== "undefined") {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    stylesInjected = true;
  }

  const loading = message.isStreaming && !message.content;

  /* ── User ── */
  if (message.role === "user") return (
    <div className="flex justify-end msg-enter">
      <div className="max-w-[78%] px-4 py-3 rounded-2xl rounded-tr-sm bg-[hsl(0,0%,17%)] border border-[hsl(0,0%,23%)] text-sm leading-relaxed">
        {message.content}
      </div>
    </div>
  );

  /* ── Assistant ── */
  return (
    <div className="flex gap-3 msg-enter">
      <div className="shrink-0 mt-1">
        {loading ? <GeminiLogo size={22} /> : <GeminiLogoStatic size={22} />}
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        {loading
          ? <div className="h-5" />
          : <StreamContent content={message.content} isStreaming={message.isStreaming} />
        }
      </div>
    </div>
  );
}
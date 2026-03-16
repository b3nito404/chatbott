"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Grid3x3, Plug, Wrench, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

type CustomizeTab = "home" | "skills" | "connectors";

function ToolboxIcon() {
  return (
    <svg width="90" height="80" viewBox="0 0 90 80" fill="none" className="opacity-50">
      <rect x="10" y="30" width="70" height="44" rx="4" stroke="white" strokeWidth="2.2" />
      <path d="M30 30 L30 22 Q30 16 36 16 L54 16 Q60 16 60 22 L60 30" stroke="white" strokeWidth="2.2" fill="none" />
      <path d="M36 30 L36 24" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M54 30 L54 24" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="37" y="48" width="16" height="8" rx="2" stroke="white" strokeWidth="1.8" />
    </svg>
  );
}


const FAKE_CONNECTORS = [
  { name: "Slack",         desc: "Send and read messages",          connected: false },
  { name: "Google Drive",  desc: "Access files and documents",      connected: false },
  { name: "GitHub",        desc: "Browse repos and code",           connected: false },
  { name: "Notion",        desc: "Read and write pages",            connected: false },
  { name: "Jira",          desc: "Manage issues and sprints",       connected: false },
  { name: "Linear",        desc: "Track engineering tasks",         connected: false },
];


const FAKE_SKILLS = [
  { name: "Web search",       desc: "Search the internet in real time"     },
  { name: "Code execution",   desc: "Run Python, JS and more"              },
  { name: "File analysis",    desc: "Read and interpret uploaded files"    },
  { name: "Image generation", desc: "Generate images from text prompts"   },
];

export function CustomizeView() {
  const [tab, setTab] = useState<CustomizeTab>("home");

  if (tab === "skills")     return <SkillsTab     onBack={() => setTab("home")} />;
  if (tab === "connectors") return <ConnectorsTab onBack={() => setTab("home")} />;

 
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[hsl(0,0%,10%)] px-8">
      <div className="w-full max-w-[580px]">

        
        <div className="flex justify-center mb-6">
          <ToolboxIcon />
        </div>

        <p className="text-center text-[13px] text-[hsl(0,0%,50%)] mb-10 max-w-sm mx-auto leading-relaxed">
          Customize and manage the context and tools you are giving Ora.
        </p>

       
        <div className="flex flex-col gap-0">
          <button
            onClick={() => setTab("connectors")}
            className="group flex items-center gap-5 px-5 py-5 border-b border-[hsl(0,0%,20%)] hover:bg-[hsl(0,0%,14%)] transition-colors rounded-t-xl text-left"
          >
            <div className="w-10 h-10 flex items-center justify-center shrink-0 opacity-60">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <rect x="2"  y="2"  width="11" height="11" rx="2" stroke="white" strokeWidth="1.8" />
                <rect x="17" y="2"  width="11" height="11" rx="2" stroke="white" strokeWidth="1.8" />
                <rect x="2"  y="17" width="11" height="11" rx="2" stroke="white" strokeWidth="1.8" />
                <rect x="17" y="17" width="11" height="11" rx="2" stroke="white" strokeWidth="1.8" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-foreground mb-0.5">Connect your tools</p>
              <p className="text-[12px] text-[hsl(0,0%,48%)]">Integrate with the tools you use to complete your tasks</p>
            </div>
            <ArrowRight size={16} className="text-[hsl(0,0%,36%)] group-hover:text-[hsl(0,0%,60%)] transition-colors" />
          </button>

          <button
            onClick={() => setTab("skills")}
            className="group flex items-center gap-5 px-5 py-5 hover:bg-[hsl(0,0%,14%)] transition-colors rounded-b-xl text-left"
          >
            <div className="w-10 h-10 flex items-center justify-center shrink-0 opacity-60">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <rect x="4" y="2" width="22" height="26" rx="3" stroke="white" strokeWidth="1.8" />
                <line x1="9" y1="9"  x2="21" y2="9"  stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="9" y1="14" x2="21" y2="14" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="9" y1="19" x2="17" y2="19" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                
                <path d="M20 20 L20 26 L22 24 L24 27 L25 26.5 L23 23.5 L25.5 23.5Z" stroke="white" strokeWidth="1.2" fill="none" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-foreground mb-0.5">Create new skills</p>
              <p className="text-[12px] text-[hsl(0,0%,48%)]">Teach Ora your processes, team norms, and expertise</p>
            </div>
            <ArrowRight size={16} className="text-[hsl(0,0%,36%)] group-hover:text-[hsl(0,0%,60%)] transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SkillsTab({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[hsl(0,0%,10%)]">
  
      <div className="flex items-center gap-3 px-8 py-5 border-b border-[hsl(0,0%,17%)]">
        <button onClick={onBack}
          className="p-1.5 rounded-lg text-[hsl(0,0%,42%)] hover:text-foreground hover:bg-[hsl(0,0%,16%)] transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-[15px] font-semibold text-foreground">Skills</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-[760px] w-full mx-auto">
        <p className="text-[13px] text-[hsl(0,0%,48%)] mb-6 leading-relaxed">
          Skills let Ora follow your custom instructions and workflows across all conversations.
        </p>
        <div className="flex flex-col gap-2">
          {FAKE_SKILLS.map(skill => (
            <div key={skill.name}
              className="flex items-center gap-4 p-4 bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,20%)] rounded-xl hover:border-[hsl(0,0%,28%)] transition-colors">
              <div className="w-8 h-8 rounded-lg bg-[hsl(0,0%,18%)] flex items-center justify-center shrink-0">
                <BookOpen size={14} className="text-[hsl(0,0%,52%)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground">{skill.name}</p>
                <p className="text-[12px] text-[hsl(0,0%,46%)] mt-0.5">{skill.desc}</p>
              </div>
              <Toggle />
            </div>
          ))}
        </div>

        <button className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[hsl(0,0%,26%)] text-[hsl(0,0%,50%)] text-[13px] hover:border-[hsl(0,0%,36%)] hover:text-foreground hover:bg-[hsl(0,0%,14%)] transition-all w-full justify-center">
          <span className="text-lg leading-none">+</span> Add custom skill
        </button>
      </div>
    </div>
  );
}

function ConnectorsTab({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[hsl(0,0%,10%)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-8 py-5 border-b border-[hsl(0,0%,17%)]">
        <button onClick={onBack}
          className="p-1.5 rounded-lg text-[hsl(0,0%,42%)] hover:text-foreground hover:bg-[hsl(0,0%,16%)] transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-[15px] font-semibold text-foreground">Connectors</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-[760px] w-full mx-auto">
        <p className="text-[13px] text-[hsl(0,0%,48%)] mb-6 leading-relaxed">
          Connect Ora to your favorite tools. Ora can take actions and fetch context on your behalf.<br></br>Note: This features is not available yet.          
        </p>
        <div className="flex flex-col gap-2">
          {FAKE_CONNECTORS.map(c => (
            <div key={c.name}
              className="flex items-center gap-4 p-4 bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,20%)] rounded-xl hover:border-[hsl(0,0%,28%)] transition-colors">
              <div className="w-8 h-8 rounded-lg bg-[hsl(0,0%,18%)] flex items-center justify-center shrink-0">
                <Plug size={13} className="text-[hsl(0,0%,52%)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground">{c.name}</p>
                <p className="text-[12px] text-[hsl(0,0%,46%)] mt-0.5">{c.desc}</p>
              </div>
              <button className="text-[12px] font-medium px-3 py-1.5 rounded-lg border border-[hsl(0,0%,26%)] text-[hsl(0,0%,65%)] hover:border-[hsl(0,0%,40%)] hover:text-foreground hover:bg-[hsl(0,0%,18%)] transition-all">
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Toggle() {
  const [on, setOn] = useState(true);
  return (
    <button
      onClick={() => setOn(v => !v)}
      className={cn(
        "relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0",
        on ? "bg-[hsl(220,70%,55%)]" : "bg-[hsl(0,0%,26%)]"
      )}
    >
      <span className={cn(
        "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200",
        on ? "translate-x-4" : "translate-x-0"
      )} />
    </button>
  );
}
"use client";

import { useState } from "react";
import {
  Plus, Search, ChevronDown, Folder, Trash2,
  X, ArrowRight, ArrowLeft, MessageSquare, Clock,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ChatArea } from "@/components/chat/ChatArea";
import { ChatInput } from "@/components/chat/ChatInput";
import { GeminiLogoStatic } from "@/components/layout/GeminiLogo";
import type { Project } from "@/types";


function NewProjectModal({ onClose, onCreated }: {
  onClose:   () => void;
  onCreated: (id: string) => void;
}) {
  const { createProject } = useStore();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    const id = createProject(name.trim(), desc.trim());
    onCreated(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[600px] mx-4 bg-[hsl(0,0%,14%)] border border-[hsl(0,0%,22%)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-8 pt-8 pb-6">
          <h2 className="text-[1.6rem] font-semibold text-[hsl(24,65%,58%)] mb-5">
            Create a personal project
          </h2>

          
          <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,20%)] rounded-xl p-4 mb-6">
            <p className="text-[13px] font-semibold text-foreground mb-2">How to use projects</p>
            <p className="text-[13px] text-[hsl(0,0%,60%)] leading-relaxed mb-2">
              Projects help organize your work and leverage knowledge across multiple conversations.
              Upload docs, code, and files to create themed collections that Ora can reference again and again.
            </p>
            <p className="text-[13px] text-[hsl(0,0%,60%)] leading-relaxed">
              Start by creating a memorable title and description to organize your project.
              You can always edit it later.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[13px] text-[hsl(0,0%,65%)] mb-1.5">What are you working on?</label>
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") onClose(); }}
                placeholder="Name your project"
                className="w-full bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,22%)] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-[hsl(0,0%,36%)] outline-none focus:border-[hsl(0,0%,34%)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] text-[hsl(0,0%,65%)] mb-1.5">What are you trying to achieve?</label>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                onKeyDown={e => { if (e.key === "Escape") onClose(); }}
                placeholder="Describe your project, goals, subject, etc..."
                rows={4}
                className="w-full bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,22%)] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-[hsl(0,0%,36%)] outline-none focus:border-[hsl(0,0%,34%)] transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-8 pb-7">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm text-[hsl(0,0%,60%)] hover:text-foreground hover:bg-[hsl(0,0%,18%)] transition-colors border border-[hsl(0,0%,22%)]">
            Cancel
          </button>
          <button onClick={submit} disabled={!name.trim()}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-medium transition-colors",
              name.trim()
                ? "bg-[hsl(0,0%,92%)] text-[hsl(0,0%,8%)] hover:bg-white"
                : "bg-[hsl(0,0%,20%)] text-[hsl(0,0%,38%)] cursor-not-allowed"
            )}>
            Create project
          </button>
        </div>
      </div>
    </div>
  );
}


function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  const {
    conversations, activeId, setActive, newConversation,
    deleteConversation, setView,
  } = useStore();

  const projConvs = conversations.filter(c => c.projectId === project.id);
  const [chatMode, setChatMode] = useState(false);

  const activeConv = conversations.find(c => c.id === activeId);
  const showChat   = chatMode || (activeConv?.projectId === project.id && (activeConv?.messages.length ?? 0) > 0);

  const startNewChat = () => {
    newConversation(project.id);
    setChatMode(true);
  };

  const openConv = (id: string) => {
    setActive(id);
    setChatMode(true);
  };

  if (showChat) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[hsl(0,0%,10%)]">
        <div className="flex items-center gap-3 px-6 py-3 border-b border-[hsl(0,0%,17%)]">
          <button
            onClick={() => { setChatMode(false); }}
            className="p-1.5 rounded-lg text-[hsl(0,0%,42%)] hover:text-foreground hover:bg-[hsl(0,0%,16%)] transition-colors"
          >
            <ArrowLeft size={15} />
          </button>
          <Folder size={14} className="text-[hsl(0,0%,46%)]" />
          <span className="text-[13px] text-[hsl(0,0%,65%)] truncate">{project.name}</span>
        </div>
        <ChatArea projectId={project.id} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[hsl(0,0%,10%)]">
      <div className="flex items-center gap-3 px-8 py-5 border-b border-[hsl(0,0%,17%)]">
        <button onClick={onBack}
          className="p-1.5 rounded-lg text-[hsl(0,0%,42%)] hover:text-foreground hover:bg-[hsl(0,0%,16%)] transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-[16px] font-semibold text-foreground truncate">{project.name}</h2>
          {project.description && (
            <p className="text-[12px] text-[hsl(0,0%,46%)] truncate mt-0.5">{project.description}</p>
          )}
        </div>
        <button
          onClick={startNewChat}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[hsl(0,0%,18%)] border border-[hsl(0,0%,24%)] text-[13px] text-foreground hover:bg-[hsl(0,0%,22%)] transition-colors"
        >
          <Plus size={14} strokeWidth={2.5} />
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {projConvs.length === 0 ? (
         
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 opacity-30">
              <GeminiLogoStatic size={48} />
            </div>
            <p className="text-[17px] font-medium text-foreground mb-2">No conversations yet</p>
            <p className="text-[13px] text-[hsl(0,0%,48%)] max-w-xs mb-8 leading-relaxed">
              Start a new conversation to work on <strong className="text-[hsl(0,0%,65%)]">{project.name}</strong>.
            </p>
            <button
              onClick={startNewChat}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[hsl(0,0%,28%)] text-[hsl(0,0%,75%)] text-[13px] font-medium hover:border-[hsl(0,0%,40%)] hover:text-foreground hover:bg-[hsl(0,0%,15%)] transition-all"
            >
              <MessageSquare size={14} /> Start chatting
            </button>
          </div>
        ) : (
         
          <div className="flex flex-col gap-2 max-w-[760px]">
            <p className="text-[12px] text-[hsl(0,0%,38%)] mb-1">
              {projConvs.length} conversation{projConvs.length !== 1 ? "s" : ""}
            </p>
            {projConvs.map(conv => (
              <div
                key={conv.id}
                onClick={() => openConv(conv.id)}
                className="group flex items-center gap-4 p-4 bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,20%)] rounded-xl hover:border-[hsl(0,0%,28%)] hover:bg-[hsl(0,0%,15%)] transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[hsl(0,0%,18%)] flex items-center justify-center shrink-0">
                  <MessageSquare size={14} className="text-[hsl(0,0%,52%)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">{conv.title}</p>
                  <p className="text-[11px] text-[hsl(0,0%,40%)] mt-0.5 flex items-center gap-1">
                    <Clock size={10} />
                    {conv.messages.length} message{conv.messages.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); deleteConversation(conv.id); }}
                    className="p-1.5 rounded-lg text-[hsl(0,0%,42%)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                  <ArrowRight size={14} className="text-[hsl(0,0%,38%)]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export function ProjectsView() {
  const { projects, deleteProject, setView, activeProjectId } = useStore();
  const [modalOpen, setModalOpen]  = useState(false);
  const [query, setQuery]          = useState("");
  const [openId, setOpenId]        = useState<string | null>(activeProjectId);

  const openProject = projects.find(p => p.id === openId);

  if (openProject) {
    return <ProjectDetail project={openProject} onBack={() => setOpenId(null)} />;
  }

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[hsl(0,0%,10%)]">
      <div className="flex-1 overflow-y-auto px-12 py-10 max-w-[900px] w-full mx-auto">

    
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[1.8rem] font-semibold text-foreground">Projects</h1>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(0,0%,92%)] text-[hsl(0,0%,8%)] text-sm font-medium hover:bg-white transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} /> New project
          </button>
        </div>

        <div className="flex items-center gap-2.5 bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] rounded-xl px-4 py-2.5 mb-6 focus-within:border-[hsl(0,0%,30%)] transition-colors">
          <Search size={14} className="text-[hsl(0,0%,42%)] shrink-0" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search projects..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-[hsl(0,0%,38%)] outline-none" />
          {query && (
            <button onClick={() => setQuery("")} className="text-[hsl(0,0%,42%)] hover:text-foreground transition-colors">
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex justify-end mb-4">
          <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[hsl(0,0%,22%)] text-[hsl(0,0%,55%)] text-[13px] hover:border-[hsl(0,0%,30%)] transition-colors">
            Activity <ChevronDown size={12} />
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 opacity-40">
              <svg width="80" height="70" viewBox="0 0 80 70" fill="none">
                <rect x="8"  y="6"  width="30" height="24" rx="3" stroke="white" strokeWidth="2" />
                <rect x="20" y="18" width="30" height="24" rx="3" stroke="white" strokeWidth="2" />
                <path d="M44 42 Q52 36 58 42 L62 50 Q56 58 48 56 Q40 54 44 42Z" stroke="white" strokeWidth="2" fill="none" />
                <line x1="50" y1="42" x2="50" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="54" y1="43" x2="54" y2="37" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="58" y1="44" x2="58" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[17px] font-medium text-foreground mb-2">
              {query ? "No projects found" : "Looking to start a project?"}
            </p>
            <p className="text-[13px] text-[hsl(0,0%,48%)] max-w-xs mb-8 leading-relaxed">
              {query ? "Try a different search term."
                : "Upload materials, set custom instructions, and organize conversations in one space."}
            </p>
            {!query && (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[hsl(0,0%,28%)] text-[hsl(0,0%,75%)] text-[13px] font-medium hover:border-[hsl(0,0%,40%)] hover:text-foreground hover:bg-[hsl(0,0%,15%)] transition-all"
              >
                <Plus size={14} /> New project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map(project => (
              <div
                key={project.id}
                onClick={() => setOpenId(project.id)}
                className="group flex items-center gap-4 p-4 bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,20%)] rounded-xl hover:border-[hsl(0,0%,28%)] hover:bg-[hsl(0,0%,15%)] transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-[hsl(0,0%,18%)] flex items-center justify-center shrink-0">
                  <Folder size={17} className="text-[hsl(0,0%,55%)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-foreground truncate">{project.name}</p>
                  {project.description && (
                    <p className="text-[12px] text-[hsl(0,0%,46%)] truncate mt-0.5">{project.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); deleteProject(project.id); }}
                    className="p-1.5 rounded-lg text-[hsl(0,0%,42%)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                  <ArrowRight size={14} className="text-[hsl(0,0%,38%)]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <NewProjectModal
          onClose={() => setModalOpen(false)}
          onCreated={id => setOpenId(id)}
        />
      )}
    </div>
  );
}
"use client";

import {
  useState, useRef, useEffect, useCallback,
} from "react";
import {
  Plus, Search, Settings2, MessageSquare,
  Folder, Boxes, Code2, MoreHorizontal,
  Star, Pencil, FolderPlus, Trash2, X,
  PanelLeftClose, Download, Ghost,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { Conversation } from "@/types";


const MENU_H = 172;

function isWithin(date: Date | string, days: number) {
  return Date.now() - new Date(date).getTime() < days * 86_400_000;
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


function Tip({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative group/tip">
      {children}
      <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
        px-2.5 py-1 rounded-md text-[12px] font-medium whitespace-nowrap
        bg-[hsl(0,0%,18%)] text-[#FAFAFA] border border-[hsl(0,0%,26%)] shadow-xl
        opacity-0 scale-95 group-hover/tip:opacity-100 group-hover/tip:scale-100
        transition-all duration-150 ease-out">
        {label}
        <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[hsl(0,0%,26%)]" />
      </div>
    </div>
  );
}


function SearchModal({ onClose }: { onClose: () => void }) {
  const conversations = useStore(s => s.conversations);
  const setActive     = useStore(s => s.setActive);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const filtered = conversations
    .filter(c => !c.projectId)
    .filter(c => c.title.toLowerCase().includes(query.toLowerCase()));

  const groups: [string, typeof filtered][] = [
    ["Today",      filtered.filter(c =>  isWithin(c.updatedAt, 1))],
    ["Past week",  filtered.filter(c => !isWithin(c.updatedAt, 1) && isWithin(c.updatedAt, 7))],
    ["Past month", filtered.filter(c => !isWithin(c.updatedAt, 7) && isWithin(c.updatedAt, 30))],
    ["Older",      filtered.filter(c => !isWithin(c.updatedAt, 30))],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[9vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
      <div className="relative w-full max-w-[620px] mx-4 bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[hsl(0,0%,20%)]">
          <Search size={14} className="text-[hsl(0,0%,42%)] shrink-0" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search chats"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-[hsl(0,0%,38%)] outline-none" />
          <button onClick={onClose} className="p-1 rounded-lg text-[hsl(0,0%,36%)] hover:text-foreground hover:bg-[hsl(0,0%,20%)] transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[440px]">
          {filtered.length === 0
            ? <p className="text-center text-sm text-[hsl(0,0%,38%)] py-10">No results</p>
            : groups.map(([label, items]) => items.length === 0 ? null : (
              <div key={label}>
                <p className="text-[11px] text-[hsl(0,0%,36%)] uppercase tracking-wider font-medium px-5 pt-3 pb-1">{label}</p>
                {items.map(conv => (
                  <button key={conv.id} onClick={() => { setActive(conv.id); onClose(); }}
                    className="group w-full flex items-center gap-3 px-5 py-2.5 hover:bg-[hsl(0,0%,18%)] transition-colors text-left">
                    <MessageSquare size={13} className="text-[hsl(0,0%,40%)] shrink-0" />
                    <span className="text-[13px] text-[hsl(0,0%,76%)] truncate flex-1">{conv.title}</span>
                    <span className="text-[11px] text-[hsl(0,0%,36%)] shrink-0">{label}</span>
                  </button>
                ))}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

function RenameModal({ convId, onClose }: { convId: string; onClose: () => void }) {
  const conv   = useStore(s => s.conversations.find(c => c.id === convId));
  const rename = useStore(s => s.renameConversation);
  const [val, setVal] = useState(conv?.title ?? "");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => { ref.current?.focus(); ref.current?.select(); }, 60);
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const save = () => { if (val.trim()) rename(convId, val.trim()); onClose(); };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-[400px] mx-4 bg-[hsl(0,0%,15%)] border border-[hsl(0,0%,24%)] rounded-2xl shadow-2xl p-6"
        onClick={e => e.stopPropagation()}>
        <h2 className="text-[15px] font-semibold text-foreground mb-4">Rename chat</h2>
        <input ref={ref} value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") save(); }}
          className="w-full bg-transparent border border-[hsl(220,80%,55%)] rounded-xl px-3 py-2.5 text-sm text-foreground outline-none ring-2 ring-[hsl(220,80%,55%)]/25" />
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-[hsl(0,0%,65%)] hover:text-foreground hover:bg-[hsl(0,0%,20%)] transition-colors">Cancel</button>
          <button onClick={save}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[hsl(0,0%,92%)] text-[hsl(0,0%,8%)] hover:bg-white transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
}

function AddToProjectModal({ convId, onClose }: { convId: string; onClose: () => void }) {
  const projects = useStore(s => s.projects);
  const assign   = (projectId: string) => {
    useStore.setState(s => ({
      conversations: s.conversations.map(c =>
        c.id === convId ? { ...c, projectId } : c
      ),
    }));
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-[380px] mx-4 bg-[hsl(0,0%,15%)] border border-[hsl(0,0%,24%)] rounded-2xl shadow-2xl p-6"
        onClick={e => e.stopPropagation()}>
        <h2 className="text-[15px] font-semibold text-foreground mb-4">Add to project</h2>
        {projects.length === 0
          ? <p className="text-[13px] text-[hsl(0,0%,46%)] text-center py-4">No projects yet. Create one in Projects.</p>
          : <div className="flex flex-col gap-1">
              {projects.map(p => (
                <button key={p.id} onClick={() => assign(p.id)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-[hsl(0,0%,72%)] hover:bg-[hsl(0,0%,20%)] hover:text-foreground transition-colors text-left">
                  <Folder size={14} className="shrink-0 text-[hsl(0,0%,50%)]" />
                  {p.name}
                </button>
              ))}
            </div>
        }
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-[hsl(0,0%,65%)] hover:text-foreground hover:bg-[hsl(0,0%,20%)] transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

interface CtxPos { convId: string; x: number; y: number }

function ContextMenu({ pos, onClose, onRename, onAddToProject }: {
  pos:            CtxPos;
  onClose:        () => void;
  onRename:       () => void;
  onAddToProject: () => void;
}) {

  const isStarred = useStore(s => {
    const c = s.conversations.find(x => x.id === pos.convId);
    return c?.starred ?? false;
  });
  const toggleStar      = useStore(s => s.toggleStar);
  const deleteConv      = useStore(s => s.deleteConversation);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const down = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const t = setTimeout(() => {
      document.addEventListener("mousedown", down);
      document.addEventListener("keydown", key);
    }, 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
    };
  }, [onClose]);

  const items = [
    {
      Icon: Star,
      label: isStarred ? "Unstar" : "Star",
      fn: () => { toggleStar(pos.convId); onClose(); },
      danger: false,
    },
    {
      Icon: Pencil,
      label: "Rename",
      fn: () => { onRename(); onClose(); },
      danger: false,
    },
    {
      Icon: FolderPlus,
      label: "Add to project",
      fn: () => { onAddToProject(); onClose(); },
      danger: false,
    },
    {
      Icon: Trash2,
      label: "Delete",
      fn: () => { deleteConv(pos.convId); onClose(); },
      danger: true,
    },
  ];

  return (
    <div
      ref={ref}
      style={{ position: "fixed", top: pos.y, left: pos.x, zIndex: 350 }}
      className="w-48 bg-[hsl(0,0%,14%)] border border-[hsl(0,0%,22%)] rounded-xl shadow-2xl py-1"
    >
      {items.map(({ Icon, label, fn, danger }) => (
        <button
          key={label}
          onMouseDown={e => { e.stopPropagation(); fn(); }}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors text-left",
            danger
              ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
              : "text-[hsl(0,0%,72%)] hover:bg-[hsl(0,0%,20%)] hover:text-foreground"
          )}
        >
          <Icon size={13} className="shrink-0" />{label}
        </button>
      ))}
    </div>
  );
}

function NavBtn({ icon: Icon, label, onClick, active }: {
  icon: React.ElementType; label: string; onClick?: () => void; active?: boolean;
}) {
  return (
    <button onClick={onClick}
      className={cn(
        "group flex items-center gap-3 w-full px-3 py-[7px] rounded-lg transition-all duration-150 text-[13px] text-left",
        active
          ? "bg-[hsl(0,0%,18%)] text-[#FAFAFA]"
          : "text-[hsl(0,0%,62%)] hover:text-[#FAFAFA] hover:bg-[hsl(0,0%,15%)]"
      )}>
      <Icon size={17} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
      <span>{label}</span>
    </button>
  );
}


function ConvRow({ conv, activeId, onSelect, onCtx }: {
  conv: Conversation; activeId: string | null;
  onSelect: (id: string) => void;
  onCtx: (e: React.MouseEvent, id: string) => void;
}) {
  return (
    <div
      onClick={() => onSelect(conv.id)}
      className={cn(
        "group relative flex items-center cursor-pointer",
        "mx-1 px-3 py-[5px] rounded-lg mb-[1px] transition-colors duration-100",
        activeId === conv.id
          ? "bg-[hsl(0,0%,17%)] text-[#FAFAFA]"
          : "text-[hsl(0,0%,62%)] hover:bg-[hsl(0,0%,14%)] hover:text-[hsl(0,0%,88%)]"
      )}
    >
      {conv.starred && (
        <Star size={10} className="shrink-0 mr-1.5 text-[hsl(40,80%,60%)] fill-[hsl(40,80%,60%)]" />
      )}
      <span className="block text-[13px] font-normal leading-[1.4] truncate w-full pr-5">
        {conv.title}
      </span>
      <button
        onMouseDown={e => { e.stopPropagation(); onCtx(e, conv.id); }}
        className={cn(
          "absolute right-1.5 w-5 h-5 flex items-center justify-center rounded-md",
          "opacity-0 group-hover:opacity-100",
          "text-[hsl(0,0%,46%)] hover:text-[hsl(0,0%,82%)] hover:bg-[hsl(0,0%,23%)]",
          "transition-all duration-100",
        )}
      >
        <MoreHorizontal size={13} />
      </button>
    </div>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const conversations  = useStore(s => s.conversations);
  const activeId       = useStore(s => s.activeId);
  const currentView    = useStore(s => s.currentView);
  const guestNumber    = useStore(s => s.guestNumber);
  const incognito      = useStore(s => s.incognito);
  const newConversation= useStore(s => s.newConversation);
  const setActive      = useStore(s => s.setActive);
  const toggleSidebar  = useStore(s => s.toggleSidebar);
  const setView        = useStore(s => s.setView);
  const toggleIncognito= useStore(s => s.toggleIncognito);

  const [searchOpen,     setSearchOpen]     = useState(false);
  const [ctxPos,         setCtxPos]         = useState<CtxPos | null>(null);
  const [renameId,       setRenameId]       = useState<string | null>(null);
  const [addToProjectId, setAddToProjectId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const openCtx = (e: React.MouseEvent, convId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const y = spaceBelow < MENU_H + 16 ? rect.top - MENU_H : rect.bottom + 2;
    setCtxPos({ convId, x: isMobile ? Math.min(rect.right + 4, window.innerWidth - 200) : rect.right + 4, y });
  };

  const navTo = (view: any) => {
    setView(view);
    onClose?.();
  };

  const sidebarConvs = conversations.filter(c => !c.projectId);
  const starred = sidebarConvs.filter(c => c.starred);
  const recents  = sidebarConvs.filter(c => !c.starred);

  return (
    <>
      <div className="flex flex-col w-full h-full bg-[hsl(0,0%,9%)] select-none overflow-hidden">

        <div className="flex items-center justify-between px-4 pt-[14px] pb-2 shrink-0">
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#FAFAFA]">Clawd</span>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleIncognito}
              title="Incognito mode"
              className={cn(
                "p-1.5 rounded-lg transition-all duration-150",
                incognito
                  ? "text-[#FAFAFA] bg-[hsl(0,0%,22%)]"
                  : "text-[hsl(0,0%,38%)] hover:text-[#FAFAFA] hover:bg-[hsl(0,0%,16%)]"
              )}>
              <Ghost size={15} />
            </button>
            {isMobile ? (
              <button onClick={onClose}
                className="p-1.5 rounded-lg text-[hsl(0,0%,38%)] hover:text-[#FAFAFA] hover:bg-[hsl(0,0%,16%)] transition-all duration-150">
                <X size={15} />
              </button>
            ) : (
              <button onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-[hsl(0,0%,38%)] hover:text-[#FAFAFA] hover:bg-[hsl(0,0%,16%)] transition-all duration-150">
                <PanelLeftClose size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-px px-2 pb-1 shrink-0">
          <NavBtn icon={Plus}      label="New chat"  onClick={() => { newConversation(); onClose?.(); }} />
          <NavBtn icon={Search}    label="Search"    onClick={() => setSearchOpen(true)} />
          <NavBtn icon={Settings2} label="Customize" onClick={() => navTo("customize")} active={currentView === "customize"} />
        </div>

        <div className="mx-3 h-px bg-[hsl(0,0%,17%)] my-1.5 shrink-0" />

        <div className="flex flex-col gap-px px-2 pb-1 shrink-0">
          <NavBtn icon={MessageSquare} label="Chats"     onClick={() => navTo("chat")}      active={currentView === "chat"} />
          <NavBtn icon={Folder}        label="Projects"  onClick={() => navTo("projects")}  active={currentView === "projects" || currentView === "project-detail"} />
          <NavBtn icon={Boxes}         label="Artifacts" onClick={() => navTo("artifacts")} active={currentView === "artifacts"} />
          <NavBtn icon={Code2}         label="Code"      onClick={() => navTo("code")}       active={currentView === "code"} />
        </div>

        {starred.length > 0 && (
          <div className="mt-2 px-2 shrink-0">
            <p className="text-[11px] text-[hsl(0,0%,36%)] px-3 pb-1 font-medium tracking-wide">Starred</p>
            {starred.map(conv => (
              <ConvRow key={conv.id} conv={conv} activeId={activeId}
                onSelect={id => { setActive(id); onClose?.(); }}
                onCtx={openCtx} />
            ))}
          </div>
        )}

        {recents.length > 0 && (
          <div className={cn("flex-1 overflow-hidden flex flex-col px-2 min-h-0", starred.length > 0 ? "mt-2" : "mt-3")}>
            <p className="text-[11px] text-[hsl(0,0%,36%)] px-3 pb-1 font-medium tracking-wide shrink-0">Recents</p>
            <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: "none" }}>
              {recents.map(conv => (
                <ConvRow key={conv.id} conv={conv} activeId={activeId}
                  onSelect={id => { setActive(id); onClose?.(); }}
                  onCtx={openCtx} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto px-2 pb-3 pt-2 border-t border-[hsl(0,0%,16%)] shrink-0">
          <button className="group flex items-center gap-2.5 w-full px-3 py-2 rounded-lg hover:bg-[hsl(0,0%,15%)] transition-all duration-150">
            <div className="w-[28px] h-[28px] rounded-full bg-[#FAFAFA] flex items-center justify-center font-bold text-[hsl(0,0%,10%)] text-xs shrink-0">G</div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-[13px] text-[#FAFAFA] font-medium leading-tight">Guest {guestNumber}</span>
            </div>
            {/*<Download size={13} className="ml-auto text-[hsl(0,0%,36%)] group-hover:text-[hsl(0,0%,55%)] transition-colors" />*/}
          </button>
        </div>
      </div>

      {searchOpen     && <SearchModal      onClose={() => setSearchOpen(false)} />}
      {renameId       && <RenameModal      convId={renameId}       onClose={() => setRenameId(null)} />}
      {addToProjectId && <AddToProjectModal convId={addToProjectId} onClose={() => setAddToProjectId(null)} />}

      {ctxPos && (
        <ContextMenu
          pos={ctxPos}
          onClose={() => setCtxPos(null)}
          onRename={() => setRenameId(ctxPos.convId)}
          onAddToProject={() => setAddToProjectId(ctxPos.convId)}
        />
      )}
    </>
  );
}
function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const drawerRef  = useRef<HTMLDivElement>(null);
  const startX     = useRef(0);
  const currentX   = useRef(0);
  const dragging   = useRef(false);

  
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current   = e.touches[0].clientX;
    currentX.current = 0;
    dragging.current = true;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - startX.current;
    if (dx < 0 && drawerRef.current) {
      drawerRef.current.style.transform = `translateX(${dx}px)`;
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    dragging.current = false;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (drawerRef.current) drawerRef.current.style.transform = "";
    if (dx < -80) onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        ref={drawerRef}
        className="relative w-[280px] h-full transition-transform duration-200"
        onClick={e => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ willChange: "transform" }}
      >
        <SidebarContent onClose={onClose} />
      </div>
    </div>
  );
}


export function Sidebar() {
  const sidebarOpen = useStore(s => s.sidebarOpen);
  const isMobile    = useIsMobile();

  if (isMobile) {
    return <MobileDrawerPortal />;
  }
  if (!sidebarOpen) return <CollapsedSidebar />;

  return (
    <div className="w-[240px] h-full shrink-0 border-r border-[hsl(0,0%,16%)]">
      <SidebarContent />
    </div>
  );
}

let _setMobileOpen: ((v: boolean) => void) | null = null;

export function openMobileSidebar() { _setMobileOpen?.(true); }

function MobileDrawerPortal() {
  const [open, setOpen] = useState(false);
  _setMobileOpen = setOpen;
  return <MobileDrawer open={open} onClose={() => setOpen(false)} />;
}


function CollapsedSidebar() {
  const newConversation = useStore(s => s.newConversation);
  const setView         = useStore(s => s.setView);
  const toggleSidebar   = useStore(s => s.toggleSidebar);
  const toggleIncognito = useStore(s => s.toggleIncognito);
  const incognito       = useStore(s => s.incognito);

  return (
    <div className="flex flex-col items-center w-[52px] h-full bg-[hsl(0,0%,9%)] border-r border-[hsl(0,0%,16%)] py-3 gap-0.5 shrink-0">
      {([
        { Icon: Plus,          tip: "New chat",   fn: () => newConversation() },
        { Icon: Search,        tip: "Search" },
        { Icon: Settings2,     tip: "Customize",  fn: () => setView("customize") },
        { Icon: MessageSquare, tip: "Chats",      fn: () => setView("chat") },
        { Icon: Folder,        tip: "Projects",   fn: () => setView("projects") },
        { Icon: Boxes,         tip: "Artifacts",  fn: () => setView("artifacts") },
        { Icon: Code2,         tip: "Code",       fn: () => setView("code") },
      ] as { Icon: React.ElementType; tip: string; fn?: () => void }[]).map(({ Icon, tip, fn }) => (
        <Tip key={tip} label={tip}>
          <button onClick={fn}
            className="group w-9 h-9 flex items-center justify-center rounded-lg text-[hsl(0,0%,55%)] hover:text-[#FAFAFA] hover:bg-[hsl(0,0%,16%)] transition-all duration-150">
            <Icon size={18} className="transition-transform duration-200 group-hover:scale-110" />
          </button>
        </Tip>
      ))}
      <div className="flex-1" />
      <Tip label="Incognito">
        <button onClick={toggleIncognito}
          className={cn("w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150",
            incognito ? "text-[#FAFAFA] bg-[hsl(0,0%,22%)]" : "text-[hsl(0,0%,55%)] hover:text-[#FAFAFA] hover:bg-[hsl(0,0%,16%)]")}>
          <Ghost size={17} />
        </button>
      </Tip>
      <button onClick={toggleSidebar}
        className="group w-9 h-9 flex items-center justify-center rounded-lg text-[hsl(0,0%,55%)] hover:text-[#FAFAFA] hover:bg-[hsl(0,0%,16%)] transition-all duration-150 mt-1">
        <PanelLeftClose size={17} className="rotate-180 transition-transform duration-200 group-hover:scale-110" />
      </button>
      <div className="w-[28px] h-[28px] rounded-full bg-[#FAFAFA] flex items-center justify-center font-bold text-[hsl(0,0%,10%)] text-xs">G</div>
    </div>
  );
}
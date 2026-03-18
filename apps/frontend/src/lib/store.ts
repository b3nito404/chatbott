import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { Conversation, Message, Project } from '@/types';

export type AppView = 'chat' | 'projects' | 'project-detail' | 'customize' | 'artifacts' | 'code';

interface Store {
  conversations:      Conversation[];
  activeId:           string | null;
  isStreaming:        boolean;
  abortFn:            (() => void) | null;
  sidebarOpen:        boolean;
  currentView:        AppView;
  activeProjectId:    string | null;
  projects:           Project[];
  guestNumber:        number;
  incognito:          boolean;

  newConversation:    (projectId?: string | null) => string;
  setActive:          (id: string | null) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  toggleStar:         (id: string) => void;
  addMessage:         (cid: string, m: Omit<Message, 'id' | 'createdAt'>) => string;
  patchMessage:       (cid: string, mid: string, content: string) => void;
  stopStreaming:      (cid: string, mid: string) => void;
  setTitle:           (id: string, title: string) => void;
  setStreaming:       (v: boolean, abortFn?: (() => void) | null) => void;
  abort:              () => void;
  toggleSidebar:      () => void;
  setView:            (v: AppView, projectId?: string | null) => void;
  active:             () => Conversation | null;
  createProject:      (name: string, description: string) => string;
  deleteProject:      (id: string) => void;
  renameProject:      (id: string, name: string) => void;
  toggleIncognito:    () => void;
}

function getGuestNumber(): number {
  if (typeof window === 'undefined') return 1000;
  const key = 'chatbott_guest_n';
  const ex  = localStorage.getItem(key);
  if (ex) return parseInt(ex, 10);
  const n = Math.floor(Math.random() * 9000) + 1000;
  localStorage.setItem(key, String(n));
  return n;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      conversations:   [],
      activeId:        null,
      isStreaming:     false,
      abortFn:         null,
      sidebarOpen:     true,
      currentView:     'chat',
      activeProjectId: null,
      projects:        [],
      guestNumber:     typeof window !== 'undefined' ? getGuestNumber() : 1000,
      incognito:       false,

      newConversation: (projectId = null) => {
        const s = get();
        const current = s.conversations.find(c => c.id === s.activeId);
        if (current && current.messages.length === 0 && current.projectId === projectId) {
          set({ currentView: 'chat' }); return current.id;
        }
        if (!s.activeId && !projectId) { set({ currentView: 'chat' }); return ''; }
        const id = uuid();
        set(prev => ({
          conversations: [
            { id, title: 'New conversation', messages: [], starred: false,
              projectId: projectId ?? null, createdAt: new Date(), updatedAt: new Date() },
            ...prev.conversations,
          ],
          activeId: id, currentView: 'chat', activeProjectId: projectId ?? null,
        }));
        return id;
      },

      setActive: (id) => set({ activeId: id, currentView: 'chat' }),

      // ── FIXED: pure functional update, no stale closure ──
      deleteConversation: (id) => {
        set(s => {
          const next = s.conversations.filter(c => c.id !== id);
          return {
            conversations: next,
            activeId: s.activeId === id
              ? (next.find(c => !c.projectId)?.id ?? null)
              : s.activeId,
          };
        });
      },

      renameConversation: (id, title) => {
        set(s => ({
          conversations: s.conversations.map(c =>
            c.id === id ? { ...c, title } : c
          ),
        }));
      },

      toggleStar: (id) => {
        set(s => ({
          conversations: s.conversations.map(c =>
            c.id === id ? { ...c, starred: !c.starred } : c
          ),
        }));
      },

      addMessage: (cid, m) => {
        const mid = uuid();
        set(s => ({
          conversations: s.conversations.map(c =>
            c.id !== cid ? c : {
              ...c, updatedAt: new Date(),
              messages: [...c.messages, { ...m, id: mid, createdAt: new Date() }],
            }
          ),
        }));
        return mid;
      },

      patchMessage: (cid, mid, content) => set(s => ({
        conversations: s.conversations.map(c =>
          c.id !== cid ? c : {
            ...c,
            messages: c.messages.map(m => m.id !== mid ? m : { ...m, content }),
          }
        ),
      })),

      stopStreaming: (cid, mid) => set(s => ({
        conversations: s.conversations.map(c =>
          c.id !== cid ? c : {
            ...c,
            messages: c.messages.map(m => m.id !== mid ? m : { ...m, isStreaming: false }),
          }
        ),
      })),

      setTitle: (id, title) => set(s => ({
        conversations: s.conversations.map(c =>
          c.id === id ? { ...c, title } : c
        ),
      })),

      setStreaming: (v, abortFn = null) => set({ isStreaming: v, abortFn: v ? abortFn : null }),

      abort: () => {
        const { abortFn } = get();
        if (abortFn) abortFn();
        set({ isStreaming: false, abortFn: null });
      },

      toggleSidebar:  () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
      toggleIncognito: () => set(s => ({ incognito: !s.incognito, activeId: null })),
      setView: (v, projectId = null) => set({ currentView: v, activeProjectId: projectId }),
      active: () => { const s = get(); return s.conversations.find(c => c.id === s.activeId) ?? null; },

      createProject: (name, description) => {
        const id = uuid();
        set(s => ({ projects: [{ id, name, description, createdAt: new Date() }, ...s.projects] }));
        return id;
      },
      deleteProject: (id) => set(s => ({
        projects: s.projects.filter(p => p.id !== id),
        conversations: s.conversations.filter(c => c.projectId !== id),
      })),
      renameProject: (id, name) => set(s => ({
        projects: s.projects.map(p => p.id === id ? { ...p, name } : p),
      })),
    }),
    {
      name: 'chatbott',
      partialize: s => ({
        conversations:   s.conversations,
        sidebarOpen:     s.sidebarOpen,
        projects:        s.projects,
        guestNumber:     s.guestNumber,
        activeProjectId: s.activeProjectId,
      }),
    }
  )
);
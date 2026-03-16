export interface Message {
  id:          string;
  role:        "user" | "assistant";
  content:     string;
  isStreaming?: boolean;
  createdAt:   Date;
}

export interface Conversation {
  id:        string;
  title:     string;
  messages:  Message[];
  starred:   boolean;
  projectId: string | null;   
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id:          string;
  name:        string;
  description: string;
  createdAt:   Date;
}
"use client";

import { Sidebar }        from "@/components/layout/Sidebar";
import { TopBar }         from "@/components/layout/TopBar";
import { ChatArea }       from "@/components/chat/ChatArea";
import { ProjectsView }   from "@/components/views/ProjectsView";
import { CustomizeView }  from "@/components/views/CustomizeView";
import { ArtifactsView }  from "@/components/views/ArtifactsView";
import { CodeView }       from "@/components/views/CodeView";
import { useStore }       from "@/lib/store";

export default function Home() {
  const currentView = useStore(s => s.currentView);

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(0,0%,10%)]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        {currentView === "chat"           && <ChatArea />}
        {currentView === "projects"       && <ProjectsView />}
        {currentView === "project-detail" && <ProjectsView />}
        {currentView === "customize"      && <CustomizeView />}
        {currentView === "artifacts"      && <ArtifactsView />}
        {currentView === "code"           && <CodeView />}
      </div>
    </div>
  );
}
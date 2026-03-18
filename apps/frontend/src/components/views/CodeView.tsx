"use client";

import { ExternalLink, GitFork, Star, Code } from "lucide-react";


function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export function CodeView() {
  const REPO_URL = "https://github.com/b3nito404/chatbott";

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[hsl(0,0%,10%)] px-6">
      <div className="w-full max-w-[560px]">

        
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-[hsl(0,0%,14%)] border border-[hsl(0,0%,22%)] flex items-center justify-center">
            <GithubIcon size={40} />
          </div>
        </div>

        
        <h1 className="text-[1.8rem] font-semibold text-foreground text-center mb-3">
          Source Code
        </h1>
        <p className="text-[14px] text-[hsl(0,0%,50%)] text-center leading-relaxed mb-10 max-w-md mx-auto">
          The complete source code for this project is open source and available on GitHub.
          Explore the codebase, fork it, or contribute!
        </p>

        
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 p-5 bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] rounded-2xl hover:border-[hsl(0,0%,34%)] hover:bg-[hsl(0,0%,16%)] transition-all duration-200"
        >
          <div className="w-11 h-11 rounded-xl bg-[hsl(0,0%,18%)] flex items-center justify-center shrink-0">
            <GithubIcon size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-[#FAFAFA] truncate">b3nito404 / chatbott</p>
            <p className="text-[12px] text-[hsl(0,0%,46%)] mt-0.5">
              Chatbot powered by Gemini API | Next.js(Frontend) + NestJS(Backend)
            </p>
          </div>
          <ExternalLink size={15} className="text-[hsl(0,0%,38%)] group-hover:text-[hsl(0,0%,60%)] transition-colors shrink-0" />
        </a>

        
        <div className="flex items-center justify-center gap-6 mt-6">
          {[
            { Icon: Code,     label: "Next.js 14 + NestJS" },
            { Icon: Star,     label: "Open Source"          },
            { Icon: GitFork,  label: "Fork it freely"        },
          ].map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-[12px] text-[hsl(0,0%,42%)]">
              <Icon size={13} className="text-[hsl(0,0%,36%)]" />
              {label}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
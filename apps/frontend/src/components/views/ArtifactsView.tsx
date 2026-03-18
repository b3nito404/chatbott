"use client";

import { useState } from "react";
import { Plus, X, Gamepad2, Puzzle } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic imports to avoid SSR issues with canvas
const PlatformerGame = dynamic(() => import("@/components/games/PlatformerGame"), { ssr: false });
const JoinDotsGame   = dynamic(() => import("@/components/games/JoinDotsGame"),   { ssr: false });

function PlatformerThumb() {
  return (
    <div className="w-full h-full bg-[#1a1a2e] flex items-end p-3 relative overflow-hidden">
      {[[15,20],[40,35],[65,15],[80,28],[28,8]].map(([x,y],i) => (
        <div key={i} className="absolute w-1 h-1 bg-[#ffd700] rounded-full" style={{ left:`${x}%`, top:`${y}%` }} />
      ))}
      <div className="absolute bg-[#16213e] rounded h-2" style={{ left:"5%",  bottom:"28%", width:"28%" }} />
      <div className="absolute bg-[#00ff9f] rounded h-2 opacity-80" style={{ left:"30%", bottom:"44%", width:"22%" }} />
      <div className="absolute bg-[#00ff9f] rounded h-2 opacity-80" style={{ left:"58%", bottom:"34%", width:"18%" }} />
      <div className="absolute bg-[#16213e] rounded h-2" style={{ left:"78%", bottom:"50%", width:"18%" }} />
      
      <div className="absolute bg-[#4a90e2] rounded-sm w-4 h-4" style={{ left:"10%", bottom:"40%" }}>
        <div className="absolute bg-white w-1 h-1 rounded-full" style={{ top:2, left:2 }} />
        <div className="absolute bg-white w-1 h-1 rounded-full" style={{ top:2, right:2 }} />
      </div>

      <div className="absolute bg-red-500 rounded-sm w-3 h-3" style={{ left:"68%", bottom:"46%" }}>
        <div className="absolute bg-white w-1 h-1 rounded-full" style={{ top:1, left:1 }} />
        <div className="absolute bg-white w-1 h-1 rounded-full" style={{ top:1, right:1 }} />
      </div>
      {[[45,62],[55,62],[70,58]].map(([x,y],i)=>(
        <div key={i} className="absolute w-2 h-2 bg-[#ffd700] rotate-45" style={{ left:`${x}%`, bottom:`${y}%` }} />
      ))}
    </div>
  );
}

function JoinDotsThumb() {
  const preview: ("red"|"yellow"|null)[][] = [
    [null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null],
    [null,null,"yellow",null,null,null,null],
    [null,"red","yellow","red",null,null,null],
    [null,"red","yellow","red","yellow",null,null],
    ["red","red","yellow","yellow","red","yellow",null],
  ];
  return (
    <div className="w-full h-full bg-[hsl(220,50%,12%)] flex items-center justify-center p-2">
      <div className="grid gap-1" style={{ gridTemplateColumns:"repeat(7,1fr)" }}>
        {preview.map((row, ri) =>
          row.map((cell, ci) => (
            <div key={`${ri}-${ci}`}
              className={`rounded-full aspect-square w-7 border-2 border-[hsl(220,30%,22%)] ${
                cell === "red"    ? "bg-red-500"
                : cell === "yellow" ? "bg-yellow-400"
                : "bg-[hsl(220,40%,8%)]"
              }`}
            />
          ))
        )}
      </div>
    </div>
  );
}


function ArtifactCard({ title, Thumb, onClick }: {
  title: string;
  Thumb: React.FC;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group flex flex-col cursor-pointer rounded-xl overflow-hidden border border-[hsl(0,0%,20%)] hover:border-[hsl(0,0%,32%)] transition-all duration-200 hover:scale-[1.02] bg-[hsl(0,0%,13%)]"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <Thumb />
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[13px] font-medium text-[hsl(0,0%,82%)] group-hover:text-[#FAFAFA] transition-colors">
          {title}
        </p>
      </div>
    </div>
  );
}
function GameModal({ title, Game, onClose }: {
  title: string;
  Game: React.ComponentType;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[500] flex flex-col bg-[hsl(0,0%,10%)]">
  
      <div className="flex items-center justify-between px-6 py-3 border-b border-[hsl(0,0%,17%)] shrink-0">
        <span className="text-[14px] font-medium text-[hsl(0,0%,70%)]">{title}</span>
        <button onClick={onClose}
          className="p-1.5 rounded-lg text-[hsl(0,0%,42%)] hover:text-[#FAFAFA] hover:bg-[hsl(0,0%,18%)] transition-colors">
          <X size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Game />
      </div>
    </div>
  );
}

const CATEGORIES = ["All", "Learn something", "Life hacks", "Play a game", "Be creative", "Touch grass"];

const GAMES = [
  {
    id: "platformer",
    title: "AI platformer game",
    category: "Play a game",
    Thumb: PlatformerThumb,
    Game: PlatformerGame,
  },
  {
    id: "joindots",
    title: "Join Dots",
    category: "Play a game",
    Thumb: JoinDotsThumb,
    Game: JoinDotsGame,
  },
];


export function ArtifactsView() {
  const [tab,      setTab]      = useState<"inspiration"|"yours">("inspiration");
  const [category, setCategory] = useState("All");
  const [openGame, setOpenGame] = useState<(typeof GAMES)[number] | null>(null);

  const visible = GAMES.filter(g =>
    category === "All" || g.category === category
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[hsl(0,0%,10%)]">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto px-10 py-10">

          
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[2rem] font-semibold text-foreground">Artifacts</h1>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[hsl(0,0%,24%)] text-[#FAFAFA] text-[13px] font-medium hover:bg-[hsl(0,0%,16%)] transition-colors">
              <Plus size={14} strokeWidth={2.5} /> New artifact
            </button>
          </div>

         
          <div className="flex items-end gap-6 border-b border-[hsl(0,0%,20%)] mb-6">
            {(["inspiration","yours"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`pb-3 text-[14px] font-medium capitalize transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? "border-[#FAFAFA] text-[#FAFAFA]"
                    : "border-transparent text-[hsl(0,0%,50%)] hover:text-[hsl(0,0%,72%)]"
                }`}>
                {t === "inspiration" ? "Inspiration" : "Your artifacts"}
              </button>
            ))}
          </div>

          {tab === "inspiration" ? (
            <>
             
              <div className="flex items-center gap-2 flex-wrap mb-7">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                      category === c
                        ? "bg-[#FAFAFA] text-[hsl(0,0%,8%)]"
                        : "text-[hsl(0,0%,58%)] hover:text-[hsl(0,0%,80%)] hover:bg-[hsl(0,0%,16%)]"
                    }`}>
                    {c}
                  </button>
                ))}
              </div>

            
              {visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Gamepad2 size={40} className="text-[hsl(0,0%,32%)] mb-4" />
                  <p className="text-[hsl(0,0%,46%)] text-[14px]">No artifacts in this category yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {visible.map(game => (
                    <ArtifactCard
                      key={game.id}
                      title={game.title}
                      Thumb={game.Thumb}
                      onClick={() => setOpenGame(game)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Puzzle size={40} className="text-[hsl(0,0%,32%)] mb-4" />
              <p className="text-[16px] font-medium text-foreground mb-2">No artifacts yet</p>
              <p className="text-[13px] text-[hsl(0,0%,46%)] max-w-xs leading-relaxed">
                Artifacts you create in your conversations will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {openGame && (
        <GameModal
          title={openGame.title}
          Game={openGame.Game}
          onClose={() => setOpenGame(null)}
        />
      )}
    </div>
  );
}
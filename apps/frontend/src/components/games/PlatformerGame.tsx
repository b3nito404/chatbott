"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles, Heart, Star, Zap, Trees, Snowflake,
  Droplets, Flame, X,
} from "lucide-react";

const GRAVITY    = 0.8;
const JUMP_FORCE = -15;
const MOVE_SPEED = 5;
const PLAYER_SIZE = 30;
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function aiComplete(prompt: string): Promise<string> {
  const res = await fetch(`${API}/chat/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error("API error");
  const data = await res.json();
  return data.content;
}

const THEMES_CONFIG: Record<string, { bg: string; platform: string; accent: string; effect: string }> = {
  "Crystal Caves": { bg: "#1a1a2e", platform: "#16213e", accent: "#e94560", effect: "sparkle" },
  "Cloud Kingdom":  { bg: "#87ceeb", platform: "#ffffff", accent: "#ffd700", effect: "bubbles" },
  "Volcanic Forge": { bg: "#2c1810", platform: "#8b4513", accent: "#ff6347", effect: "embers" },
  "Enchanted Forest": { bg: "#1a3d1a", platform: "#228b22", accent: "#90ee90", effect: "leaves" },
  "Arctic Tundra":  { bg: "#4682b4", platform: "#e0ffff", accent: "#00bfff", effect: "snow"   },
};

function createFallbackLevel(theme: string, level: number) {
  const cfg = THEMES_CONFIG[theme] ?? THEMES_CONFIG["Crystal Caves"];
  const difficulty = Math.min(level + 1, 10);
  const platforms: any[] = [{ x: 50, y: 400, width: 100, height: 20, type: "normal" }];

  for (let i = 1; i < 8 + difficulty; i++) {
    const last = platforms[platforms.length - 1];
    const x = last.x + 120 + Math.random() * 80;
    const y = 300 + Math.sin(i * 0.5) * 150;
    const types = ["moving", "bouncy", "disappearing"];
    const type  = Math.random() > 0.7 ? types[Math.floor(Math.random() * 3)] : "normal";
    platforms.push({
      x: Math.min(x, 750), y: Math.max(100, Math.min(500, y)),
      width: 80 + Math.random() * 40, height: 20, type,
      movementRange: type === "moving" ? 100 : undefined,
      movementSpeed: type === "moving" ? 1 + difficulty * 0.2 : undefined,
    });
  }

  return {
    platforms,
    enemies:      Array.from({ length: Math.floor(difficulty / 2) }, (_, i) => ({ x: 200 + i * 250, y: 250, type: "walker", patrolRange: 100 })),
    collectibles: Array.from({ length: 5 + difficulty }, (_, i) => ({ x: 100 + i * 100, y: 200 + Math.random() * 200, type: Math.random() > 0.8 ? "powerup" : "gem" })),
    obstacles:    Array.from({ length: Math.floor(difficulty / 3) }, (_, i) => ({ x: 300 + i * 200, y: 350, type: "spike", width: 30, height: 20 })),
    theme:        { backgroundColor: cfg.bg, platformColor: cfg.platform, accentColor: cfg.accent, particleEffect: cfg.effect },
    levelName:    `${theme} - Level ${level}`,
    levelDescription: `Explore the ${theme.toLowerCase()}`,
  };
}

const THEMES_LIST = [
  { name: "Crystal Caves",   Icon: Star,      color: "#e94560" },
  { name: "Cloud Kingdom",   Icon: Droplets,  color: "#87ceeb" },
  { name: "Volcanic Forge",  Icon: Flame,     color: "#ff6347" },
  { name: "Enchanted Forest",Icon: Trees,     color: "#228b22" },
  { name: "Arctic Tundra",   Icon: Snowflake, color: "#00bfff" },
];

export default function PlatformerGame() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const animRef    = useRef<number>(0);
  const [gameState, setGameState] = useState<"menu"|"themeSelect"|"playing"|"levelComplete"|"gameOver">("menu");
  const [theme,     setTheme]     = useState("");
  const [level,     setLevel]     = useState(1);
  const [score,     setScore]     = useState(0);
  const [lives,     setLives]     = useState(3);
  const [generating,setGenerating]= useState(false);
  const [levelData, setLevelData] = useState<any>(null);

  const gameRefs = useRef({
    player: { x: 50, y: 300, vx: 0, vy: 0, width: PLAYER_SIZE, height: PLAYER_SIZE, grounded: false, jumpCount: 0 },
    camera: { x: 0, y: 0 },
    particles: [] as any[],
    collectedItems: new Set<number>(),
    keys: {} as Record<string, boolean>,
    platformStates: new Map<number, any>(),
    jumpPressed: false,
    localLives: 3,
    localScore: 0,
  });

  const generateLevel = useCallback(async (themeName: string, lvl: number) => {
    setGenerating(true);
    try {
      const prompt = `Generate a platformer level JSON for theme "${themeName}", difficulty ${Math.min(lvl + 1, 10)}/10.
Respond ONLY with valid JSON:
{"platforms":[{"x":50,"y":400,"width":100,"height":20,"type":"normal"}],"enemies":[],"collectibles":[],"obstacles":[],"theme":{"backgroundColor":"#1a1a2e","platformColor":"#16213e","accentColor":"#e94560","particleEffect":"sparkle"},"levelName":"${themeName} - Level ${lvl}","levelDescription":""}
Make ${8 + lvl} platforms forming a path from x:50 to x:750. Max jump gap 140px horizontal, 80px vertical.`;
      const raw  = await aiComplete(prompt);
      const data = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setLevelData(data);
    } catch {
      setLevelData(createFallbackLevel(themeName, lvl));
    }
    setGenerating(false);
    setGameState("playing");
  }, []);

  const resetPlayerRef = () => {
    gameRefs.current.player = { x: 50, y: 300, vx: 0, vy: 0, width: PLAYER_SIZE, height: PLAYER_SIZE, grounded: false, jumpCount: 0 };
    gameRefs.current.collectedItems.clear();
    gameRefs.current.platformStates.clear();
    gameRefs.current.localLives  = 3;
    gameRefs.current.localScore  = 0;
    gameRefs.current.particles   = [];
  };

  const addParticle = (x: number, y: number, color: string) => {
    gameRefs.current.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * -5 - 2,
      life: 1, size: Math.random() * 4 + 2, color,
    });
  };

  useEffect(() => {
    const dn = (e: KeyboardEvent) => { gameRefs.current.keys[e.key] = true; };
    const up = (e: KeyboardEvent) => { gameRefs.current.keys[e.key] = false; };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, []);

  useEffect(() => {
    if (gameState !== "playing" || !levelData) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const loop = () => {
      const ctx  = canvas.getContext("2d")!;
      const g    = gameRefs.current;
      const { player, camera, keys } = g;

      ctx.fillStyle = levelData.theme.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);


      if (keys["ArrowLeft"] || keys["a"]) player.vx = -MOVE_SPEED;
      else if (keys["ArrowRight"] || keys["d"]) player.vx = MOVE_SPEED;
      else player.vx *= 0.8;

      const wantsJump = keys["ArrowUp"] || keys["w"] || keys[" "];
      if (wantsJump && !g.jumpPressed && player.jumpCount < 2) {
        player.vy = JUMP_FORCE;
        player.jumpCount++;
        g.jumpPressed = true;
        addParticle(player.x + player.width / 2, player.y + player.height, levelData.theme.accentColor);
      }
      if (!wantsJump) g.jumpPressed = false;

      player.vy = Math.min(player.vy + GRAVITY, 20);
      player.x += player.vx;
      player.y += player.vy;
      camera.x = Math.max(0, player.x - canvas.width / 2);

      player.grounded = false;
      levelData.platforms.forEach((plat: any, i: number) => {
        let px = plat.x, py = plat.y;
        if (plat.type === "moving" && plat.movementRange) {
          const st = g.platformStates.get(i) ?? { offset: 0, dir: 1 };
          st.offset += (plat.movementSpeed ?? 1) * st.dir;
          if (Math.abs(st.offset) > plat.movementRange) st.dir *= -1;
          g.platformStates.set(i, st);
          px += st.offset;
        }
        if (player.x < px + plat.width && player.x + player.width > px &&
            player.y < py + plat.height && player.y + player.height > py) {
          if (player.vy > 0 && player.y < py) {
            player.y = py - player.height; player.vy = 0;
            player.grounded = true; player.jumpCount = 0;
            if (plat.type === "bouncy") player.vy = JUMP_FORCE * 1.5;
          }
        }
        ctx.save(); ctx.translate(-camera.x, 0);
        ctx.fillStyle = plat.type === "ice" ? "#e0ffff" : plat.type === "bouncy" ? levelData.theme.accentColor : levelData.theme.platformColor;
        ctx.fillRect(px, py, plat.width, plat.height);
        ctx.restore();
      });

      levelData.collectibles?.forEach((item: any, i: number) => {
        if (g.collectedItems.has(i)) return;
        const dist = Math.hypot(player.x + player.width / 2 - item.x, player.y + player.height / 2 - item.y);
        if (dist < 30) {
          g.collectedItems.add(i);
          g.localScore += item.type === "gem" ? 10 : 50;
          setScore(g.localScore);
          addParticle(item.x, item.y, item.type === "gem" ? "#ffd700" : "#ff69b4");
        } else {
          ctx.save(); ctx.translate(-camera.x, 0);
          ctx.fillStyle = item.type === "gem" ? "#ffd700" : "#ff69b4";
          ctx.beginPath(); ctx.arc(item.x, item.y, 10, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      });

    
      if (player.x > 750) { setGameState("levelComplete"); return; }

      ctx.save(); ctx.translate(-camera.x, 0);
      ctx.fillStyle = "#4a90e2";
      ctx.fillRect(player.x, player.y, player.width, player.height);
      ctx.fillStyle = "#fff";
      ctx.fillRect(player.x + 5, player.y + 5, 5, 5);
      ctx.fillRect(player.x + 20, player.y + 5, 5, 5);
      ctx.fillRect(player.x + 10, player.y + 15, 10, 5);
      ctx.restore();

      // Particles
      g.particles = g.particles.filter(p => p.life > 0);
      g.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life -= 0.02;
        ctx.save(); ctx.translate(-camera.x, 0);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color ?? levelData.theme.accentColor;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
      });

      if (Math.random() < 0.08) addParticle(camera.x + Math.random() * canvas.width, Math.random() * canvas.height, levelData.theme.accentColor);

      if (player.y > canvas.height) {
        g.localLives--;
        setLives(g.localLives);
        if (g.localLives <= 0) { setGameState("gameOver"); return; }
        player.x = 50; player.y = 300; player.vx = 0; player.vy = 0;
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameState, levelData]);

  const startTheme = (t: string) => {
    setTheme(t); resetPlayerRef(); generateLevel(t, level);
  };

  const reset = () => {
    cancelAnimationFrame(animRef.current);
    setLevel(1); setScore(0); setLives(3); setTheme(""); setLevelData(null);
    resetPlayerRef(); setGameState("menu");
  };

  const nextLevel = () => {
    cancelAnimationFrame(animRef.current);
    const nl = level + 1; setLevel(nl); setTheme(""); setLevelData(null);
    resetPlayerRef(); setGameState("themeSelect");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-[hsl(0,0%,10%)] text-white p-6">

      {gameState === "menu" && (
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-bold text-[#FAFAFA]">AI Platformer</h1>
          <p className="text-[hsl(0,0%,56%)] text-lg">Each level is uniquely generated based on your chosen theme!</p>
          <button onClick={() => setGameState("themeSelect")}
            className="px-8 py-4 bg-[hsl(0,0%,18%)] border border-[hsl(0,0%,28%)] rounded-xl font-semibold text-lg text-[#FAFAFA] hover:bg-[hsl(0,0%,24%)] transition-all hover:scale-105">
            Start Adventure
          </button>
          <p className="text-[hsl(0,0%,38%)] text-sm">Arrow keys / WASD to move · Up/Space to jump (double jump!)</p>
        </div>
      )}

      {gameState === "themeSelect" && !generating && (
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-bold text-[#FAFAFA]">Choose Your Theme</h2>
          <p className="text-[hsl(0,0%,50%)]">Level {level}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-xl">
            {THEMES_LIST.map(({ name, Icon, color }) => (
              <button key={name} onClick={() => startTheme(name)}
                className="p-5 rounded-xl bg-[hsl(0,0%,14%)] border-2 hover:bg-[hsl(0,0%,18%)] transition-all hover:scale-105 group"
                style={{ borderColor: color }}>
                <div className="flex flex-col items-center gap-2">
                  <Icon size={28} style={{ color }} className="group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-[#FAFAFA] text-sm">{name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {generating && (
        <div className="text-center space-y-4">
          <Sparkles size={48} className="mx-auto animate-pulse text-[hsl(40,80%,60%)]" />
          <h2 className="text-2xl font-bold text-[#FAFAFA]">Generating your level…</h2>
          <p className="text-[hsl(0,0%,50%)]">Creating a unique {theme} experience</p>
        </div>
      )}

      {gameState === "playing" && levelData && (
        <div className="relative">
          <div className="absolute top-3 left-3 right-3 flex justify-between z-10">
            <div className="bg-[hsl(0,0%,12%)]/90 backdrop-blur px-4 py-2 rounded-xl border border-[hsl(0,0%,22%)]">
              <p className="text-[11px] text-[hsl(0,0%,46%)]">Level {level}</p>
              <p className="font-bold text-sm text-[#FAFAFA]">{levelData.levelName}</p>
            </div>
            <div className="bg-[hsl(0,0%,12%)]/90 backdrop-blur px-4 py-2 rounded-xl border border-[hsl(0,0%,22%)]">
              <p className="text-[11px] text-[hsl(0,0%,46%)]">Score: {score}</p>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: lives }).map((_, i) => (
                  <Heart key={i} size={16} className="text-red-400 fill-red-400" />
                ))}
              </div>
            </div>
          </div>
          <canvas ref={canvasRef} width={800} height={600}
            className="border border-[hsl(0,0%,22%)] rounded-xl shadow-2xl" />
        </div>
      )}

      {gameState === "levelComplete" && (
        <div className="text-center space-y-6">
          <Zap size={64} className="mx-auto text-[hsl(40,80%,60%)] animate-bounce" />
          <h2 className="text-3xl font-bold text-[#FAFAFA]">Level Complete!</h2>
          <p className="text-lg text-[hsl(0,0%,56%)]">Score: {score}</p>
          <button onClick={nextLevel}
            className="px-8 py-3 bg-[hsl(0,0%,18%)] border border-[hsl(0,0%,30%)] rounded-xl font-semibold text-[#FAFAFA] hover:bg-[hsl(0,0%,24%)] transition-all hover:scale-105">
            Next Level
          </button>
        </div>
      )}

      {gameState === "gameOver" && (
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold text-red-400">Game Over</h2>
          <p className="text-lg text-[hsl(0,0%,56%)]">Final Score: {score} · Level {level}</p>
          <button onClick={reset}
            className="px-8 py-3 bg-[hsl(0,0%,18%)] border border-[hsl(0,0%,30%)] rounded-xl font-semibold text-[#FAFAFA] hover:bg-[hsl(0,0%,24%)] transition-all hover:scale-105">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
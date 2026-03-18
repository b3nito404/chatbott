"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronRight, Sparkles, Cpu, User, RotateCcw } from "lucide-react";

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

type Cell = "red" | "yellow" | null;
type Board = Cell[][];

function emptyBoard(): Board {
  return Array(6).fill(null).map(() => Array(7).fill(null));
}

function getRow(board: Board, col: number): number {
  for (let r = 5; r >= 0; r--) if (board[r][col] === null) return r;
  return -1;
}

function getValid(board: Board): number[] {
  return [0,1,2,3,4,5,6].filter(c => getRow(board, c) !== -1);
}

function checkWin(board: Board, row: number, col: number): { winner: Cell; cells: [number, number][] } | null {
  const p = board[row][col];
  if (!p) return null;
  const dirs = [[[0,1],[0,-1]],[[1,0],[-1,0]],[[1,1],[-1,-1]],[[1,-1],[-1,1]]];
  for (const [d1, d2] of dirs) {
    const cells: [number, number][] = [[row, col]];
    for (const [dr, dc] of [d1, d2]) {
      let r = row + dr, c = col + dc;
      while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === p) {
        cells.push([r, c]); r += dr; c += dc;
      }
    }
    if (cells.length >= 4) return { winner: p, cells };
  }
  return null;
}

function isFull(board: Board) { return board[0].every(c => c !== null); }

function canWin(board: Board, col: number, player: Cell): boolean {
  const row = getRow(board, col);
  if (row < 0) return false;
  const b = board.map(r => [...r]);
  b[row][col] = player;
  return checkWin(b, row, col) !== null;
}

function scorePosition(board: Board, player: Cell): number {
  let score = 0;
  const opp = player === "yellow" ? "red" : "yellow";
  // center column preference
  const center = board.map(r => r[3]);
  score += center.filter(c => c === player).length * 3;
  // horizontal
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c <= 3; c++) {
      const w = [board[r][c], board[r][c+1], board[r][c+2], board[r][c+3]];
      const mine = w.filter(x => x === player).length;
      const empty = w.filter(x => x === null).length;
      if (mine === 4) score += 100;
      else if (mine === 3 && empty === 1) score += 5;
      else if (mine === 2 && empty === 2) score += 2;
      if (w.filter(x => x === opp).length === 3 && empty === 1) score -= 4;
    }
  }
  return score;
}

function minimax(board: Board, depth: number, alpha: number, beta: number, maximizing: boolean, difficulty: string): number {
  const valid = getValid(board);
  const isTerminal = valid.length === 0 || isFull(board) ||
    board.some((row, r) => row.some((_, c) => {
      if (!board[r][c]) return false;
      return !!checkWin(board, r, c);
    }));
  if (depth === 0 || isTerminal) return scorePosition(board, "yellow");

  if (maximizing) {
    let val = -Infinity;
    for (const col of valid) {
      const row = getRow(board, col);
      const b = board.map(r => [...r]);
      b[row][col] = "yellow";
      val = Math.max(val, minimax(b, depth - 1, alpha, beta, false, difficulty));
      alpha = Math.max(alpha, val);
      if (alpha >= beta) break;
    }
    return val;
  } else {
    let val = Infinity;
    for (const col of valid) {
      const row = getRow(board, col);
      const b = board.map(r => [...r]);
      b[row][col] = "red";
      val = Math.min(val, minimax(b, depth - 1, alpha, beta, true, difficulty));
      beta = Math.min(beta, val);
      if (alpha >= beta) break;
    }
    return val;
  }
}

function bestMove(board: Board, difficulty: string): number {
  const valid = getValid(board);
  const depth = difficulty === "easy" ? 2 : difficulty === "medium" ? 4 : 6;

  // Win immediately
  for (const c of valid) if (canWin(board, c, "yellow")) return c;
  // Block opponent
  for (const c of valid) if (canWin(board, c, "red")) return c;

  if (difficulty === "easy" && Math.random() < 0.3) {
    return valid[Math.floor(Math.random() * valid.length)];
  }

  let best = -Infinity, bestCol = valid[0];
  for (const col of valid) {
    const row = getRow(board, col);
    const b = board.map(r => [...r]);
    b[row][col] = "yellow";
    const v = minimax(b, depth, -Infinity, Infinity, false, difficulty);
    if (v > best) { best = v; bestCol = col; }
  }
  return bestCol;
}

export default function JoinDotsGame() {
  const [gameState,     setGameState]     = useState<"menu"|"playing"|"gameOver">("menu");
  const [board,         setBoard]         = useState<Board>(emptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<"human"|"ai">("human");
  const [winner,        setWinner]        = useState<Cell|"draw"|null>(null);
  const [difficulty,    setDifficulty]    = useState<"easy"|"medium"|"hard">("medium");
  const [isThinking,    setIsThinking]    = useState(false);
  const [thoughts,      setThoughts]      = useState<{text:string;round:number}[]>([]);
  const [lastMove,      setLastMove]      = useState<{row:number;col:number}|null>(null);
  const [winCells,      setWinCells]      = useState<[number,number][]>([]);
  const [hoveredCol,    setHoveredCol]    = useState<number|null>(null);

  const roundRef = useRef(0);

  const handleClick = (col: number) => {
    if (gameState !== "playing" || currentPlayer !== "human" || isThinking) return;
    const row = getRow(board, col);
    if (row < 0) return;
    const b = board.map(r => [...r]);
    b[row][col] = "red";
    setBoard(b); setLastMove({ row, col });
    roundRef.current++;
    const result = checkWin(b, row, col);
    if (result) { setWinCells(result.cells); setWinner("red"); setGameState("gameOver"); return; }
    if (isFull(b)) { setWinner("draw"); setGameState("gameOver"); return; }
    setCurrentPlayer("ai");
  };

  useEffect(() => {
    if (currentPlayer !== "ai" || gameState !== "playing") return;

    const run = async () => {
      setIsThinking(true);
      const round = roundRef.current + 1;

      const boardStr = board.map(r => r.map(c => c === "red" ? "R" : c === "yellow" ? "Y" : ".").join(" ")).join("\n");
      const valid = getValid(board);
      const wins  = valid.filter(c => canWin(board, c, "yellow"));
      const blocks = valid.filter(c => canWin(board, c, "red"));

      try {
        const prompt = `Connect Four, you are Yellow (Y) vs Red (R). Board:\n${boardStr}\nValid: [${valid}]. Win moves: [${wins}]. Block moves: [${blocks}].\nDifficulty: ${difficulty}. Choose best column.\nRespond ONLY JSON: {"column":N,"thoughts":["reason1","reason2","why"]}`;
        const raw  = await aiComplete(prompt);
        const resp = JSON.parse(raw.replace(/```json|```/g, "").trim());

        for (const t of resp.thoughts) {
          await new Promise(r => setTimeout(r, 250));
          setThoughts(prev => [...prev, { text: t, round }]);
        }
        await new Promise(r => setTimeout(r, 400));

        const col = resp.column;
        const row = getRow(board, col);
        if (row >= 0) {
          const b = board.map(r => [...r]);
          b[row][col] = "yellow";
          setBoard(b); setLastMove({ row, col }); roundRef.current++;
          const result = checkWin(b, row, col);
          if (result) { setWinCells(result.cells); setWinner("yellow"); setGameState("gameOver"); }
          else if (isFull(b)) { setWinner("draw"); setGameState("gameOver"); }
          else setCurrentPlayer("human");
        }
      } catch {
        setThoughts(prev => [...prev, { text: "Using local strategy engine", round }]);
        await new Promise(r => setTimeout(r, 600));
        const col = bestMove(board, difficulty);
        const row = getRow(board, col);
        const b   = board.map(r => [...r]);
        b[row][col] = "yellow";
        setBoard(b); setLastMove({ row, col }); roundRef.current++;
        const result = checkWin(b, row, col);
        if (result) { setWinCells(result.cells); setWinner("yellow"); setGameState("gameOver"); }
        else if (isFull(b)) { setWinner("draw"); setGameState("gameOver"); }
        else setCurrentPlayer("human");
      }
      setIsThinking(false);
    };

    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, gameState]);

  const startGame = (d: "easy"|"medium"|"hard") => {
    setDifficulty(d); setBoard(emptyBoard()); setCurrentPlayer("human");
    setWinner(null); setThoughts([]); setLastMove(null); setWinCells([]);
    roundRef.current = 0; setGameState("playing");
  };

  const resetGame = () => {
    setGameState("menu"); setBoard(emptyBoard()); setWinner(null);
    setThoughts([]); setLastMove(null); setWinCells([]);
  };

  return (
    <div className="min-h-full bg-[hsl(0,0%,10%)] text-white">

      {/* Menu */}
      {gameState === "menu" && (
        <div className="min-h-full flex items-center justify-center p-8">
          <div className="bg-[hsl(0,0%,14%)] border border-[hsl(0,0%,22%)] rounded-2xl p-10 shadow-2xl w-full max-w-sm">
            <h1 className="text-5xl font-bold text-center mb-2 text-[#FAFAFA]">Join Dots</h1>
            <p className="text-center text-[hsl(0,0%,46%)] mb-8">Connect Four with AI</p>
            <div className="space-y-3">
              <p className="text-sm font-medium text-[hsl(0,0%,56%)] text-center mb-4">Select Difficulty</p>
              {(["easy","medium","hard"] as const).map(d => (
                <button key={d} onClick={() => startGame(d)}
                  className="w-full bg-[hsl(0,0%,18%)] border border-[hsl(0,0%,26%)] hover:bg-[hsl(0,0%,22%)] text-[#FAFAFA] font-semibold py-3 px-5 rounded-xl transition-all hover:scale-[1.02] shadow flex items-center justify-between group">
                  <span className="capitalize">{d}</span>
                  <ChevronRight size={16} className="text-[hsl(0,0%,46%)] group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game */}
      {(gameState === "playing" || gameState === "gameOver") && (
        <div className="min-h-full flex items-center justify-center p-6">
          <div className="flex gap-6 max-w-5xl w-full">

            {/* Board */}
            <div className="flex-1">
              <div className="bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h1 className="text-2xl font-bold text-[#FAFAFA]">Join Dots</h1>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                      currentPlayer === "human"
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-[hsl(0,0%,18%)] text-[hsl(0,0%,46%)] border border-[hsl(0,0%,22%)]"}`}>
                      <User size={11} className="inline mr-1.5" />Your Turn
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                      currentPlayer === "ai"
                        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                        : "bg-[hsl(0,0%,18%)] text-[hsl(0,0%,46%)] border border-[hsl(0,0%,22%)]"}`}>
                      <Cpu size={11} className="inline mr-1.5" />AI Turn
                    </div>
                  </div>
                </div>

                <div className="bg-[hsl(220,50%,12%)] rounded-xl p-3 border border-[hsl(220,30%,20%)]">
                  <div className="grid grid-cols-7 gap-1.5">
                    {Array(7).fill(null).map((_, col) => (
                      <div key={col}
                        className="relative cursor-pointer"
                        onClick={() => handleClick(col)}
                        onMouseEnter={() => setHoveredCol(col)}
                        onMouseLeave={() => setHoveredCol(null)}>
                        {hoveredCol === col && currentPlayer === "human" && !isThinking && (
                          <div className="absolute inset-0 bg-white/5 rounded-lg pointer-events-none z-10" />
                        )}
                        {board.map((row, ri) => {
                          const isWin   = winCells.some(([r,c]) => r === ri && c === col);
                          const isLast  = lastMove?.row === ri && lastMove?.col === col;
                          return (
                            <div key={ri}
                              className="aspect-square rounded-full border-2 border-[hsl(220,30%,20%)] relative overflow-hidden mb-1.5">
                              {row[col] && (
                                <div className={`absolute inset-0 rounded-full transition-all ${
                                  row[col] === "red"
                                    ? "bg-red-500 shadow-lg shadow-red-500/40"
                                    : "bg-yellow-400 shadow-lg shadow-yellow-400/40"
                                } ${isWin ? "animate-pulse scale-110" : ""}`} />
                              )}
                              {isLast && !isWin && (
                                <div className="absolute inset-0 border-2 border-white/40 rounded-full animate-ping" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {gameState === "gameOver" && (
                  <div className="mt-5 text-center space-y-3">
                    <h2 className="text-2xl font-bold">
                      {winner === "draw"   ? <span className="text-[hsl(0,0%,70%)]">It's a Draw!</span>
                       : winner === "red"  ? <span className="text-red-400">You Win! 🎉</span>
                       :                    <span className="text-yellow-400">AI Wins!</span>}
                    </h2>
                    <button onClick={resetGame}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(0,0%,18%)] border border-[hsl(0,0%,28%)] text-[#FAFAFA] font-medium rounded-xl hover:bg-[hsl(0,0%,22%)] transition-all hover:scale-[1.02]">
                      <RotateCcw size={14} />Play Again
                    </button>
                  </div>
                )}
              </div>
            </div>

            
            <div className="w-72">
              <div className="bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] rounded-2xl p-5 shadow-2xl h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={15} className="text-yellow-400" />
                  <h2 className="text-[14px] font-semibold text-[#FAFAFA]">AI Thoughts</h2>
                  <span className="ml-auto text-[11px] text-[hsl(0,0%,40%)] capitalize">{difficulty}</span>
                </div>
                <div className="space-y-2 max-h-[460px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                  {isThinking && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2.5 animate-pulse">
                      <p className="text-yellow-300 text-[12px]">Analyzing board…</p>
                    </div>
                  )}
                  {[...thoughts].reverse().map((t, i) => (
                    <div key={thoughts.length - i - 1}
                      className="bg-[hsl(0,0%,17%)] border border-[hsl(0,0%,22%)] rounded-lg p-2.5"
                      style={{ opacity: Math.max(0.4, 1 - i * 0.12) }}>
                      <p className="text-[12px] text-[hsl(0,0%,70%)]">{t.text}</p>
                      <p className="text-[10px] text-[hsl(0,0%,38%)] mt-0.5">Move {t.round}</p>
                    </div>
                  ))}
                  {thoughts.length === 0 && !isThinking && (
                    <p className="text-[hsl(0,0%,36%)] text-[12px] text-center py-6">AI thoughts will appear here…</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
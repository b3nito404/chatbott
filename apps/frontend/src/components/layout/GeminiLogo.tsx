"use client";

const DELAYS = [0, -1.4286, -2.8571, -4.2857, -5.7143, -7.1429, -8.5714];

const KEYFRAMES = `
@keyframes square-animation {
  0%     { left: 0;    top: 0;    }
  10.5%  { left: 0;    top: 0;    }
  12.5%  { left: 32px; top: 0;    }
  23%    { left: 32px; top: 0;    }
  25%    { left: 64px; top: 0;    }
  35.5%  { left: 64px; top: 0;    }
  37.5%  { left: 64px; top: 32px; }
  48%    { left: 64px; top: 32px; }
  50%    { left: 32px; top: 32px; }
  60.5%  { left: 32px; top: 32px; }
  62.5%  { left: 32px; top: 64px; }
  73%    { left: 32px; top: 64px; }
  75%    { left: 0;    top: 64px; }
  85.5%  { left: 0;    top: 64px; }
  87.5%  { left: 0;    top: 32px; }
  98%    { left: 0;    top: 32px; }
  100%   { left: 0;    top: 0;    }
}
`;

export function GeminiLogo({ size = 32 }: { size?: number }) {
  const scale = size / 96;
  const sq    = Math.round(28 * scale);
  const mg    = Math.round(2  * scale);
  const step  = Math.round(32 * scale);

  const kf = `
@keyframes sq-anim-${size} {
  0%     { left: 0;       top: 0;       }
  10.5%  { left: 0;       top: 0;       }
  12.5%  { left: ${step}px;  top: 0;       }
  23%    { left: ${step}px;  top: 0;       }
  25%    { left: ${step*2}px; top: 0;      }
  35.5%  { left: ${step*2}px; top: 0;      }
  37.5%  { left: ${step*2}px; top: ${step}px; }
  48%    { left: ${step*2}px; top: ${step}px; }
  50%    { left: ${step}px;  top: ${step}px; }
  60.5%  { left: ${step}px;  top: ${step}px; }
  62.5%  { left: ${step}px;  top: ${step*2}px; }
  73%    { left: ${step}px;  top: ${step*2}px; }
  75%    { left: 0;       top: ${step*2}px; }
  85.5%  { left: 0;       top: ${step*2}px; }
  87.5%  { left: 0;       top: ${step}px; }
  98%    { left: 0;       top: ${step}px; }
  100%   { left: 0;       top: 0;       }
}`;

  return (
    <>
      <style>{kf}</style>
      <div style={{ position: "relative", width: size, height: size, transform: "rotate(45deg)", flexShrink: 0 }}>
        {DELAYS.map((delay, i) => (
          <div key={i} style={{
            position: "absolute",
            top: 0, left: 0,
            width: sq, height: sq,
            margin: mg,
            background: "white",
            animation: `sq-anim-${size} 10s ease-in-out ${delay}s infinite both`,
          }} />
        ))}
      </div>
    </>
  );
}

const STATIC: { l: number; t: number }[] = [
  { l: 0,  t: 0  }, { l: 32, t: 0  }, { l: 64, t: 0  },
  { l: 64, t: 32 }, { l: 32, t: 32 }, { l: 32, t: 64 }, { l: 0,  t: 64 },
];

export function GeminiLogoStatic({ size = 32 }: { size?: number }) {
  const scale = size / 96;
  const sq    = Math.round(28 * scale);
  const mg    = Math.round(2  * scale);

  return (
    <div style={{ position: "relative", width: size, height: size, transform: "rotate(45deg)", flexShrink: 0 }}>
      {STATIC.map(({ l, t }, i) => (
        <div key={i} style={{
          position: "absolute",
          left: Math.round(l * scale) + mg,
          top:  Math.round(t * scale) + mg,
          width: sq, height: sq,
          background: "white",
        }} />
      ))}
    </div>
  );
}
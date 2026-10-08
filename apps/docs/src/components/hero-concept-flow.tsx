/**
 * A compact map of the Mesh runtime. The moving strokes show the direction
 * of data through the bridge; Alpine's short route stays with Livewire.
 */

const ISLANDS = [
  { name: 'React', x: 18, center: 91, accent: 'stroke-sky-500 dark:stroke-sky-400' },
  { name: 'Vue', x: 187, center: 260, accent: 'stroke-emerald-500 dark:stroke-emerald-400' },
  { name: 'Svelte', x: 356, center: 429, accent: 'stroke-orange-500 dark:stroke-orange-400' },
] as const;

function Node({
  x,
  y,
  width,
  height,
  children,
  mesh = false,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  children: React.ReactNode;
  mesh?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={13}
        className={
          mesh
            ? 'fill-rose-50 stroke-rose-300 dark:fill-zinc-900 dark:stroke-rose-400/60'
            : 'fill-white stroke-zinc-200 dark:fill-zinc-950 dark:stroke-white/15'
        }
        strokeWidth={1.25}
      />
      {children}
    </g>
  );
}

function Port({ x, y, mesh = false }: { x: number; y: number; mesh?: boolean }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={3.25}
      className={
        mesh
          ? 'fill-rose-500 stroke-rose-50 dark:stroke-zinc-900'
          : 'fill-zinc-400 stroke-white dark:fill-zinc-500 dark:stroke-zinc-950'
      }
      strokeWidth={1.5}
    />
  );
}

export function HeroConceptFlow() {
  const routes = [
    { d: 'M260 102 V141', color: 'stroke-rose-400 dark:stroke-rose-400', phase: 'hcf-phase-one' },
    { d: 'M260 205 V251', color: 'stroke-rose-500 dark:stroke-rose-400', phase: 'hcf-phase-two' },
    { d: 'M260 325 V360 H91 V398', color: 'stroke-sky-500 dark:stroke-sky-400', phase: 'hcf-phase-three' },
    { d: 'M260 325 V398', color: 'stroke-emerald-500 dark:stroke-emerald-400', phase: 'hcf-phase-four' },
    { d: 'M260 325 V360 H429 V398', color: 'stroke-orange-500 dark:stroke-orange-400', phase: 'hcf-phase-five' },
  ] as const;

  return (
    <svg
      viewBox="0 0 520 500"
      role="img"
      aria-label="Laravel powers a Livewire component. Livewire passes state and actions through Mesh to React, Vue, and Svelte islands. Alpine connects directly to Livewire."
      className="mx-auto h-auto w-full max-w-md antialiased"
    >
      <style>{`
        .hcf-signal {
          stroke-dasharray: 5 95;
          animation: hcf-travel 3.2s linear infinite;
        }
        .hcf-phase-one { animation-delay: -1.7s; }
        .hcf-phase-two { animation-delay: -1.1s; }
        .hcf-phase-three { animation-delay: -0.9s; }
        .hcf-phase-four { animation-delay: -1.8s; }
        .hcf-phase-five { animation-delay: -2.4s; }
        .hcf-direct-signal {
          animation: hcf-direct 2.4s ease-in-out infinite;
        }
        @keyframes hcf-travel {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -100; }
        }
        @keyframes hcf-direct {
          0%, 100% { transform: translateX(-7px); opacity: 0; }
          22% { opacity: 1; }
          78% { opacity: 1; }
          95% { transform: translateX(7px); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hcf-signal, .hcf-direct-signal { animation: none; opacity: 0; }
        }
      `}</style>

      <defs>
        <pattern id="hcf-dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" className="fill-zinc-300 dark:fill-zinc-700" />
        </pattern>
        <radialGradient id="hcf-glow">
          <stop offset="0" stopColor="#fb7185" stopOpacity="0.16" />
          <stop offset="1" stopColor="#fb7185" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="520" height="500" fill="url(#hcf-dots)" opacity="0.45" />
      <ellipse cx="260" cy="281" rx="186" ry="133" fill="url(#hcf-glow)" />

      <text x="18" y="24" className="fill-zinc-500 dark:fill-zinc-400" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, monospace" letterSpacing="1.6" fontWeight="600">
        THE RENDER PATH
      </text>
      <text x="502" y="24" textAnchor="end" className="fill-zinc-400 dark:fill-zinc-500" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, monospace" letterSpacing="0.7">
        LIVEWIRE 4
      </text>

      {/* Fixed traces remain legible when motion is reduced. */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M260 102 V141 M260 205 V251" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
        <path d="M260 325 V360 H91 V398 M260 360 H429 V398 M260 360 V398" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />
        <path d="M354 173 H382" className="stroke-sky-300 dark:stroke-sky-600" strokeWidth="1.5" />
        {routes.map((route) => (
          <path
            key={route.d}
            d={route.d}
            pathLength={100}
            className={`hcf-signal ${route.color} ${route.phase}`}
            strokeWidth={3.5}
          />
        ))}
      </g>

      <Node x={184} y={42} width={152} height={60}>
        <text x="260" y="69" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-100" fontSize="17" fontWeight="600" letterSpacing="-0.3">
          Laravel
        </text>
        <text x="260" y="87" textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, monospace" letterSpacing="0.6">
          APPLICATION
        </text>
      </Node>

      <Node x={166} y={141} width={188} height={64}>
        <line x1="179" y1="153" x2="179" y2="193" className="stroke-rose-400 dark:stroke-rose-400" strokeWidth="2" strokeLinecap="round" />
        <text x="195" y="169" className="fill-zinc-900 dark:fill-zinc-100" fontSize="18" fontWeight="600" letterSpacing="-0.4">
          Livewire
        </text>
        <text x="195" y="187" className="fill-zinc-500 dark:fill-zinc-400" fontSize="11">
          component state
        </text>
      </Node>

      <Node x={382} y={143} width={126} height={60}>
        <text x="395" y="169" className="fill-zinc-900 dark:fill-zinc-100" fontSize="16" fontWeight="600" letterSpacing="-0.2">
          Alpine
        </text>
        <text x="395" y="187" className="fill-zinc-500 dark:fill-zinc-400" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, monospace">
          DIRECT ROUTE
        </text>
      </Node>
      <circle cx="368" cy="173" r="2.8" className="hcf-direct-signal fill-sky-500 dark:fill-sky-400" />

      <Node x={154} y={251} width={212} height={74} mesh>
        <line x1="169" y1="268" x2="169" y2="309" className="stroke-rose-500 dark:stroke-rose-400" strokeWidth="3" strokeLinecap="round" />
        <text x="186" y="286" className="fill-zinc-900 dark:fill-zinc-100" fontSize="25" fontWeight="600" letterSpacing="-0.8">
          Mesh
        </text>
        <text x="187" y="307" className="fill-zinc-600 dark:fill-zinc-300" fontSize="11">
          bridge · render · sync
        </text>
      </Node>

      {ISLANDS.map((island) => (
        <Node key={island.name} x={island.x} y={398} width={146} height={68}>
          <line x1={island.x + 14} y1={411} x2={island.x + 14} y2={452} className={island.accent} strokeWidth="2" strokeLinecap="round" />
          <text x={island.x + 28} y={431} className="fill-zinc-900 dark:fill-zinc-100" fontSize="17" fontWeight="600" letterSpacing="-0.3">
            {island.name}
          </text>
          <text x={island.x + 28} y={450} className="fill-zinc-500 dark:fill-zinc-400" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, monospace" letterSpacing="0.4">
            RENDERER
          </text>
        </Node>
      ))}

      <Port x={260} y={102} />
      <Port x={260} y={141} />
      <Port x={260} y={205} />
      <Port x={260} y={251} mesh />
      <Port x={260} y={325} mesh />
      <Port x={354} y={173} />
      <Port x={382} y={173} />
      {ISLANDS.map((island) => <Port key={island.name} x={island.center} y={398} />)}
    </svg>
  );
}

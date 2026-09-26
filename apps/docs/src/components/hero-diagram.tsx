/**
 * Fusion A — "Particle Platforms"
 *
 * Concept A's particle-stream universe, given the Tower's physical weight.
 * Every station is now a floating extruded platform — a lit top deck, a
 * solid brand-colored label face, a shaded side — hovering in a starfield
 * above a quiet elliptical ground grid. Mesh is the wide frosted bridge
 * deck at the center, wrapped in its orbital ring, glowing rose. Comet
 * particles with fading trails dock onto the deck edges along every
 * connection; Alpine's luminous stream still routes around Mesh, straight
 * down to Livewire. The whole stack breathes with a slow hover while its
 * shadow stays pinned to the ground.
 */

const FA_FONT =
  "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";

/** Official brand marks (Simple Icons, CC0), 24x24 viewBox, single path each. */
const FA_ICONS: Record<string, string> = {
  react:
    "M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z",
  vue:
    "M24,1.61H14.06L12,5.16,9.94,1.61H0L12,22.39ZM12,14.08,5.16,2.23H9.59L12,6.41l2.41-4.18h4.43Z",
  svelte:
    "M10.354 21.125a4.44 4.44 0 0 1-4.765-1.767 4.109 4.109 0 0 1-.703-3.107 3.898 3.898 0 0 1 .134-.522l.105-.321.287.21a7.21 7.21 0 0 0 2.186 1.092l.208.063-.02.208a1.253 1.253 0 0 0 .226.83 1.337 1.337 0 0 0 1.435.533 1.231 1.231 0 0 0 .343-.15l5.59-3.562a1.164 1.164 0 0 0 .524-.778 1.242 1.242 0 0 0-.211-.937 1.338 1.338 0 0 0-1.435-.533 1.23 1.23 0 0 0-.343.15l-2.133 1.36a4.078 4.078 0 0 1-1.135.499 4.44 4.44 0 0 1-4.765-1.766 4.108 4.108 0 0 1-.702-3.108 3.855 3.855 0 0 1 1.742-2.582l5.589-3.563a4.072 4.072 0 0 1 1.135-.499 4.44 4.44 0 0 1 4.765 1.767 4.109 4.109 0 0 1 .703 3.107 3.943 3.943 0 0 1-.134.522l-.105.321-.286-.21a7.204 7.204 0 0 0-2.187-1.093l-.208-.063.02-.207a1.255 1.255 0 0 0-.226-.831 1.337 1.337 0 0 0-1.435-.532 1.231 1.231 0 0 0-.343.15L8.62 9.368a1.162 1.162 0 0 0-.524.778 1.24 1.24 0 0 0 .211.937 1.338 1.338 0 0 0 1.435.533 1.235 1.235 0 0 0 .344-.151l2.132-1.36a4.067 4.067 0 0 1 1.135-.498 4.44 4.44 0 0 1 4.765 1.766 4.108 4.108 0 0 1 .702 3.108 3.857 3.857 0 0 1-1.742 2.583l-5.589 3.562a4.072 4.072 0 0 1-1.135.499m10.358-17.95C18.484-.015 14.082-.96 10.9 1.068L5.31 4.63a6.412 6.412 0 0 0-2.896 4.295 6.753 6.753 0 0 0 .666 4.336 6.43 6.43 0 0 0-.96 2.396 6.833 6.833 0 0 0 1.168 5.167c2.229 3.19 6.63 4.135 9.812 2.108l5.59-3.562a6.41 6.41 0 0 0 2.896-4.295 6.756 6.756 0 0 0-.665-4.336 6.429 6.429 0 0 0 .958-2.396 6.831 6.831 0 0 0-1.167-5.168Z",
  alpine:
    "m24 12-5.72 5.746-5.724-5.741 5.724-5.75L24 12zM5.72 6.254 0 12l5.72 5.746h11.44L5.72 6.254z",
  laravel:
    "M23.642 5.43a.364.364 0 01.014.1v5.149c0 .135-.073.26-.189.326l-4.323 2.49v4.934a.378.378 0 01-.188.326L9.93 23.949a.316.316 0 01-.066.027c-.008.002-.016.008-.024.01a.348.348 0 01-.192 0c-.011-.002-.02-.008-.03-.012-.02-.008-.042-.014-.062-.025L.533 18.755a.376.376 0 01-.189-.326V2.974c0-.033.005-.066.014-.098.003-.012.01-.02.014-.032a.369.369 0 01.023-.058c.004-.013.015-.022.023-.033l.033-.045c.012-.01.025-.018.037-.027.014-.012.027-.024.041-.034H.53L5.043.05a.375.375 0 01.375 0L9.93 2.647h.002c.015.01.027.021.04.033l.038.027c.013.014.02.03.033.045.008.011.02.021.025.033.01.02.017.038.024.058.003.011.01.021.013.032.01.031.014.064.014.098v9.652l3.76-2.164V5.527c0-.033.004-.066.013-.098.003-.01.01-.02.013-.032a.487.487 0 01.024-.059c.007-.012.018-.02.025-.033.012-.015.021-.03.033-.043.012-.012.025-.02.037-.028.014-.01.026-.023.041-.032h.001l4.513-2.598a.375.375 0 01.375 0l4.513 2.598c.016.01.027.021.042.031.012.01.025.018.036.028.013.014.022.03.034.044.008.012.019.021.024.033.011.02.018.04.024.06.006.01.012.021.015.032zm-.74 5.032V6.179l-1.578.908-2.182 1.256v4.283zm-4.51 7.75v-4.287l-2.147 1.225-6.126 3.498v4.325zM1.093 3.624v14.588l8.273 4.761v-4.325l-4.322-2.445-.002-.003H5.04c-.014-.01-.025-.021-.04-.031-.011-.01-.024-.018-.035-.027l-.001-.002c-.013-.012-.021-.025-.031-.04-.01-.011-.021-.022-.028-.036h-.002c-.008-.014-.013-.031-.02-.047-.006-.016-.014-.027-.018-.043a.49.49 0 01-.008-.057c-.002-.014-.006-.027-.006-.041V5.789l-2.18-1.257zM5.23.81L1.47 2.974l3.76 2.164 3.758-2.164zm1.956 13.505l2.182-1.256V3.624l-1.58.91-2.182 1.255v9.435zm11.581-10.95l-3.76 2.163 3.76 2.163 3.759-2.164zm-.376 4.978L16.21 7.087 14.63 6.18v4.283l2.182 1.256 1.58.908zm-8.65 9.654l5.514-3.148 2.756-1.572-3.757-2.163-4.323 2.489-3.941 2.27z",
  livewire:
    "M12.001 0C6.1735 0 1.4482 4.9569 1.4482 11.0723c0 2.0888.5518 4.0417 1.5098 5.709.2492.2796.544.4843.9649.4843 1.3388 0 1.2678-2.0644 2.6074-2.0644 1.3395 0 1.4111 2.0644 2.75 2.0644 1.3388 0 1.2659-2.0644 2.6054-2.0644.5845 0 .9278.3967 1.2403.8398-.2213-.2055-.4794-.3476-.8203-.3476-1.1956 0-1.3063 1.6771-2.2012 2.1406v4.5097c0 .9145.7418 1.6563 1.6562 1.6563.9145 0 1.6563-.7418 1.6563-1.6563v-5.8925c.308.4332.647.8144 1.2207.8144 1.3388 0 1.266-2.0644 2.6055-2.0644.465 0 .7734.2552 1.039.58-.1294-.0533-.2695-.0878-.4297-.0878-1.1582 0-1.296 1.574-2.1171 2.0937v2.4356c0 .823.6672 1.4902 1.4902 1.4902s1.4902-.6672 1.4902-1.4902V16.371c.3234.4657.6684.8945 1.2774.8945.7955 0 1.093-.7287 1.4843-1.3203.6878-1.4704 1.0743-3.1245 1.0743-4.873C22.5518 4.9569 17.8284 0 12.001 0zm-.5664 2.877c2.8797 0 5.2148 2.7836 5.2148 5.8066 0 3.023-1.5455 5.1504-5.2148 5.1504-3.6693 0-5.2149-2.1274-5.2149-5.1504S8.5548 2.877 11.4346 2.877zM10.0322 4.537a1.9554 2.1583 0 00-1.955 2.1582 1.9554 2.1583 0 001.955 2.1582 1.9554 2.1583 0 001.9551-2.1582 1.9554 2.1583 0 00-1.955-2.1582zm-.3261.664a.9777.9961 0 01.9785.9962.9777.9961 0 01-.9785.996.9777.9961 0 01-.9766-.996.9777.9961 0 01.9766-.9961zM6.7568 15.6935c-1.0746 0-1.2724 1.3542-1.9511 1.9648v1.7813c0 .823.6672 1.4902 1.4902 1.4902s1.4902-.6672 1.4902-1.4902v-3.1817c-.2643-.3237-.5767-.5644-1.0293-.5644Z",
};

type FaStream = {
  id: string;
  d: string;
  color: string;
  dur: number;
  comets: number[];
};

/**
 * Column system: every layer shares the same 400-wide footprint
 * (x 60–460). The top row splits it into four 94-wide columns with
 * 8px gutters (centers 107 / 209 / 311 / 413); Mesh spans the first
 * three columns, Livewire and Laravel span all four. Streams run as
 * aligned verticals down the column centers — Alpine's bypass is the
 * straight lane in its own column, sailing past Mesh to Livewire.
 */
const FA_STREAMS: FaStream[] = [
  // Laravel -> Livewire
  { id: "lara", d: "M260 450 L260 416", color: "#FB70A9", dur: 1.5, comets: [-0.2, -0.95] },
  // Livewire -> Mesh
  { id: "mesh", d: "M209 368 L209 302", color: "#F43F5E", dur: 1.7, comets: [-0.5, -1.35] },
  // Mesh -> React
  { id: "react", d: "M107 242 L107 148", color: "#087EA4", dur: 2.6, comets: [-0.3, -1.2, -2.1] },
  // Mesh -> Vue
  { id: "vue", d: "M209 242 L209 148", color: "#41B883", dur: 2.3, comets: [-0.8, -1.55, -2.05] },
  // Mesh -> Svelte
  { id: "svelte", d: "M311 242 L311 148", color: "#FF3E00", dur: 2.8, comets: [-0.1, -1.05, -2.0] },
  // Livewire -> Alpine (the bypass — a straight lane past Mesh)
  { id: "alpine", d: "M413 368 L413 148", color: "#77C1D2", dur: 3.4, comets: [-0.4, -1.5, -2.6] },
];

const FA_STARS: Array<[number, number, number, boolean]> = [
  [34, 56, 1.5, true],
  [148, 44, 1.1, false],
  [390, 42, 1.4, true],
  [24, 150, 1.2, false],
  [498, 160, 1.5, true],
  [496, 240, 1.0, false],
  [28, 226, 1.3, false],
  [40, 424, 1.4, true],
  [496, 420, 1.2, false],
  [136, 438, 1.0, false],
  [432, 466, 1.3, true],
  [70, 506, 1.1, false],
  [446, 514, 1.0, false],
  [502, 330, 1.1, false],
];

const FA_PORTS: Array<[number, number, string]> = [
  [260, 452, "#FB70A9"],
  [260, 414, "#FB70A9"],
  [209, 370, "#F43F5E"],
  [209, 300, "#F43F5E"],
  [107, 244, "#087EA4"],
  [107, 146, "#087EA4"],
  [209, 244, "#41B883"],
  [209, 146, "#41B883"],
  [311, 244, "#FF3E00"],
  [311, 146, "#FF3E00"],
  [413, 370, "#77C1D2"],
  [413, 146, "#77C1D2"],
];

function FaMotionDot(props: {
  r: number;
  fill: string;
  o: number;
  d: string;
  dur: number;
  begin: number;
}) {
  const { r, fill, o, d, dur, begin } = props;
  return (
    <circle r={r} fill={fill} opacity={0}>
      <animateMotion
        path={d}
        dur={`${dur}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
        calcMode="linear"
      />
      <animate
        attributeName="opacity"
        values={`0;${o};${o};0`}
        keyTimes="0;0.12;0.86;1"
        dur={`${dur}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
      />
    </circle>
  );
}

function FaComet({ s, begin }: { s: FaStream; begin: number }) {
  return (
    <>
      {/* soft halo, head, then two fading trail particles offset in time */}
      <FaMotionDot r={7} fill={`url(#fa-g-${s.id})`} o={0.9} d={s.d} dur={s.dur} begin={begin} />
      <FaMotionDot r={2.6} fill={s.color} o={1} d={s.d} dur={s.dur} begin={begin} />
      <FaMotionDot r={1.8} fill={s.color} o={0.5} d={s.d} dur={s.dur} begin={begin + s.dur * 0.055} />
      <FaMotionDot r={1.2} fill={s.color} o={0.26} d={s.d} dur={s.dur} begin={begin + s.dur * 0.11} />
    </>
  );
}

/**
 * An extruded floating platform: lit top deck, solid label face, shaded
 * right side. Depth extends up-right by (sx, -sy).
 */
function FaPlatform(props: {
  x: number;
  y: number;
  w: number;
  t: number;
  sx: number;
  sy: number;
  color: string;
  label: string;
  fs: number;
  labelColor?: string;
  /** Brand mark path (24x24 viewBox), rendered before the label. */
  icon?: string;
}) {
  const { x, y, w, t, sx, sy, color, label, fs, labelColor = "#FFFFFF", icon } = props;
  const iconSize = fs * 1.25;
  const textW = label.length * fs * 0.56;
  const groupW = icon ? iconSize + 7 + textW : textW;
  const groupX = x + w / 2 - groupW / 2;
  const top = `M${x} ${y} L${x + sx} ${y - sy} L${x + w + sx} ${y - sy} L${x + w} ${y} Z`;
  const side = `M${x + w} ${y} L${x + w + sx} ${y - sy} L${x + w + sx} ${y - sy + t} L${x + w} ${y + t} Z`;
  return (
    <g>
      {/* shaded right side */}
      <path d={side} fill={color} />
      <path d={side} fill="#000000" opacity={0.34} />
      {/* lit top deck */}
      <path d={top} fill={color} />
      <path d={top} fill="#FFFFFF" opacity={0.42} />
      {/* solid label face */}
      <rect x={x} y={y} width={w} height={t} fill={color} />
      {/* hairline edges */}
      <path d={top} fill="none" stroke="#000000" strokeOpacity={0.28} strokeWidth={0.7} strokeLinejoin="bevel" />
      <path d={side} fill="none" stroke="#000000" strokeOpacity={0.28} strokeWidth={0.7} strokeLinejoin="bevel" />
      <rect x={x} y={y} width={w} height={t} fill="none" stroke="#000000" strokeOpacity={0.28} strokeWidth={0.7} />
      {/* top-edge catchlight */}
      <line x1={x} y1={y} x2={x + w} y2={y} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={0.9} />
      {icon && (
        <g
          transform={`translate(${groupX}, ${y + t / 2 - iconSize / 2}) scale(${iconSize / 24})`}
        >
          <path d={icon} fill={labelColor} fillOpacity={0.92} />
        </g>
      )}
      <text
        x={icon ? groupX + iconSize + 7 : x + w / 2}
        y={y + t / 2}
        textAnchor={icon ? "start" : "middle"}
        dominantBaseline="central"
        fontFamily={FA_FONT}
        fontSize={fs}
        fontWeight={650}
        letterSpacing="-0.01em"
        fill={labelColor}
      >
        {label}
      </text>
    </g>
  );
}

function FaPort({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <circle cx={x} cy={y} r={3.2} fill="var(--color-fd-card)" stroke={color} strokeWidth={1.5} />
  );
}

export function HeroDiagram() {
  const orbit = "M 403 272 A 185 48 0 1 1 33 272 A 185 48 0 1 1 403 272";

  // Mesh bridge deck geometry — spans the React/Vue/Svelte columns
  const mx = 60;
  const my = 246;
  const mw = 298;
  const mt = 52;
  const msx = 18;
  const msy = 10;
  const meshTop = `M${mx} ${my} L${mx + msx} ${my - msy} L${mx + mw + msx} ${my - msy} L${mx + mw} ${my} Z`;
  const meshSide = `M${mx + mw} ${my} L${mx + mw + msx} ${my - msy} L${mx + mw + msx} ${my - msy + mt} L${mx + mw} ${my + mt} Z`;

  return (
    <svg
      viewBox="0 0 520 540"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-md mx-auto"
      role="img"
      aria-label="Mesh architecture: animated data streams flow between floating platforms, from Laravel up through Livewire into the Mesh bridge deck, which connects to React, Vue and Svelte, while Alpine connects directly to Livewire, bypassing Mesh."
    >
      <style>{`
        .fa-f { animation: fa-flow 1s linear infinite; }
        @keyframes fa-flow { to { stroke-dashoffset: -12; } }
        .fa-tw { animation: fa-twk 4s ease-in-out infinite; }
        @keyframes fa-twk { 0%, 100% { opacity: 0.14; } 50% { opacity: 0.55; } }
        .fa-float { animation: fa-hover 7s ease-in-out infinite; }
        @keyframes fa-hover {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .fa-shadow { animation: fa-shadow-breathe 7s ease-in-out infinite; transform-origin: 260px 508px; }
        @keyframes fa-shadow-breathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.94); opacity: 0.75; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fa-f, .fa-tw, .fa-float, .fa-shadow { animation: none; }
        }
      `}</style>

      <defs>
        {FA_STREAMS.map((s) => (
          <radialGradient key={s.id} id={`fa-g-${s.id}`}>
            <stop offset="0%" stopColor={s.color} stopOpacity={0.55} />
            <stop offset="100%" stopColor={s.color} stopOpacity={0} />
          </radialGradient>
        ))}
        <radialGradient id="fa-bg">
          <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.16} />
          <stop offset="100%" stopColor="#F43F5E" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="fa-ground-glow">
          <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.18} />
          <stop offset="100%" stopColor="#F43F5E" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="fa-mesh-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
        <linearGradient id="fa-mesh-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="50%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#FB7185" />
        </linearGradient>
        <pattern id="fa-weave" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M0 0 L10 10 M10 0 L0 10" stroke="#F43F5E" strokeWidth="0.7" fill="none" />
        </pattern>
        <filter id="fa-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="fa-soft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* ambient glow behind the hero layer */}
      <ellipse cx={209} cy={272} rx={215} ry={120} fill="url(#fa-bg)" />

      {/* starfield */}
      {FA_STARS.map(([x, y, r, tw], i) =>
        tw ? (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill="currentColor"
            opacity={0.2}
            className="fa-tw"
            style={{ animationDelay: `${-(i * 0.7)}s`, animationDuration: `${3 + (i % 3)}s` }}
          />
        ) : (
          <circle key={i} cx={x} cy={y} r={r} fill="currentColor" opacity={0.18} />
        ),
      )}

      {/* quiet ground grid — stays pinned while the stack hovers above it */}
      <g>
        <ellipse cx={260} cy={508} rx={215} ry={30} fill="url(#fa-ground-glow)" />
        <g className="fa-shadow">
          <ellipse cx={260} cy={508} rx={185} ry={15} fill="#000000" opacity={0.18} filter="url(#fa-soft)" />
        </g>
        {[
          [210, 29],
          [150, 20.5],
          [92, 12.5],
        ].map(([rx, ry], i) => (
          <ellipse
            key={i}
            cx={260}
            cy={508}
            rx={rx}
            ry={ry}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.13 - i * 0.02}
            strokeWidth={0.9}
            strokeDasharray={i === 0 ? "1 5" : undefined}
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* client / server boundary (static annotation) */}
      <line
        x1={20}
        y1={338}
        x2={500}
        y2={338}
        stroke="currentColor"
        strokeOpacity={0.12}
        strokeWidth={1}
        strokeDasharray="4 7"
      />
      <text x={22} y={330} fontFamily={FA_FONT} fontSize={8} fontWeight={600} letterSpacing={2} fill="currentColor" opacity={0.4}>
        CLIENT
      </text>
      <text x={22} y={352} fontFamily={FA_FONT} fontSize={8} fontWeight={600} letterSpacing={2} fill="currentColor" opacity={0.4}>
        SERVER
      </text>

      {/* ============ the hovering stack ============ */}
      <g className="fa-float">
        {/* orbital ring around Mesh (behind the deck so dots pass behind it) */}
        <path d={orbit} fill="none" stroke="#F43F5E" strokeOpacity={0.3} strokeWidth={1} strokeDasharray="1 6" strokeLinecap="round" />
        <g className="motion-reduce:hidden">
          <circle r={2.2} fill="#F43F5E">
            <animateMotion path={orbit} dur="11s" begin="-4s" repeatCount="indefinite" />
          </circle>
          <circle r={1.6} fill="#F43F5E" opacity={0.7}>
            <animateMotion
              path={orbit}
              dur="16s"
              begin="-9s"
              repeatCount="indefinite"
              keyPoints="1;0"
              keyTimes="0;1"
              calcMode="linear"
            />
          </circle>
        </g>

        {/* base tracks */}
        {FA_STREAMS.map((s) => (
          <path key={`t-${s.id}`} d={s.d} fill="none" stroke="var(--color-fd-border)" strokeWidth={1.2} />
        ))}

        {/* dash-flow overlays (CSS animated; freeze under reduced motion but stay visible) */}
        {FA_STREAMS.map((s) => (
          <path
            key={`f-${s.id}`}
            d={s.d}
            fill="none"
            stroke={s.color}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeDasharray="3 9"
            opacity={0.5}
            className="fa-f"
            style={{ animationDuration: `${Math.max(0.7, s.dur * 0.38)}s` }}
          />
        ))}

        {/* comets — luminous particles with trailing sparks */}
        <g className="motion-reduce:hidden">
          {FA_STREAMS.map((s) =>
            s.comets.map((b, i) => <FaComet key={`${s.id}-${i}`} s={s} begin={b} />),
          )}
        </g>

        {/* ============ platforms ============ */}

        {/* Laravel — the foundation slab, full footprint */}
        <FaPlatform x={60} y={454} w={400} t={44} sx={18} sy={10} color="#F53003" label="Laravel" fs={18} icon={FA_ICONS.laravel} />

        {/* Livewire — full footprint */}
        <FaPlatform x={60} y={372} w={400} t={40} sx={18} sy={10} color="#FB70A9" label="Livewire" fs={16} icon={FA_ICONS.livewire} />

        {/* Mesh — the hero bridge deck: frosted card faces, rose-lit */}
        <g>
          <rect x={mx} y={my - 12} width={mw + msx + 12} height={mt + 14} rx={12} fill="none" stroke="#F43F5E" strokeOpacity={0.3} strokeWidth={3} filter="url(#fa-blur)" />
          {/* shaded right side — translucent frosted glass */}
          <path d={meshSide} fill="#FFFFFF" fillOpacity={0.38} />
          <path d={meshSide} fill="#000000" opacity={0.12} />
          <path d={meshSide} fill="none" stroke="#171717" strokeOpacity={0.28} strokeWidth={0.7} strokeLinejoin="bevel" />
          {/* lit top deck with an etched weave */}
          <path d={meshTop} fill="#FFFFFF" fillOpacity={0.5} />
          <path d={meshTop} fill="url(#fa-weave)" opacity={0.1} />
          <path d={meshTop} fill="none" stroke="#171717" strokeOpacity={0.28} strokeWidth={0.7} strokeLinejoin="bevel" />
          {/* label face — translucent frosted glass */}
          <rect x={mx} y={my} width={mw} height={mt} fill="#FFFFFF" fillOpacity={0.6} />
          <rect x={mx} y={my} width={mw} height={mt} fill="none" stroke="#171717" strokeOpacity={0.28} strokeWidth={0.7} />
          <line x1={mx} y1={my} x2={mx + mw} y2={my} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={0.9} />
          <text x={209} y={268} textAnchor="middle" fontFamily={FA_FONT} fontSize={21} fontWeight={800} fill="#171717">
            Mesh
          </text>
          <text x={209} y={286} textAnchor="middle" fontFamily={FA_FONT} fontSize={8} fontWeight={600} letterSpacing={2.5} fill="#171717" opacity={0.6}>
            THE BRIDGE LAYER
          </text>
        </g>

        {/* framework pods — four columns splitting the footprint */}
        <FaPlatform x={60} y={112} w={94} t={34} sx={18} sy={10} color="#087EA4" label="React" fs={13.5} icon={FA_ICONS.react} />
        <FaPlatform x={162} y={112} w={94} t={34} sx={18} sy={10} color="#41B883" label="Vue" fs={13.5} icon={FA_ICONS.vue} />
        <FaPlatform x={264} y={112} w={94} t={34} sx={18} sy={10} color="#FF3E00" label="Svelte" fs={13.5} icon={FA_ICONS.svelte} />
        <FaPlatform x={366} y={112} w={94} t={34} sx={18} sy={10} color="#77C1D2" label="Alpine" fs={13.5} labelColor="#173B47" icon={FA_ICONS.alpine} />

        {/* bypass annotation — runs along Alpine's lane */}
        <text
          transform="rotate(90 426 250)"
          x={426}
          y={250}
          textAnchor="middle"
          fontFamily={FA_FONT}
          fontSize={7.5}
          fontWeight={600}
          letterSpacing={1.8}
          fill="currentColor"
          opacity={0.5}
        >
          DIRECT
        </text>

        {/* docking ports at every stream endpoint */}
        {FA_PORTS.map(([x, y, c], i) => (
          <FaPort key={i} x={x} y={y} color={c} />
        ))}
      </g>
    </svg>
  );
}

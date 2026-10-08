import { cn } from '@/lib/cn';
import s from './figures.module.css';
import { Arrow, BorderLabel, LineLabel, Responsive } from './primitives';

const LABEL =
  'A Mesh component. One Blade tag, <mesh:counter />, mounts two halves: ' +
  'on the server, the Livewire component App\\Mesh\\Counter, which extends ' +
  'Mesh\\Component; in the browser, the frontend entry ' +
  'resources/js/mesh/Counter/index.tsx (or .vue, .svelte). Three channels ' +
  'connect them: props() sends a snapshot to the frontend on every render; ' +
  'useEntangle binds a public property in both directions; $wire calls ' +
  'actions such as save() on the server. Both halves derive the same id, ' +
  'Counter.';

type Half = {
  label: string;
  tag: string;
  title: string;
  sub: string;
  rows: [string, string, string];
};

const SERVER: Half = {
  label: 'SERVER',
  tag: 'LIVEWIRE COMPONENT',
  title: 'App\\Mesh\\Counter',
  sub: 'extends Mesh\\Component',
  rows: ['props(): array', 'public int $count', 'public function save()'],
};

const BROWSER: Half = {
  label: 'BROWSER',
  tag: 'REACT · VUE · SVELTE',
  title: 'mesh/Counter/index.tsx',
  sub: 'default export',
  rows: [
    'Counter({ ...props })',
    "useEntangle('count')",
    "wire.$call('save')",
  ],
};

/** One half: box, border label, header lines, divider, member rows. */
function HalfBox({
  half,
  x,
  y,
  w,
  h,
  rowYs,
}: {
  half: Half;
  x: number;
  y: number;
  w: number;
  h: number;
  rowYs: readonly number[];
}) {
  return (
    <g>
      <rect className={s.box} x={x} y={y} width={w} height={h} />
      <BorderLabel x={x + 8} y={y} text={half.label} />
      <text className={s.k} x={x + 14} y={y + 22}>
        {half.tag}
      </text>
      <text className={s.title} x={x + 14} y={y + 42}>
        {half.title}
      </text>
      <text className={s.sub} x={x + 14} y={y + 58}>
        {half.sub}
      </text>
      <path className="ln ln--fine" d={`M${x} ${y + 70}H${x + w}`} />
      {half.rows.map((row, i) => (
        <text key={row} className={s.code} x={x + 14} y={rowYs[i]}>
          {row}
        </text>
      ))}
    </g>
  );
}

function TagBox({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <rect className={s.box} x={x} y={y} width={w} height={40} />
      <BorderLabel x={x + 8} y={y} text="BLADE" />
      <text
        className={s.tagText}
        x={x + w / 2}
        y={y + 24.5}
        textAnchor="middle"
      >
        {'<mesh:counter />'}
      </text>
    </g>
  );
}

function Wide() {
  const channelYs = [192, 228, 264] as const;
  const rowYs = channelYs.map((y) => y + 4);

  return (
    <svg
      className={cn(s.svg, s.svgWide)}
      viewBox="0 0 640 330"
      role="img"
      aria-label={LABEL}
      data-draw=""
    >
      <TagBox x={220} y={18} w={200} />

      {/* One tag mounts both halves */}
      <path className="ln" d="M320 58V76" />
      <path className="ln" d="M117 96V76H523V96" />
      <circle className={s.dot} cx={320} cy={76} r={2.5} />
      <Arrow x={117} y={96} angle={90} />
      <Arrow x={523} y={96} angle={90} />

      <HalfBox half={SERVER} x={12} y={96} w={210} h={196} rowYs={rowYs} />
      <HalfBox half={BROWSER} x={418} y={96} w={210} h={196} rowYs={rowYs} />

      {/* Channel 1 · props(): server → browser */}
      <path className="ln" d={`M222 ${channelYs[0]}H418`} />
      <circle className={s.dot} cx={222} cy={channelYs[0]} r={2.5} />
      <Arrow x={418} y={channelYs[0]} angle={0} />
      <LineLabel x={320} y={channelYs[0]} text="PROPS · PER RENDER" />

      {/* Channel 2 · useEntangle: both ways */}
      <path className="ln" d={`M222 ${channelYs[1]}H418`} />
      <Arrow x={418} y={channelYs[1]} angle={0} />
      <Arrow x={222} y={channelYs[1]} angle={180} />
      <LineLabel x={320} y={channelYs[1]} text="ENTANGLE · TWO-WAY" />

      {/* Channel 3 · $wire: browser → server */}
      <path className="ln" d={`M222 ${channelYs[2]}H418`} />
      <circle className={s.dot} cx={418} cy={channelYs[2]} r={2.5} />
      <Arrow x={222} y={channelYs[2]} angle={180} />
      <LineLabel x={320} y={channelYs[2]} text="$WIRE · ACTIONS" />

      {/* The shared id, dimensioned across both halves */}
      <path className="ln ln--fine" d="M117 292V322M523 292V322" />
      <path className="ln ln--accent" d="M117 314H523" />
      <Arrow x={117} y={314} angle={180} className={s.arrowAccent} />
      <Arrow x={523} y={314} angle={0} className={s.arrowAccent} />
      <LineLabel
        x={320}
        y={314}
        text="SAME ID · Counter"
        textClassName={s.kAccent}
      />
    </svg>
  );
}

function Narrow() {
  const xs = [116, 196, 276] as const;

  return (
    <svg
      className={cn(s.svg, s.svgNarrow)}
      viewBox="0 0 340 472"
      role="img"
      aria-label={LABEL}
      data-draw=""
    >
      <TagBox x={84} y={16} w={172} />

      {/* One tag mounts both halves: a bus down the left margin */}
      <path className="ln" d="M84 36H12V388H24M12 156H24" />
      <circle className={s.dot} cx={12} cy={156} r={2.5} />
      <Arrow x={24} y={156} angle={0} />
      <Arrow x={24} y={388} angle={0} />

      <HalfBox
        half={SERVER}
        x={24}
        y={84}
        w={292}
        h={144}
        rowYs={[174, 192, 210]}
      />
      <HalfBox
        half={BROWSER}
        x={24}
        y={316}
        w={292}
        h={144}
        rowYs={[406, 424, 442]}
      />

      <path className="ln" d={`M${xs[0]} 228V316`} />
      <circle className={s.dot} cx={xs[0]} cy={228} r={2.5} />
      <Arrow x={xs[0]} y={316} angle={90} />
      <LineLabel x={xs[0]} y={272} text="PROPS" />

      <path className="ln" d={`M${xs[1]} 228V316`} />
      <Arrow x={xs[1]} y={316} angle={90} />
      <Arrow x={xs[1]} y={228} angle={-90} />
      <LineLabel x={xs[1]} y={272} text="ENTANGLE" />

      <path className="ln" d={`M${xs[2]} 228V316`} />
      <circle className={s.dot} cx={xs[2]} cy={316} r={2.5} />
      <Arrow x={xs[2]} y={228} angle={-90} />
      <LineLabel x={xs[2]} y={272} text="$WIRE" />

      <path className="ln ln--fine" d="M316 156H336M316 388H336" />
      <path className="ln ln--accent" d="M330 156V388" />
      <Arrow x={330} y={156} angle={-90} className={s.arrowAccent} />
      <Arrow x={330} y={388} angle={90} className={s.arrowAccent} />
      <LineLabel
        x={330}
        y={272}
        text="SAME ID · Counter"
        vertical
        textClassName={s.kAccent}
      />
    </svg>
  );
}

/**
 * Fig · One component, two halves, one tag. The PHP class and the frontend
 * entry, the three channels between them, and the id they share.
 */
export function MeshAnatomy() {
  return <Responsive wide={<Wide />} narrow={<Narrow />} />;
}

import { packageVersion } from './shared';

const paper = '#ECE9E2';
const ink = '#1D1C1A';
const ink2 = '#45423D';
const ink3 = '#66615A';
const accent = '#DD4F12';
const accentInk = '#A63A0A';

type Font = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600;
  style: 'normal';
};

async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}`;
  const css = await (await fetch(url)).text();
  const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!match) throw new Error(`Could not load ${family} ${weight}`);
  return (await fetch(match[1])).arrayBuffer();
}

let fontsPromise: Promise<Font[]> | null = null;

/**
 * Inter Tight + IBM Plex Mono for the cards. Fetched once per build; if the
 * network isn't there the card falls back to the default Satori font rather
 * than failing the build.
 */
export function loadOgFonts(): Promise<Font[]> {
  fontsPromise ??= Promise.all([
    loadGoogleFont('Inter Tight', 600).then((data) => ({
      name: 'Inter Tight',
      data,
      weight: 600 as const,
      style: 'normal' as const,
    })),
    loadGoogleFont('Inter Tight', 400).then((data) => ({
      name: 'Inter Tight',
      data,
      weight: 400 as const,
      style: 'normal' as const,
    })),
    loadGoogleFont('IBM Plex Mono', 400).then((data) => ({
      name: 'IBM Plex Mono',
      data,
      weight: 400 as const,
      style: 'normal' as const,
    })),
  ]).catch(() => []);

  return fontsPromise;
}

const mono = { fontFamily: 'IBM Plex Mono', letterSpacing: '0.1em' };

function Cell({ label, value, grow = 1 }: { label: string; value: string; grow?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: grow,
        flexBasis: 0,
        padding: '12px 16px 14px',
        background: paper,
        gap: 4,
      }}
    >
      <span style={{ ...mono, fontSize: 13, color: ink3, textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ ...mono, fontSize: 19, color: ink, letterSpacing: '0.02em' }}>{value}</span>
    </div>
  );
}

export function DraftingCard({
  kicker,
  title,
  description,
  drawingNo,
  sheet,
}: {
  kicker: string;
  title: string;
  description?: string;
  drawingNo: string;
  sheet: string;
}) {
  const zones = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: paper,
        backgroundImage: 'radial-gradient(circle, rgba(29,28,26,0.16) 1px, transparent 1.4px)',
        backgroundSize: '24px 24px',
        padding: 28,
        fontFamily: 'Inter Tight',
        color: ink,
      }}
    >
      {/* Zone rail */}
      <div style={{ display: 'flex', height: 24, marginBottom: 0 }}>
        {zones.map((zone) => (
          <div
            key={zone}
            style={{
              ...mono,
              display: 'flex',
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: 12,
              color: ink3,
            }}
          >
            {zone}
          </div>
        ))}
      </div>

      {/* Sheet */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          border: `2px solid ${ink}`,
          padding: '40px 52px 0',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              border: `2px solid ${ink}`,
              ...mono,
              letterSpacing: '0.04em',
              fontSize: 15,
              position: 'relative',
            }}
          >
            MS
            <div
              style={{
                position: 'absolute',
                right: -7,
                bottom: -7,
                width: 10,
                height: 10,
                background: accent,
              }}
            />
          </div>
          <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.01em' }}>Mesh</span>
          <span
            style={{
              ...mono,
              fontSize: 15,
              color: ink3,
              paddingLeft: 14,
              borderLeft: `1px solid rgba(29,28,26,0.28)`,
            }}
          >
            v{packageVersion}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', marginBottom: 36 }}>
          <span
            style={{ ...mono, fontSize: 17, color: accentInk, textTransform: 'uppercase', marginBottom: 14 }}
          >
            {kicker}
          </span>
          <span
            style={{
              fontSize: title.length > 28 ? 72 : 88,
              fontWeight: 600,
              letterSpacing: '-0.045em',
              lineHeight: 1,
              maxWidth: 1000,
            }}
          >
            {title}
          </span>
          {description ? (
            <span
              style={{
                marginTop: 22,
                fontSize: 28,
                lineHeight: 1.35,
                color: ink2,
                maxWidth: 940,
              }}
            >
              {description}
            </span>
          ) : null}
          {/* Rule with end ticks */}
          <div style={{ display: 'flex', position: 'relative', height: 2, background: ink, marginTop: 30 }}>
            <div style={{ position: 'absolute', left: 0, top: -6, width: 2, height: 14, background: ink }} />
            <div style={{ position: 'absolute', right: 0, top: -6, width: 2, height: 14, background: ink }} />
          </div>
        </div>

        {/* Title block */}
        <div
          style={{
            display: 'flex',
            gap: 1,
            background: ink,
            border: `1px solid ${ink}`,
            margin: '0 -52px',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: 'none',
          }}
        >
          <Cell label="Package" value="ethanbarlo/mesh" grow={2} />
          <Cell label="Renderers" value="React · Vue · Svelte" grow={2} />
          <Cell label="Dwg no." value={drawingNo} />
          <Cell label="Sheet" value={sheet} />
          <Cell label="Rev" value={packageVersion} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 22,
            right: 22,
            width: 16,
            height: 16,
            background: accent,
          }}
        />
      </div>
    </div>
  );
}

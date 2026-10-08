import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 16, ...props }: IconProps) {
  return {
    viewBox: '0 0 16 16',
    width: size,
    height: size,
    'aria-hidden': true as const,
    focusable: false as const,
    ...props,
  };
}

/** External link: the portfolio's ↗ stroke arrow. */
export function ExtIcon({ size = 12, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} aria-hidden="true" focusable="false" {...props}>
      <path d="M4 2.5h5.5V8M9.5 2.5 3 9" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2.5 8h10M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 3.5 5.5 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 12, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} aria-hidden="true" focusable="false" {...props}>
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ReplayIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5v2.8h2.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5.5" y="5.5" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <path d="M10.5 3.5V2.5h-8v8h1" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Search: a drafted lens, not a filled glyph. */
export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="7" cy="7" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <path d="M10.2 10.2 13.5 13.5" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function GitHubIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.08 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .32.21.69.82.57A12 12 0 0 0 12 .3"
      />
    </svg>
  );
}

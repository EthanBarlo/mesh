/**
 * The drawing register for the home page (MESH-000). One list feeds the
 * masthead nav, the index panel, the frame rails and each sheet head, so the
 * numbers can never drift apart.
 */
export type HomeSheet = {
  no: number;
  /** Section id, used for anchors and scroll-spy. */
  id: string;
  /** Short label for the nav and the frame rail tooltip. */
  label: string;
  /** Full sheet title (the hero sheet has none of its own). */
  title: string;
};

export const sheets: HomeSheet[] = [
  { no: 1, id: 'top', label: 'Title sheet', title: 'Title sheet' },
  { no: 2, id: 'anatomy', label: 'Anatomy', title: 'Anatomy of a component' },
  { no: 3, id: 'render', label: 'Render', title: 'How a render works' },
  { no: 4, id: 'channels', label: 'Channels', title: 'State channels' },
  { no: 5, id: 'ecosystem', label: 'Ecosystem', title: 'Use the ecosystem' },
  { no: 6, id: 'fit', label: 'Fit', title: 'When to reach for it' },
  { no: 7, id: 'install', label: 'Install', title: 'Install' },
];

export const sheetCount = sheets.length;

export const drawingNo = 'MESH-000';

export function sheetById(id: string): HomeSheet {
  const sheet = sheets.find((s) => s.id === id);
  if (!sheet) throw new Error(`Unknown home sheet "${id}"`);
  return sheet;
}

export function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** Zone letters across the frame, like a drawing border. */
export const zones = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

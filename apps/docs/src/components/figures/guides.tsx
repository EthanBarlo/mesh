import type { MDXComponents } from 'mdx/types';
import { EntangleTimeline } from './guides/entangle-timeline';
import { IslandComposition } from './guides/island-composition';

/**
 * MDX figures used by the Guides pages. Everything exported here is
 * available by name inside those MDX files (see components/mdx.tsx).
 */
export const guidesFigures = {
  EntangleTimeline,
  IslandComposition,
} satisfies MDXComponents;

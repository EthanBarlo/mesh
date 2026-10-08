import type { MDXComponents } from 'mdx/types';
import { IslandDom } from './reference/island-dom';
import { RendererContract } from './reference/renderer-contract';

/**
 * MDX figures used by the Frameworks, Reference and Advanced pages. Everything exported here is
 * available by name inside those MDX files (see components/mdx.tsx).
 */
export const referenceFigures = {
  IslandDom,
  RendererContract,
} satisfies MDXComponents;

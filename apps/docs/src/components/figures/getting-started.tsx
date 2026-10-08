import type { MDXComponents } from 'mdx/types';
import { IdDerivation } from './getting-started/id-derivation';
import { MeshAnatomy } from './getting-started/mesh-anatomy';
import { RenderLifecycle } from './getting-started/render-lifecycle';

/**
 * MDX figures used by the Getting started pages. Everything exported here is
 * available by name inside those MDX files (see components/mdx.tsx).
 *
 * - `<MeshAnatomy />`     one component, two halves, one tag (Introduction)
 * - `<IdDerivation />`    how both halves derive the same id (How it works)
 * - `<RenderLifecycle />` interactive render lifecycle stepper (How it works)
 */
export const gettingStartedFigures = {
  MeshAnatomy,
  IdDerivation,
  RenderLifecycle,
} satisfies MDXComponents;

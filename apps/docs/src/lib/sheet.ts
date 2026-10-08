import type * as PageTree from 'fumadocs-core/page-tree';
import { flattenTree } from 'fumadocs-core/page-tree';
import { source } from './source';

export type SheetInfo = {
  /** 1-based position of the page in the sidebar order. */
  number: number;
  total: number;
  /** The sidebar section the page sits under (separator or folder name). */
  section: string | null;
  drawingNo: string;
};

function nameToText(name: PageTree.Node['name']): string | null {
  return typeof name === 'string' ? name : null;
}

/**
 * Locate the section heading for a page: the closest folder containing it, or
 * failing that the last separator above it at the root of the tree.
 */
function findSection(nodes: PageTree.Node[], url: string): string | null {
  let separator: string | null = null;

  for (const node of nodes) {
    if (node.type === 'separator') {
      separator = nameToText(node.name);
      continue;
    }

    if (node.type === 'page' && node.url === url) {
      return separator;
    }

    if (node.type === 'folder') {
      const inFolder =
        node.index?.url === url ||
        flattenTree(node.children).some((item) => item.url === url);

      if (inFolder) {
        return nameToText(node.name) ?? separator;
      }
    }
  }

  return null;
}

export function getSheetInfo(url: string): SheetInfo {
  const tree = source.getPageTree();
  const pages = flattenTree(tree.children);
  const index = pages.findIndex((item) => item.url === url);
  const number = index === -1 ? 0 : index + 1;

  return {
    number,
    total: pages.length,
    section: findSection(tree.children, url),
    drawingNo: `MESH-${String(number).padStart(3, '0')}`,
  };
}

export function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

import type { ReactNode } from 'react';
import { Tabs } from 'fumadocs-ui/components/tabs';

export const frameworks = ['React', 'Vue', 'Svelte'] as const;

/**
 * Framework switcher for MDX. Every `<Frameworks>` on the site shares one
 * persisted choice, so picking Vue once flips every example to Vue.
 *
 * ```mdx
 * <Frameworks>
 *   <Tab value="React">…</Tab>
 *   <Tab value="Vue">…</Tab>
 *   <Tab value="Svelte">…</Tab>
 * </Frameworks>
 * ```
 */
export function Frameworks({
  children,
  items = [...frameworks],
}: {
  children: ReactNode;
  items?: string[];
}) {
  return (
    <Tabs groupId="framework" persist items={items} className="frameworks">
      {children}
    </Tabs>
  );
}

'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from 'fumadocs-ui/components/ui/tabs';

const options = [
  { value: 'react', label: 'React', ext: '.tsx' },
  { value: 'vue', label: 'Vue', ext: '.vue' },
  { value: 'svelte', label: 'Svelte', ext: '.svelte' },
] as const;

/**
 * Site-wide renderer choice, shown in the sidebar. It joins the same
 * persisted `framework` tab group as every `<Frameworks>` block, so switching
 * here flips every example on the page (and on later pages) at once.
 */
export function FrameworkSwitch() {
  const [value, setValue] = useState<string>('react');
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  return (
    <div className="fw-switch">
      <p className="fw-switch__k k k--caps" id="fw-switch-label">
        Renderer
        <span className="fw-switch__ext">index{options[index].ext}</span>
      </p>
      <Tabs groupId="framework" persist value={value} onValueChange={setValue}>
        <TabsList
          className="fw-switch__track"
          data-active={index}
          aria-labelledby="fw-switch-label"
        >
          {options.map((option) => (
            <TabsTrigger key={option.value} value={option.value} className="fw-switch__opt">
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

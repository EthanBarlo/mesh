import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { File, Files, Folder } from 'fumadocs-ui/components/files';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import type { MDXComponents } from 'mdx/types';
import { Callout } from '@/components/drafting/callout';
import { Figure } from '@/components/drafting/figure';
import { Frameworks } from '@/components/drafting/frameworks';
import { TitleBlock } from '@/components/drafting/title-block';
import { gettingStartedFigures } from '@/components/figures/getting-started';
import { guidesFigures } from '@/components/figures/guides';
import { referenceFigures } from '@/components/figures/reference';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...gettingStartedFigures,
    ...guidesFigures,
    ...referenceFigures,
    Callout,
    Tab,
    Tabs,
    Frameworks,
    Step,
    Steps,
    File,
    Files,
    Folder,
    TypeTable,
    Accordion,
    Accordions,
    Figure,
    TitleBlock,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}

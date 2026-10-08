import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * A drawing figure for MDX: a gridded stage with registration marks and a
 * numbered mono caption ("Fig. 3 · …"). Figures number themselves per page.
 */
export function Figure({
  caption,
  children,
  className,
  stageClassName,
}: {
  caption?: ReactNode;
  children: ReactNode;
  className?: string;
  stageClassName?: string;
}) {
  return (
    <figure className={cn('fig not-prose', className)}>
      <div className={cn('fig__stage', stageClassName)}>{children}</div>
      {caption ? <figcaption className="fig-cap k">{caption}</figcaption> : null}
    </figure>
  );
}

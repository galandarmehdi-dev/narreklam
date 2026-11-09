import type { ReactNode } from 'react';
import { Breadcrumbs, type Crumb } from './Breadcrumbs';
import { SplitText } from './Reveal';

/** Inner-page header with breadcrumbs, oversized title and seed-pattern decoration. */
export function PageHero({ crumbs, kicker, title, text, children, aside }: {
  crumbs?: Crumb[]; kicker?: string; title: string; text?: string; children?: ReactNode; aside?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-line bg-paper pt-28 pb-14 md:pt-36 md:pb-20">
      <div aria-hidden className="seeds pointer-events-none absolute -top-10 right-0 h-72 w-1/2 text-nar/15 [mask-image:radial-gradient(closest-side,black,transparent)]" />
      <div className="container-x relative">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-4xl">
            {kicker && <p className="kicker mb-5 text-mute">{kicker}</p>}
            <h1 className="h-page">
              <SplitText text={title} />
            </h1>
            {text && <p className="lead mt-6 max-w-2xl">{text}</p>}
            {children}
          </div>
          {aside}
        </div>
      </div>
    </header>
  );
}

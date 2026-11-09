import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

export function SectionHeading({
  kicker, title, text, action, tone = 'dark', className = '',
}: { kicker?: string; title: string; text?: string; action?: ReactNode; tone?: 'dark' | 'light'; className?: string }) {
  return (
    <div className={`mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between ${className}`}>
      <Reveal className="max-w-3xl">
        {kicker && <p className={`kicker mb-5 ${tone === 'light' ? 'text-white/70' : 'text-mute'}`}>{kicker}</p>}
        <h2 className={`h-section ${tone === 'light' ? 'text-white' : ''}`}>{title}</h2>
        {text && <p className={`mt-5 max-w-2xl text-lg ${tone === 'light' ? 'text-white/70' : 'text-mute'}`}>{text}</p>}
      </Reveal>
      {action && <Reveal delay={0.1}>{action}</Reveal>}
    </div>
  );
}

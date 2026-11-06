'use client';

import { usePathname } from 'next/navigation';

/*
   The small uppercase label above every modal title (style/css/dialogs.css,
   .app-dialog-eyebrow). Pass a label, or let it name the section of the site
   the modal was opened from: /crm/leads → "CRM", /lockers → "Lockers",
   / → "Today".
*/

// Words that aren't simple title case
const SPECIAL_WORDS: Record<string, string> = {
  crm: 'CRM',
  pos: 'Point of sale',
  ai: 'AI',
  ui: 'UI',
};

export function dialogAreaLabel(pathname: string | null): string {
  const firstSegment = (pathname ?? '').split('/').filter(Boolean)[0];
  if (!firstSegment) return 'Today';
  if (SPECIAL_WORDS[firstSegment]) return SPECIAL_WORDS[firstSegment];
  const words = firstSegment.split('-').map(word => SPECIAL_WORDS[word] ?? word);
  const text = words.join(' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function DialogEyebrow({ label }: { label?: string }) {
  const pathname = usePathname();
  return <p className="app-dialog-eyebrow">{label ?? dialogAreaLabel(pathname)}</p>;
}

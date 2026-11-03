import { redirect } from 'next/navigation';

// Preserve old experiment bookmarks; Sales is now the single pipeline entry.
export default async function RosterPage({ searchParams }: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q.trim() : '';
  redirect(query ? `/crm?${new URLSearchParams({ q: query })}` : '/crm');
}

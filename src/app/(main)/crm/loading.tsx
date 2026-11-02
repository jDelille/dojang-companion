export default function CrmLoading() {
  return (
    <div role="status" aria-label="Loading CRM records" className="crm-scope rounded-2xl border border-(--crm-line) bg-(--crm-panel) p-6">
      <p className="mb-5 text-sm text-(--crm-text-secondary)">Loading CRM records…</p>
      <div aria-hidden="true" className="grid gap-4 motion-safe:animate-pulse sm:grid-cols-3">
        {[0, 1, 2].map((column) => <div key={column} className="h-48 rounded-xl bg-(--crm-raised)" />)}
      </div>
    </div>
  );
}

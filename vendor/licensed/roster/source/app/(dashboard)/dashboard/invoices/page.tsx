import { requireWorkspace } from '@/lib/session';
import { InvoicesClient } from '@/components/invoices/invoices-client';

export const metadata = { title: 'Invoices' };

export default async function InvoicesPage() {
  const { workspace } = await requireWorkspace();
  return <InvoicesClient currency={workspace.currency} />;
}

import { requireWorkspace } from '@/lib/session';
import { can } from '@/lib/rbac';
import { LeadsClient } from '@/components/leads/leads-client';

export const metadata = { title: 'Leads' };

export default async function LeadsPage() {
  const { user } = await requireWorkspace();
  return <LeadsClient canGather={can(user.role, 'leads:gather')} />;
}

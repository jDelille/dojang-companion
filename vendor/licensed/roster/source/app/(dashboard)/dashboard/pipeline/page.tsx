import { requireWorkspace } from '@/lib/session';
import { PipelineBoard } from '@/components/pipeline/kanban';

export const metadata = { title: 'Pipeline' };

export default async function PipelinePage() {
  await requireWorkspace();
  return <PipelineBoard />;
}

import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/shell';
import { requireUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { can } from '@/lib/rbac';
import { brandStyle } from '@/lib/brand';
import { checkLicense } from '@/lib/license-gate';
import { getInstallState } from '@/lib/install';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // A fresh copy of the script should land on the installer, not a login loop.
  const install = await getInstallState();
  const userCount = await prisma.user.count().catch(() => 0);
  if (!install.completed && userCount === 0) redirect('/install');

  const user = await requireUser();
  if (!user.workspaceId) redirect('/onboarding');

  // License gate. Enforced here rather than in middleware so it runs after
  // authentication and has a workspace to check — and so the license page
  // itself, which is the only way out, stays reachable.
  // /license sits outside this route group precisely so this redirect cannot
  // trap the page that resolves it.
  const license = await checkLicense(user.workspaceId);
  if (!license.allowed) redirect('/license');

  const workspace = await prisma.workspace.findUnique({
    where: { id: user.workspaceId },
    select: { name: true, logoUrl: true, accentColor: true },
  });
  if (!workspace) redirect('/onboarding');

  const accentCss = brandStyle(workspace.accentColor);

  return (
    <>
      {/* White-label accent override, applied per workspace (spec §4.9).
          brandStyle derives the hover and on-accent text colors too, and
          returns '' for anything that is not a plain hex value. */}
      {accentCss && <style dangerouslySetInnerHTML={{ __html: accentCss }} />}
      <DashboardShell
        user={{ name: user.name ?? null, email: user.email, role: user.role }}
        workspace={workspace}
        showSuperAdmin={can(user.role, 'platform:admin')}
      >
        {children}
      </DashboardShell>
    </>
  );
}

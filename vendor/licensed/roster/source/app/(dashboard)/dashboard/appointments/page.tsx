import { requireWorkspace } from '@/lib/session';
import { can } from '@/lib/rbac';
import { isCalendarConfigured } from '@/lib/integrations/calendar';
import { AppointmentsClient } from '@/components/appointments/appointments-client';

export const metadata = { title: 'Appointments' };

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ calendar?: string; reason?: string }>;
}) {
  const { user } = await requireWorkspace();
  const params = await searchParams;

  // Resolved server-side: the connect buttons are plain links to an OAuth
  // route, so an unconfigured provider would navigate the whole window to a
  // raw JSON error. Knowing up front lets the client disable and explain.
  return (
    <AppointmentsClient
      calendarNotice={params.calendar}
      calendarReason={params.reason}
      googleConfigured={isCalendarConfigured('google')}
      outlookConfigured={isCalendarConfigured('outlook')}
      canManageCalendars={can(user.role, 'integrations:manage')}
    />
  );
}

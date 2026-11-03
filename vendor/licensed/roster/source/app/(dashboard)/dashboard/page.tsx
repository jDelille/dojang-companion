import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  ArrowRight,
  Bot,
  CalendarDays,
  Inbox,
  PhoneMissed,
  Search,
  Sparkles,
} from 'lucide-react';
import { requireWorkspace } from '@/lib/session';
import { prisma } from '@/lib/db';
import { getAnalyticsSummary, getLeadTimeseries } from '@/lib/analytics';
import { Badge, Card, CardBody, CardHeader, EmptyState, PageHeader } from '@/components/ui';
import { buttonStyles } from '@/components/ui/button-styles';
import { LineChart, StatTile, FunnelChart } from '@/components/charts';
import { formatCurrency, formatDate, relativeTime, truncate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Overview' };

export default async function DashboardPage() {
  const t = await getTranslations('overview');
  const { workspace, workspaceId } = await requireWorkspace();

  const [summary, timeseries, recentLeads, openConversations, upcoming, missedCalls, agent] =
    await Promise.all([
      getAnalyticsSummary(workspaceId, 30),
      getLeadTimeseries(workspaceId, 30),
      prisma.lead.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: { id: true, businessName: true, status: true, source: true, createdAt: true },
      }),
      prisma.conversation.findMany({
        where: { workspaceId, isOpen: true },
        orderBy: { lastMessageAt: 'desc' },
        take: 5,
        include: {
          contact: { select: { name: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { body: true } },
        },
      }),
      prisma.appointment.findMany({
        where: {
          workspaceId,
          startsAt: { gte: new Date() },
          status: { in: ['scheduled', 'confirmed'] },
        },
        orderBy: { startsAt: 'asc' },
        take: 5,
        include: { contact: { select: { name: true } } },
      }),
      prisma.call.count({
        where: { workspaceId, missed: true, createdAt: { gte: new Date(Date.now() - 7 * 86_400_000) } },
      }),
      prisma.aiAgent.findFirst({
        where: { workspaceId, isActive: true },
        orderBy: { isDefault: 'desc' },
        select: { id: true, name: true, provider: true, model: true },
      }),
    ]);

  return (
    <>
      <PageHeader
        title={`Good to see you, ${workspace.businessName || workspace.name}`}
        description={t('last30DaysAcrossEvery')}
        actions={
          <>
            <Link href="/dashboard/leads" className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
              <Search className="h-4 w-4" strokeWidth={1.75} />{t('findLeads')}</Link>
            <Link href="/dashboard/inbox" className={buttonStyles({ variant: 'primary', size: 'sm' })}>
              <Inbox className="h-4 w-4" strokeWidth={1.75} />{t('openInbox')}</Link>
          </>
        }
      />

      {!agent && (
        <Card className="mb-6 border-accent/40">
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 text-[color:var(--color-accent-dark)] dark:text-accent" strokeWidth={1.75} />
              <div>
                <p className="text-sm font-medium">{t('yourAiAgentIsNot')}</p>
                <p className="mt-0.5 text-xs muted">{t('setAPersonaPickA')}</p>
              </div>
            </div>
            <Link href="/dashboard/agents" className={buttonStyles({ variant: 'primary', size: 'sm' })}>
              Set up agent
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>
          </CardBody>
        </Card>
      )}

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={t('leadsGathered')}
          value={summary.leads.total}
          delta={summary.leads.delta}
          sparkline={timeseries.slice(-14).map((p) => p.gathered)}
        />
        <StatTile
          label={t('converted')}
          value={summary.leads.converted}
          delta={summary.leads.convertedDelta}
          hint={`${summary.leads.conversionRate.toFixed(1)}% conversion`}
        />
        <StatTile
          label={t('revenueAttributed')}
          value={formatCurrency(summary.revenue.total, workspace.currency)}
          delta={summary.revenue.delta}
          tone="accent"
        />
        <StatTile
          label={t('medianResponseTime')}
          value={
            summary.engagement.responseTimeMinutes
              ? `${summary.engagement.responseTimeMinutes}m`
              : '—'
          }
          hint={`${summary.engagement.conversations} conversations`}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LineChart
            title={t('leadsAndConversions')}
            description={t('dailyLast30Days')}
            series={[
              { label: 'Gathered', points: timeseries.map((p) => ({ x: p.x, y: p.gathered })) },
              { label: 'Converted', points: timeseries.map((p) => ({ x: p.x, y: p.converted })) },
            ]}
          />
        </div>
        <FunnelChart
          title={t('pipelineFunnel')}
          description={t('stageToStageConversion')}
          stages={summary.leads.funnel}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader
            title={t('latestLeads')}
            action={
              <Link href="/dashboard/leads" className="text-xs muted hover:text-[color:var(--color-fg)]">{t('viewAll')}</Link>
            }
          />
          {recentLeads.length ? (
            <ul className="divide-y divide-[color:var(--color-border)]">
              {recentLeads.map((lead) => (
                <li key={lead.id}>
                  <Link
                    href={`/dashboard/leads/${lead.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm">{lead.businessName}</span>
                      <span className="block text-xs muted">
                        {lead.source} · {relativeTime(lead.createdAt)}
                      </span>
                    </span>
                    <Badge tone={lead.status === 'won' ? 'success' : lead.status === 'lost' ? 'alert' : 'neutral'}>
                      {lead.status}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Search strokeWidth={1.75} />}
              title={t('noLeadsYet')}
              description={t('gatherLeadsFromGoogleMaps')}
            />
          )}
        </Card>

        <Card>
          <CardHeader
            title={t('openConversations')}
            action={
              <Link href="/dashboard/inbox" className="text-xs muted hover:text-[color:var(--color-fg)]">{t('inbox')}</Link>
            }
          />
          {openConversations.length ? (
            <ul className="divide-y divide-[color:var(--color-border)]">
              {openConversations.map((conversation) => (
                <li key={conversation.id}>
                  <Link
                    href={`/dashboard/inbox?conversation=${conversation.id}`}
                    className="block px-5 py-3 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm">
                        {conversation.contact?.name ?? 'Website visitor'}
                      </span>
                      {conversation.needsHuman && <Badge tone="warning">{t('needsYou')}</Badge>}
                    </span>
                    <span className="mt-0.5 block truncate text-xs muted">
                      {truncate(conversation.messages[0]?.body ?? 'No messages yet', 60)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<Inbox strokeWidth={1.75} />} title={t('inboxIsClear')} description={t('nothingWaitingOnYou')} />
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title={t('upcomingAppointments')}
              action={
                <Link
                  href="/dashboard/appointments"
                  className="text-xs muted hover:text-[color:var(--color-fg)]"
                >{t('calendar')}</Link>
              }
            />
            {upcoming.length ? (
              <ul className="divide-y divide-[color:var(--color-border)]">
                {upcoming.map((appointment) => (
                  <li key={appointment.id}>
                    <Link
                      href="/dashboard/appointments"
                      className="block px-5 py-3 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                    >
                      <span className="block truncate text-sm">{appointment.title}</span>
                      <span className="block text-xs muted">
                        {appointment.contact.name} · {formatDate(appointment.startsAt, true)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={<CalendarDays strokeWidth={1.75} />} title={t('nothingBooked')} />
            )}
          </Card>

          {missedCalls > 0 && (
            <Card>
              <Link
                href="/dashboard/calls?missed=1"
                className="flex items-start gap-3 p-5 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
              >
                <PhoneMissed className="mt-0.5 h-4 w-4 shrink-0 text-alert" strokeWidth={1.75} />
                <span>
                  <span className="block text-sm font-medium">
                    {missedCalls} missed call{missedCalls === 1 ? '' : 's'} this week
                  </span>
                  <span className="mt-0.5 block text-xs muted">{t('eachOneWasTextedBack')}</span>
                </span>
              </Link>
            </Card>
          )}

          {agent && (
            <Card>
              <CardBody className="flex items-start gap-3">
                <Bot className="mt-0.5 h-4 w-4 text-success" strokeWidth={1.75} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{agent.name} is live</p>
                  <p className="mt-0.5 truncate font-mono text-xs muted">
                    {agent.provider} · {agent.model}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

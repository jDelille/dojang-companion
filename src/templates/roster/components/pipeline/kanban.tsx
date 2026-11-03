// Migrated from Roster 1.0.0 components/pipeline/kanban.tsx.
// The original columns/cards/selector, native drag-and-drop, keyboard moves and
// UI kit are retained. Data comes from Hub props; vendor mutations and monetary
// guesses are removed.
//
// Moves stay on this board only. The Hub has no stage-change operation, so
// nothing is sent to Odoo: a moved card is marked "Not saved", the lead's real
// stage is shown on it, and Reset puts every card back.
'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, GripVertical, KanbanSquare, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge, EmptyState } from '../ui/data';
import { PageHeader } from '../ui/layout';
import { Select } from '../ui/form';
import { Modal } from '../ui/overlay';
import { cn } from '../../lib/utils';
import type { RosterPipeline } from '../../adapters/pipeline';

export function PipelineBoard({ data, showHeader = true, selection }: {
  data: RosterPipeline;
  showHeader?: boolean;
  selection?: { id: string | null; onSelect: (id: string) => void };
}) {
  const { stages, deals, partial } = data;
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const selectedId = selection ? selection.id : selected;
  const selectLead = selection ? selection.onSelect : setSelected;
  const editing = !selection && deals.find((deal) => deal.id === selected);
  const close = useCallback(() => setSelected(null), []);
  // Board-only moves: lead id -> the stage it was dragged to
  const [moves, setMoves] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  const realStages = stages.filter((stage) => !stage.display);
  const movedCount = deals.filter((deal) => moves[deal.id] && moves[deal.id] !== deal.stageId).length;

  function shownStage(deal: RosterPipeline['deals'][number]) {
    return moves[deal.id] ?? deal.stageId;
  }

  function moveDeal(dealId: string, stageId: string) {
    const deal = deals.find((each) => each.id === dealId);
    const target = stages.find((stage) => stage.id === stageId);
    // A made-up display group is never a place to move a lead to
    if (!deal || !target || target.display) return;
    setMoves((current) => {
      const next = { ...current };
      if (stageId === deal.stageId) delete next[dealId];
      else next[dealId] = stageId;
      return next;
    });
  }

  return (
    <>
      {showHeader && <PageHeader
        title="Roster pipeline"
        description={`${partial ? "At least " : ""}${deals.length} lead${deals.length === 1 ? '' : 's'} in this read across ${stages.length} displayed groups`}
        actions={
          <>
          <Button size="sm" onClick={() => router.refresh()}>Refresh records</Button>
          <Button variant="primary" size="sm" disabled title="Lead creation is not connected in this experiment">
            <Plus className="h-4 w-4" strokeWidth={1.75} />New lead</Button>
          </>
        }
      />}

      {stages.length === 0 ? (
        <Card>
          <EmptyState icon={<KanbanSquare strokeWidth={1.75} />} title="No pipeline stages in this read" description="Refresh the authoritative CRM read; no template stages will be seeded." />
        </Card>
      ) : (
        <>
        {movedCount > 0 && (
          <div role="status" className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[color:var(--color-warning)]/40 px-4 py-2 text-xs">
            <p>
              {movedCount} {movedCount === 1 ? 'card' : 'cards'} moved on this board only. Not saved to Odoo: the
              {movedCount === 1 ? " lead's" : " leads'"} real stage hasn&apos;t changed.
            </p>
            <Button size="sm" onClick={() => setMoves({})}>Reset board</Button>
          </div>
        )}
        <div className="scrollbar-thin relative -mx-1 flex gap-3 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageDeals = deals.filter((d) => shownStage(d) === stage.id);
            const isOver = overStage === stage.id && !stage.display;

            return (
              <div
                key={stage.id}
                onDragOver={(event) => {
                  if (stage.display) return;
                  event.preventDefault();
                  setOverStage(stage.id);
                }}
                onDragLeave={() => setOverStage((current) => (current === stage.id ? null : current))}
                onDrop={(event) => {
                  event.preventDefault();
                  setOverStage(null);
                  if (dragging) moveDeal(dragging, stage.id);
                  setDragging(null);
                }}
                className={cn(
                  'flex w-72 shrink-0 flex-col rounded-xl border bg-[color:var(--color-elevated)] transition-colors duration-150',
                  isOver ? 'border-[color:var(--color-accent)]' : 'border-[color:var(--color-border)]',
                )}
              >
                <div className="flex items-center justify-between gap-2 border-b border-[color:var(--color-border)] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: stage.color ?? 'var(--color-fg-muted)' }}
                      aria-hidden
                    />
                    <span className="text-sm font-medium">{stage.name}</span>
                    <span className="text-xs muted">{stageDeals.length}</span>
                  </div>

                </div>

                <div
                  role="list"
                  aria-label={`${stage.name} leads`}
                  className="scrollbar-thin min-h-[120px] flex-1 space-y-2 overflow-y-auto p-2"
                >
                  {stageDeals.map((deal) => {
                    const moved = shownStage(deal) !== deal.stageId;
                    return (
                    <article
                      key={deal.id}
                      draggable
                      tabIndex={0}
                      role="listitem"
                      aria-current={deal.id === selectedId ? 'true' : undefined}
                      aria-label={`${deal.title}, ${stage.name}${moved ? ', moved on this board only, not saved to Odoo' : ''}. Left and right arrows move it on the board, Enter previews this lead.`}
                      onDragStart={() => setDragging(deal.id)}
                      onDragEnd={() => {
                        setDragging(null);
                        setOverStage(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.target !== event.currentTarget) return;
                        // Drag is mouse-only, so the board keeps Roster's keyboard path
                        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                          event.preventDefault();
                          const index = realStages.findIndex((each) => each.id === shownStage(deal));
                          const target = index === -1 ? undefined : realStages[index + (event.key === 'ArrowRight' ? 1 : -1)];
                          if (target) moveDeal(deal.id, target.id);
                        }
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          selectLead(deal.id);
                        }
                      }}
                      onClick={(event) => {
                        if ((event.target as HTMLElement).closest('button, select, a')) return;
                        selectLead(deal.id);
                      }}
                      onDoubleClick={() => selectLead(deal.id)}
                      className={cn(
                        'group cursor-grab rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-3 transition-opacity active:cursor-grabbing',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]',
                        deal.id === selectedId && 'ring-1 ring-[color:var(--color-accent)]',
                        dragging === deal.id && 'opacity-50',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-snug">{deal.title}</p>
                        <GripVertical
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity muted group-hover:opacity-100"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </div>
                      {moved && (
                        <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] muted">
                          <Badge tone="warning">Not saved</Badge>
                          Odoo stage: {deal.stageName || 'none'}
                        </p>
                      )}
                      {deal.contact && (
                        <p className="mt-1 truncate text-xs muted">
                          {deal.contact.name}
                          {/* Business leads often have company === name; don't repeat it. */}
                          {deal.contact.company && deal.contact.company !== deal.contact.name
                            ? ` · ${deal.contact.company}`
                            : ''}
                        </p>
                      )}
                      {/* Roster's value/created row; the CRM contract has neither, so owner and source. */}
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <span className="text-xs font-medium tabular-nums">
                          {deal.owner}
                        </span>
                        <span className="truncate text-[11px] muted">{deal.source}</span>
                      </div>

                      {/* Touch fallback (Roster): drag isn't available on most tablets. Board only. */}
                      <Select
                        aria-label={`Move ${deal.title} on this board (not saved to Odoo)`}
                        value={shownStage(deal)}
                        onChange={(event) => moveDeal(deal.id, event.target.value)}
                        className="mt-2 h-7 text-[11px]"
                      >
                        {stages.filter((s) => !s.display || s.id === shownStage(deal)).map((s) => (
                          <option key={s.id} value={s.id} disabled={s.display}>
                            {s.name}
                          </option>
                        ))}
                      </Select>
                    </article>
                    );
                  })}

                  {!stageDeals.length && (
                    <p className="px-2 py-6 text-center text-xs muted">No leads in this stage</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}

      {editing && <Modal open onClose={close} title={editing.title} description="Authoritative lead summary. Use the existing lead workspace for governed actions." width="sm"
        footer={<><Button size="sm" onClick={close}>Close</Button><Link href={editing.href} className="inline-flex items-center gap-1 text-sm underline">Open lead workspace<ExternalLink className="h-3 w-3" aria-hidden /></Link></>}>
        <dl className="space-y-3 text-sm">
          <div><dt className="muted">Stage</dt><dd>{editing.stageName}</dd></div>
          <div><dt className="muted">Owner</dt><dd>{editing.owner}</dd></div>
          <div><dt className="muted">Contact</dt><dd>{editing.contact?.name || 'Not provided by this read'}</dd></div>
          <div><dt className="muted">Source</dt><dd>{editing.source || 'Not provided by this read'}</dd></div>
        </dl>
        <p className="mt-4 text-xs muted">Deal value, currency and creation date are not supplied by the current CRM contract. This view makes no estimate.</p>
        <Button className="mt-4" size="sm" onClick={() => router.refresh()}>Refresh authoritative records</Button>
      </Modal>}
    </>
  );
}

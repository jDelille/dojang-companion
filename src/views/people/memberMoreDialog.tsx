'use client';

import { Sparkles } from 'lucide-react';
import type { Member } from '@/domain/member';
import type { MemberTool } from './memberTools';
import MemberDialog from './memberDialog';

/*
   The "•••" window (dots-1.png, dot-2.png): "Work with <first name>", rows
   grouped under Open / Edit / Assist. Every row opens something that already
   exists on Member 360. Two extra groups at the bottom keep the remaining
   sections and reviewed actions reachable.
*/

type Row = { label: string; detail: string; onClick: () => void; disabled?: boolean; icon?: boolean };

// The tools that don't already have a row above
const OTHER_TOOLS: { tool: MemberTool; label: string; detail: string }[] = [
  { tool: 'change', label: 'Change a booking', detail: 'Move an existing booking to another class' },
  { tool: 'attendance', label: 'Staff attendance', detail: 'Record or correct attendance for a class' },
  { tool: 'checkout', label: 'Check out of class', detail: 'Close an open check-in' },
  { tool: 'rank', label: 'Rank / stripes', detail: 'Award a rank or stripes' },
  { tool: 'course', label: 'Course rosters', detail: 'Add or remove from a course roster' },
  { tool: 'waiver', label: 'Waiver', detail: 'Review or sign the waiver' },
  { tool: 'consent', label: 'Communication consent', detail: 'Record consent for each channel' },
  { tool: 'guardian', label: 'Guardian messaging', detail: 'Verify a guardian messaging channel' },
  { tool: 'pin', label: 'Guardian kiosk access', detail: 'Set up or revoke a guardian kiosk PIN' },
  { tool: 'archive', label: 'Archive student', detail: 'Review the impact, then archive' },
];

const OTHER_SECTIONS: { tab: string; detail: string }[] = [
  { tab: 'Training', detail: 'Program, rank and course rosters' },
  { tab: 'Bookings', detail: 'Registered upcoming sessions' },
  { tab: 'Notes', detail: 'Internal staff tasks' },
  { tab: 'Student setup', detail: 'Onboarding checklist' },
];

export default function MemberMoreDialog({ member, hubMode, onClose, onTab, onTool, onEdit, onPayment, onMessage, onDoForMe }: {
  member: Member;
  hubMode: boolean;
  onClose: () => void;
  onTab: (tab: string) => void;
  onTool: (tool: MemberTool) => void;
  onEdit: () => void;
  onPayment: () => void;
  onMessage: () => void;
  onDoForMe: () => void;
}) {
  const firstName = member.name.split(' ')[0];

  const groups: { heading: string; rows: Row[] }[] = [
    {
      heading: 'Open',
      rows: [
        { label: 'Member overview', detail: 'Identity, membership, attendance and readiness', onClick: () => onTab('Overview') },
        { label: 'Timeline', detail: 'Recent changes and recorded activity', onClick: () => onTab('Timeline') },
      ],
    },
    {
      heading: 'Edit',
      rows: [
        { label: 'Profile & training', detail: 'Name, contact details, program and instructor', onClick: onEdit, disabled: !hubMode },
        { label: 'Photo', detail: 'Replace or remove the member image', onClick: () => onTool('photo'), disabled: !hubMode },
        { label: 'Contract & billing', detail: 'Review current obligations in Odoo', onClick: onPayment },
      ],
    },
    {
      heading: 'Assist',
      rows: [
        { label: 'Do For Me', detail: 'Prepare governed work for review', onClick: onDoForMe, icon: true },
        { label: 'Create message', detail: 'Start from approved communication tools', onClick: onMessage, disabled: !hubMode },
      ],
    },
    {
      heading: 'More sections',
      rows: OTHER_SECTIONS.map(section => ({ label: section.tab, detail: section.detail, onClick: () => onTab(section.tab) })),
    },
  ];

  if (hubMode) {
    groups.push({
      heading: 'More actions',
      rows: OTHER_TOOLS.map(item => ({ label: item.label, detail: item.detail, onClick: () => onTool(item.tool) })),
    });
  }

  return (
    <MemberDialog
      eyebrow="Context menu"
      title={`Work with ${firstName}`}
      description="Actions stay attached to the member instead of opening a new page."
      onClose={onClose}
    >
      {groups.map(group => (
        <section key={group.heading} className="app-menu-group" aria-label={group.heading}>
          <h3 className="app-menu-heading">{group.heading}</h3>
          <div className="app-menu-rows">
            {group.rows.map(row => (
              <button key={row.label} type="button" className="app-menu-row" disabled={row.disabled} onClick={row.onClick}>
                <span className="app-menu-label">
                  {row.icon && <Sparkles size={14} aria-hidden="true" />}
                  {row.label}
                </span>
                <span className="app-menu-detail">{row.detail}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </MemberDialog>
  );
}

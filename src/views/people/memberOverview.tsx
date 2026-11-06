"use client";

import { LockKeyhole } from 'lucide-react';
import type { Member, MemberAttendance } from '@/domain/member';
import { membershipLabel } from '@/domain/member-presentation';
import { TimeLabel } from '@/views/crm/localTime';

/*
   Member 360 Overview: two cards side by side, laid out like do-for-me-2.png.
   Left: Member story (facts + Recent). Right: Training + Progression.
   Every value comes from the member read; missing ones say "Not available".
*/

const NOT_AVAILABLE = 'Not available';

export default function MemberOverview({ member, attendance, onTab }: {
  member: Member; attendance: MemberAttendance; onTab?: (tab: string) => void;
}) {
  const history = attendance.history?.slice(0, 3) ?? (attendance.latest ? [attendance.latest] : []);

  const facts = [
    ['Attendance', member.attendanceRate === undefined ? NOT_AVAILABLE : `${Math.round(member.attendanceRate * 100)}%`],
    ['Classes', member.classesAttended === undefined ? NOT_AVAILABLE : String(member.classesAttended)],
    ['Current rank', member.rank.name],
    ['Join date', member.joinedOn ?? NOT_AVAILABLE],
  ];

  const training = [
    ['Program', member.training?.program],
    ['Primary instructor', member.training?.primaryInstructor],
    ['Team', member.training?.team],
    ['Home location', member.training?.homeLocation],
  ];

  const rankText = `${member.rank.name}${member.rank.stripes === undefined ? '' : ` / ${member.rank.stripes} stripes`}`;

  return (
    <div className="member-profile-overview">
      <div className="member-profile-grid">
        <section className="member-profile-card" aria-label="Member story">
          <h2 className="member-profile-eyebrow">Member story</h2>
          <p className="member-profile-story">{membershipLabel(member)} student{member.rank.name ? ` / ${member.rank.name}` : ''}.</p>

          <dl className="member-profile-facts">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd className={value === NOT_AVAILABLE ? 'member-profile-unavailable' : ''}>{value}</dd>
              </div>
            ))}
          </dl>

          <div className="member-profile-recent">
            <h3 className="member-profile-eyebrow">Recent</h3>
            {history.length ? (
              <ul>
                {history.map((entry, index) => (
                  <li key={`${entry.checkedInAt}:${index}`} title={entry.sessionTitle}>
                    <span className="member-profile-event-date"><TimeLabel iso={entry.checkedInAt} /></span>
                    <span className="member-profile-event-text">Checked in{entry.late ? ' / Late' : ''}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="member-profile-source-note">
                {attendance.history === undefined ? 'Recent attendance is unavailable.' : 'No recent attendance.'}
              </p>
            )}
          </div>
        </section>

        <section className="member-profile-card" aria-label="Training and progression">
          <h2 className="member-profile-eyebrow">Training</h2>
          <dl className="member-profile-training">
            {training.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>
                  <span className={value === undefined ? 'member-profile-unavailable' : ''}>{value ?? NOT_AVAILABLE}</span>
                  <span className="member-profile-field-lock" title="Editing this field is not available through the current connection." role="img" aria-label={`${label}: editing unavailable`}>
                    <LockKeyhole size={12} aria-hidden="true" />
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="member-profile-progression">
            <h3 className="member-profile-eyebrow">Progression</h3>
            <div className="member-profile-rank-row">
              <span>Current rank</span>
              <strong>{rankText}</strong>
              <button type="button" className="member-profile-small-action" aria-label="Open progression" onClick={() => onTab?.('Progress')}>Open</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

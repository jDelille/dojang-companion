'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentIntake from '@/views/crm/studentIntake';
import ArchivedStudents from './archivedStudents';
import '@/templates/roster/roster.css';

export default function StudentIntakeLauncher({onOpenChange}:{onOpenChange?:(open:boolean)=>void} = {}) {
  const [open, setOpen] = useState(false);
  const [archived, setArchived] = useState(false);
  const router = useRouter();
  useEffect(()=>{onOpenChange?.(open||archived);},[open,archived,onOpenChange]);
  return <>
    <button type="button" onClick={() => setOpen(true)} className="w-full rounded-lg bg-(--crm-brand) px-3 py-2 text-[12px] font-bold text-white">Add prospective student</button>
    <button type="button" onClick={() => setArchived(true)} className="w-full text-left text-[12px] text-(--crm-text-secondary) underline underline-offset-4">Archived students / restore</button>
    {archived && <ArchivedStudents onClose={() => { setArchived(false); router.refresh(); }} />}
    {open && <StudentIntake destination="profile" onClose={() => { setOpen(false); router.refresh(); }} onCreated={value => { setOpen(false); router.push(`/people/${value.receipt.memberId}`); router.refresh(); }} />}
  </>;
}

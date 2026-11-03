import { requireWorkspace } from '@/lib/session';
import { ContactsClient } from '@/components/contacts/contacts-client';

export const metadata = { title: 'Contacts' };

export default async function ContactsPage() {
  await requireWorkspace();
  return <ContactsClient />;
}

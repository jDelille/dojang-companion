import { getPageMetadata } from "@/config/metadata";
import { hubEnabled } from "@/server/hub-gateway";
import InboxClient from "@/views/inbox/inboxClient";

// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Inbox");
};


// /inbox?message=4001 opens that message (Roster's ?conversation= deep link)
export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string | string[] }>;
}) {
  const { message } = await searchParams;
  const initialMessageId = typeof message === "string" ? message : null;
  // Where /api/hub answers from: the real Hub (Odoo, read-only) or the development fixtures
  const source = hubEnabled() ? "hub" : "fixture";
  return <InboxClient initialMessageId={initialMessageId} source={source} />;
}

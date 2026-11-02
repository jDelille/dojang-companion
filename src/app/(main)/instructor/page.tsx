import { getPageMetadata } from "@/config/metadata";
import { hubEnabled } from "@/server/hub-gateway";
import InstructorWorkspace from "@/views/instructor/instructorWorkspace";

// Which data source answers is decided per request, never at build time
export const dynamic = "force-dynamic";

// This runs on the server
export const generateMetadata = () => {
  return getPageMetadata("Instructor");
};

// The Instructor workspace (the Instructor Perspective's default dashboard):
// today's classes and their rosters are read in the browser through /api/hub
// (views/instructor/instructorWorkspace.tsx), like Today and Front Desk.
// Read-only; who sees which classes is Odoo's grant, not this page.
export default function InstructorPage() {
  const source = hubEnabled() ? "hub" : "fixture";
  return <InstructorWorkspace source={source} />;
}

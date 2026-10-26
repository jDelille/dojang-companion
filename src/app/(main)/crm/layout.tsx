import "@/style/css/crm.css";

// CRM / Sales pages: loads the Dojang CRM tokens. The page itself sits in the
// normal DreamOS shell from (main)/layout.tsx.
export default function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

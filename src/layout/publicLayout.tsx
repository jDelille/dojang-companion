import AppShell from "./appShell";

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <AppShell>{children}</AppShell>
);

export default PublicLayout;

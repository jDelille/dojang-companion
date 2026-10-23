import PublicLayout from "@/layout/publicLayout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayout>{children}</PublicLayout>;
}

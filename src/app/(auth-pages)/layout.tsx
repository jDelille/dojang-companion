import AuthLayout from "@/layout/authLayout";

export default function AuthPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}

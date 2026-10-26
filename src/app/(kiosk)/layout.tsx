import KioskLayout from "@/layout/kioskLayout";
import "@/style/css/kiosk.css";

export default function KioskGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <KioskLayout>{children}</KioskLayout>;
}

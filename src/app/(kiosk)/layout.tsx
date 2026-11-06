import KioskLayout from "@/layout/kioskLayout";
import "@/style/css/kiosk.css";
import '@/views/kiosk/daniel/tokens.css';
import '@/views/kiosk/daniel/base.css';

export default function KioskGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <KioskLayout>{children}</KioskLayout>;
}

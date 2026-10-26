import type { Metadata, Viewport } from "next";
import { SCHOOL_NAME } from "@/domain/kiosk/kioskConfig";
import KioskClient from "./kioskClient";

// Public screen: not the staff dashboard's title template, and not for search engines
export const metadata: Metadata = {
  title: { absolute: `${SCHOOL_NAME} · Check in` },
  description: "Public check-in kiosk",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  viewportFit: "cover", // the shell pads itself with the safe-area insets
  themeColor: "#08080a", // = --kiosk-canvas (a meta tag cannot read CSS variables)
};

export default function Kiosk() {
  return <KioskClient />;
}

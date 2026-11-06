import type { Metadata } from "next";
import "@/style/icons/@phosphor-icons/web/duotone/style.css";
import "@/style/icons/@phosphor-icons/web/regular/style.css";
import "@/style/icons/@phosphor-icons/web/fill/style.css";
import "@/style/icons/lucide-static/font/lucide.css";
import "@/style/icons/@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@/style/icons/@fortawesome/fontawesome-free/css/all.min.css";
import "@/style/css/style.css";
import "./globals.css";
// One look for every modal on the site (after style.css so it wins)
import "@/style/css/dialogs.css";
import ReduxProvider from "@/providers/ReduxProvider";
import LayoutSync from "@/providers/LayoutSync";
import PrelineInit from "@/providers/PrelineInit";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { getPageMetadata } from "@/config/metadata";

export const metadata: Metadata = getPageMetadata("Dashboard");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark hd-auto">
      <head>
        <link rel="icon" type="image/png" href="/assets/img/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
        />
      </head>
      <body>
        <ReduxProvider>
          <ThemeProvider>
            <LayoutSync />
            <PrelineInit />
            {children}
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

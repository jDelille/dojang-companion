import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        // Dojang staff start on Today (C01). The template's demo login stays at
        // /login; staff sign in with their Odoo login via the Hub.
        source: "/",
        destination: "/today",
        permanent: false, // 307 Temporary Redirect
      },
      {
        // The sidebar's Check-In opens the Dojang public kiosk. The template's
        // staff check-in demo stays in src/app/(main)/checkin, unreachable for now.
        source: "/checkin",
        destination: "/kiosk",
        permanent: false, // 307 Temporary Redirect
      },
    ];
  },
};

export default nextConfig;

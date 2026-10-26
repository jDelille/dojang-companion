import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        // Dojang staff start on People until Today (C01) exists. The template's
        // demo login stays at /login; staff sign-in will be the Odoo login via the Hub.
        source: "/",
        destination: "/people",
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

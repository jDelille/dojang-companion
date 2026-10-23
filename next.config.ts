import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: false, // 307 Temporary Redirect
      },
    ];
  },
};

export default nextConfig;

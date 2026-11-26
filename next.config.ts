import type { NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  reactStrictMode: true,
  // Let phones and other devices on the home LAN open the dev server.
  allowedDevOrigins: ["192.168.1.*"],
};

export default config;

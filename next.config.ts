import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
};

export default withPWA({
  dest: "public",
  disable: false, // Enable PWA in development for testing
})(nextConfig);

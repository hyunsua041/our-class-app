import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["heic-convert", "heic-decode", "libheif-js"],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  adapterPath: require.resolve("@vercel/next/dist/adapter"),
};

export default nextConfig;

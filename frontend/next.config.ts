import type { NextConfig } from "next";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/uploads/blogs/:path*",
        destination: "http://localhost:3001/uploads/blogs/:path*",
      },
      {
        source: "/uploads/avatars/:path*",
        destination: "http://localhost:3001/uploads/avatars/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/blogs/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/avatars/**",
      },
    ],
  },
};
export default nextConfig;

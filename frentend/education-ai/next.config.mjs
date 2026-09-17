/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!backendUrl && process.env.VERCEL) {
      throw new Error(
        "NEXT_PUBLIC_API_URL must be configured in Vercel with the public backend URL.",
      );
    }
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${(backendUrl || "http://127.0.0.1:8000").replace(/\/$/, "")}/:path*`,
      },
    ];
  },
}

export default nextConfig

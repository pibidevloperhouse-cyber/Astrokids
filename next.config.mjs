/** @type {import('next').NextConfig} */
const getSiteUrl = () => {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL ||
    process.env.NEXTAUTH_URL ||
    "https://astrokids-six.vercel.app";

  let url = String(raw).trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url.replace(/\/+$/, "");
};

const siteUrl = getSiteUrl();

const nextConfig = {
  env: {
    NEXT_PUBLIC_SITE_URL: siteUrl,
    NEXT_PUBLIC_VERCEL_URL: siteUrl,
    VERCEL_URL: siteUrl,
    NEXTAUTH_URL: siteUrl,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.usercontent.google.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      }
    ],
  },
};

export default nextConfig;

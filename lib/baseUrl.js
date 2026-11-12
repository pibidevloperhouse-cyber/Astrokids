/**
 * Helper to dynamically get the site's base URL from environment variables.
 * Falls back to "https://astrokids-six.vercel.app" if not configured.
 */
export function getBaseUrl() {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    process.env.NEXTAUTH_URL ||
    "https://astrokids-six.vercel.app";

  let fullUrl = String(url).trim();
  if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
    fullUrl = `https://${fullUrl}`;
  }
  return fullUrl.replace(/\/+$/, "");
}

export const BASE_URL = getBaseUrl();
export default getBaseUrl;


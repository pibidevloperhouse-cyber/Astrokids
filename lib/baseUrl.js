export function getBaseUrl() {
  const url =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://astrokids-six.vercel.app";

  let fullUrl = String(url).trim();

  if (
    !fullUrl.startsWith("http://") &&
    !fullUrl.startsWith("https://")
  ) {
    fullUrl = `https://${fullUrl}`;
  }

  return fullUrl.replace(/\/+$/, "");
}

export const BASE_URL = getBaseUrl();

export default getBaseUrl;
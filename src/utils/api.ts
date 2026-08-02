// Helper to get full API URL for both Web and Mobile Capacitor APK environments
export function getApiUrl(endpoint: string): string {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // If custom API base URL is defined
  if (import.meta.env.VITE_API_BASE_URL) {
    const base = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
    return `${base}${path}`;
  }

  // Detect if running inside Capacitor Android APK or local static environment
  if (typeof window !== "undefined") {
    const origin = window.location.origin || "";
    const protocol = window.location.protocol || "";
    if (
      origin.includes("capacitor://") ||
      origin.includes("localhost") ||
      protocol === "file:"
    ) {
      // Fallback to live Cloud Run backend server so APK reaches AI backend
      return `https://ais-pre-ttyxf2hsihbzjmi2j2elfa-631968782736.asia-northeast1.run.app${path}`;
    }
  }

  // Standard web relative path
  return path;
}

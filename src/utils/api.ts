// Default live backend URL for exported native mobile APKs (Capacitor/Cordova/Android WebView)
const LIVE_BACKEND_URL = "https://ais-pre-ttyxf2hsihbzjmi2j2elfa-631968782736.asia-northeast1.run.app";

/**
 * Helper to get full API URL for both Web and Mobile Capacitor APK environments.
 * Ensures mobile APKs installed on Android/iOS direct AI requests to the Cloud Run server
 * instead of attempting to hit localhost on the mobile phone.
 */
export function getApiUrl(endpoint: string): string {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // 1. If custom API base URL is defined in environment variables (e.g. VITE_API_BASE_URL)
  const metaEnv = (import.meta as Record<string, any>).env;
  if (metaEnv && metaEnv.VITE_API_BASE_URL) {
    const base = metaEnv.VITE_API_BASE_URL.replace(/\/$/, "");
    return `${base}${path}`;
  }

  if (typeof window !== "undefined") {
    const win = window as any;
    const origin = window.location.origin || "";
    const hostname = window.location.hostname || "";
    const port = window.location.port || "";
    const protocol = window.location.protocol || "";

    // Check for native Capacitor / Cordova / WebView indicators
    const isCapacitor = !!win.Capacitor?.isNativePlatform?.() || !!win.Capacitor;
    const isFileProtocol = protocol === "file:";
    const isCustomAppScheme = origin.startsWith("capacitor:") || origin.startsWith("ionic:");
    
    // In mobile APKs, the webview runs locally at http://localhost, https://localhost, or file://
    // while Vite local dev server runs on port 3000 and Cloud Run ends with .run.app
    const isLocalhostWebView = (hostname === "localhost" || hostname === "127.0.0.1") && port !== "3000";
    const isExternalMobileApp = !hostname.endsWith(".run.app") && port !== "3000";

    if (isCapacitor || isFileProtocol || isCustomAppScheme || isLocalhostWebView || isExternalMobileApp) {
      // Direct request to the Cloud Run server hosting the Express Gemini backend
      return `${LIVE_BACKEND_URL}${path}`;
    }
  }

  // Standard relative path for Cloud Run web browser & local dev server (port 3000)
  return path;
}

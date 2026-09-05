// Local (`npm run dev`): leave empty → Vite proxies /api to http://127.0.0.1:5050
// Netlify production: use Render backend
const PROD_API = "https://auction-backend-9bgs.onrender.com";

function resolveApiOrigin() {
  const fromEnv = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  // Production build on Netlify (or any live host) → Render
  if (import.meta.env.PROD) {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") return "";
    }
    return PROD_API;
  }

  // Local Vite dev → same-origin /api (proxied)
  return "";
}

const apiOrigin = resolveApiOrigin();
const API_BASE = `${apiOrigin}/api`;
const UPLOADS = apiOrigin;

export { API_BASE };

function token(role) {
  return localStorage.getItem(role === "admin" ? "admin_token" : "user_token");
}

export async function api(path, { method = "GET", body, auth, isForm } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (auth) headers.Authorization = `Bearer ${token(auth)}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export function fileUrl(name) {
  return name ? `${UPLOADS}/uploads/${name}` : "";
}

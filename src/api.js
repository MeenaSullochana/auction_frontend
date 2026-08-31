const PROD_API = "https://auction-backend-9bgs.onrender.com";
const apiOrigin = (
  import.meta.env.VITE_API_URL
  || (import.meta.env.PROD && typeof window !== "undefined" && window.location.hostname.includes("netlify.app")
    ? PROD_API
    : "")
).replace(/\/$/, "");
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

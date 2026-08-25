const API = "/api";

function token(role) {
  return localStorage.getItem(role === "admin" ? "admin_token" : "user_token");
}

export async function api(path, { method = "GET", body, auth, isForm } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (auth) headers.Authorization = `Bearer ${token(auth)}`;
  const res = await fetch(`${API}${path}`, {
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
  return name ? `/uploads/${name}` : "";
}

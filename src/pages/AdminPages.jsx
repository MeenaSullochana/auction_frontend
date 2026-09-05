import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { api, API_BASE } from "../api";
import { applyTheme, DEFAULT_SITE, useSite } from "../site";

function fmt(d) {
  if (!d) return "";
  return new Date(String(d).replace(" ", "T")).toLocaleString();
}

function toLocalInput(d) {
  if (!d) return "";
  const s = String(d).replace(" ", "T");
  try {
    const dt = new Date(s);
    if (isNaN(dt.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  } catch {
    return "";
  }
}

function fromLocalInput(v) {
  if (!v) return "";
  return v.replace("T", " ") + ":00";
}

const ICON_OPTIONS = [
  { value: "las la-gavel", label: "Gavel" },
  { value: "las la-industry", label: "Industry" },
  { value: "las la-boxes", label: "Boxes" },
  { value: "las la-tags", label: "Tags" },
  { value: "las la-cogs", label: "Cogs" },
  { value: "las la-car", label: "Car / Vehicle" },
  { value: "las la-recycle", label: "Recycle" },
  { value: "las la-tools", label: "Tools" },
  { value: "las la-warehouse", label: "Warehouse" },
  { value: "las la-truck", label: "Truck" },
  { value: "las la-building", label: "Building" },
  { value: "las la-laptop", label: "Electronics" },
  { value: "las la-gem", label: "Gem / Precious" },
  { value: "las la-hand-holding-usd", label: "Finance" },
  { value: "las la-archive", label: "Archive" },
];

function IconSelect({ value, onChange, label }) {
  return (
    <div className="field">
      <label>{label || "Icon"}</label>
      <select value={value} onChange={onChange}>
        {ICON_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function BrandSettings() {
  const { refresh } = useSite();
  const [form, setForm] = useState({ ...DEFAULT_SITE });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    api("/admin/settings", { auth: "admin" })
      .then((d) => setForm({ ...DEFAULT_SITE, ...(d.settings || {}) }))
      .catch((e) => setErr(e.message));
  }, []);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div>
      <h2>Logo &amp; Colors</h2>
      <p className="lead">Update logo text and colors. Changes apply on the public site, user panel, and admin panel.</p>
      {msg && <div className="alert ok">{msg}</div>}
      {err && <div className="alert err">{err}</div>}
      <div className="logo-preview">
        <span className="wordmark hero">
          <span className="w-the" style={{ color: form.colorThe }}>{form.wordThe || "THE"}</span>
          <span className="w-auction" style={{ color: form.colorAuction }}>{form.wordAuction || "AUCTION"}</span>
          <span className="w-house" style={{ color: form.colorHouse }}>{form.wordHouse || "HOUSE"}</span>
        </span>
      </div>
      <form
        className="card"
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg("");
          setErr("");
          try {
            const d = await api("/admin/settings", { method: "PUT", body: form, auth: "admin" });
            setForm({ ...DEFAULT_SITE, ...(d.settings || form) });
            applyTheme(d.settings || form);
            await refresh();
            setMsg(d.message || "Saved");
          } catch (ex) {
            setErr(ex.message);
          }
        }}
      >
        <h3 style={{ marginTop: 0 }}>Logo text</h3>
        <div className="form-grid">
          <div className="field"><label>Word 1 (THE)</label><input value={form.wordThe} onChange={(e) => set("wordThe", e.target.value)} required /></div>
          <div className="field"><label>Word 2 (AUCTION)</label><input value={form.wordAuction} onChange={(e) => set("wordAuction", e.target.value)} required /></div>
          <div className="field"><label>Word 3 (HOUSE)</label><input value={form.wordHouse} onChange={(e) => set("wordHouse", e.target.value)} required /></div>
        </div>
        <h3>Logo colors</h3>
        <div className="form-grid">
          <div className="field"><label>THE color</label><div className="color-row"><input type="color" value={form.colorThe} onChange={(e) => set("colorThe", e.target.value)} /><input value={form.colorThe} onChange={(e) => set("colorThe", e.target.value)} /></div></div>
          <div className="field"><label>AUCTION color</label><div className="color-row"><input type="color" value={form.colorAuction} onChange={(e) => set("colorAuction", e.target.value)} /><input value={form.colorAuction} onChange={(e) => set("colorAuction", e.target.value)} /></div></div>
          <div className="field"><label>HOUSE color</label><div className="color-row"><input type="color" value={form.colorHouse} onChange={(e) => set("colorHouse", e.target.value)} /><input value={form.colorHouse} onChange={(e) => set("colorHouse", e.target.value)} /></div></div>
        </div>
        <h3>Site theme colors</h3>
        <div className="form-grid">
          <div className="field"><label>Background (black)</label><div className="color-row"><input type="color" value={form.colorBg} onChange={(e) => set("colorBg", e.target.value)} /><input value={form.colorBg} onChange={(e) => set("colorBg", e.target.value)} /></div></div>
          <div className="field"><label>Panel</label><div className="color-row"><input type="color" value={form.colorPanel} onChange={(e) => set("colorPanel", e.target.value)} /><input value={form.colorPanel} onChange={(e) => set("colorPanel", e.target.value)} /></div></div>
          <div className="field"><label>Accent green</label><div className="color-row"><input type="color" value={form.colorAccent} onChange={(e) => set("colorAccent", e.target.value)} /><input value={form.colorAccent} onChange={(e) => set("colorAccent", e.target.value)} /></div></div>
          <div className="field"><label>Accent light</label><div className="color-row"><input type="color" value={form.colorAccent2} onChange={(e) => set("colorAccent2", e.target.value)} /><input value={form.colorAccent2} onChange={(e) => set("colorAccent2", e.target.value)} /></div></div>
          <div className="field"><label>Text (white)</label><div className="color-row"><input type="color" value={form.colorText} onChange={(e) => set("colorText", e.target.value)} /><input value={form.colorText} onChange={(e) => set("colorText", e.target.value)} /></div></div>
          <div className="field"><label>Muted text</label><div className="color-row"><input type="color" value={form.colorMuted} onChange={(e) => set("colorMuted", e.target.value)} /><input value={form.colorMuted} onChange={(e) => set("colorMuted", e.target.value)} /></div></div>
        </div>
        <button className="btn btn-gold" style={{ marginTop: 16 }}>Save Brand Settings</button>
      </form>
    </div>
  );
}

export function AdminDash() {
  const [s, setS] = useState({});
  useEffect(() => { api("/admin/dashboard", { auth: "admin" }).then(setS); }, []);
  return (
    <div>
      <h2>Dashboard</h2>
      <div className="grid-4">
        <div className="stat card"><b>{s.users || 0}</b>Users</div>
        <div className="stat card"><b>{s.pending || 0}</b>Pending Users</div>
        <div className="stat card"><b>{s.liveAuctions || 0}</b>Live Auctions</div>
        <div className="stat card"><b>{s.bids || 0}</b>Bids</div>
      </div>
    </div>
  );
}

export function Categories() {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("las la-tags");
  const load = () => api("/admin/categories", { auth: "admin" }).then((d) => setRows(d.categories));
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h2>Categories</h2>
      <form className="card" style={{ marginBottom: 16 }} onSubmit={async (e) => {
        e.preventDefault();
        await api("/admin/categories", { method: "POST", body: { name, icon }, auth: "admin" });
        setName(""); load();
      }}>
        <div className="form-grid">
          <div className="field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <IconSelect value={icon} onChange={(e) => setIcon(e.target.value)} />
        </div>
        <button className="btn btn-gold" style={{ marginTop: 12 }}>Save</button>
      </form>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Icon</th><th>Name</th><th>Status</th></tr></thead>
          <tbody>{rows.map((c) => (
            <tr key={c.id}>
              <td><i className={c.icon} style={{ fontSize: 20 }} /></td>
              <td>{c.name}</td>
              <td>{c.status ? "Active" : "Inactive"}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

export function Auctions() {
  const { type = "all" } = useParams();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name: "", icon: "las la-gavel", started_at: "", expired_at: "", status: 1 });
  const load = () => api(`/admin/auctions/${type}`, { auth: "admin" }).then((d) => setRows(d.auctions));
  useEffect(() => { load(); }, [type]);
  return (
    <div>
      <h2>{type} Auctions</h2>
      <form className="card" style={{ marginBottom: 16 }} onSubmit={async (e) => {
        e.preventDefault();
        await api("/admin/auctions", { method: "POST", body: form, auth: "admin" });
        load();
      }}>
        <div className="form-grid">
          <div className="field"><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <IconSelect value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          <div className="field"><label>Open</label><input type="datetime-local" required value={toLocalInput(form.started_at)} onChange={(e) => setForm({ ...form, started_at: fromLocalInput(e.target.value) })} /></div>
          <div className="field"><label>Close</label><input type="datetime-local" required value={toLocalInput(form.expired_at)} onChange={(e) => setForm({ ...form, expired_at: fromLocalInput(e.target.value) })} /></div>
        </div>
        <button className="btn btn-gold" style={{ marginTop: 12 }}>Create Auction</button>
      </form>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Icon</th><th>Name</th><th>Open</th><th>Close</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td><i className={a.icon} style={{ fontSize: 20 }} /></td>
                <td><Link className="link" to={`/admin/products/auction?auction_id=${a.id}`}>{a.name}</Link></td>
                <td>{fmt(a.started_at)}</td>
                <td>{fmt(a.expired_at)}</td>
                <td>{a.status ? "Active" : "Inactive"}</td>
                <td>
                  <Link className="link" to={`/admin/products/AuctionWise?auction_id=${a.id}`}>Products</Link>{" "}
                  <Link className="link" to={`/admin/products/unsold?auction_id=${a.id}`}>Unsold</Link>{" "}
                  <a className="link" href={`/api/admin/auctions/${a.id}/sold/excel`} onClick={(e) => {
                    e.preventDefault();
                    download(`/admin/auctions/${a.id}/sold/excel`, `${a.name}SoldProduct.xlsx`);
                  }}>Sold Excel</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function download(path, filename) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` } });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function Products() {
  const { type = "all" } = useParams();
  const auction_id = new URLSearchParams(window.location.search).get("auction_id");
  const [rows, setRows] = useState([]);
  const load = () => {
    const q = auction_id ? `?auction_id=${auction_id}` : "";
    api(`/admin/products/${type}${q}`, { auth: "admin" }).then((d) => setRows(d.products));
  };
  useEffect(() => { load(); }, [type, auction_id]);
  return (
    <div>
      <div className="toolbar">
        <h2>{type} Products</h2>
        <Link className="btn btn-gold" to="/admin/products/add">Add Product</Link>
      </div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Code</th><th>Name</th><th>Price</th><th>Qty</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>{p.code}</td>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.quantity}</td>
                <td>{p.status ? "Active" : "Pending"}</td>
                <td>
                  <Link className="link" to={`/admin/products/edit/${p.id}`}>Edit</Link>{" "}
                  <Link className="link" to={`/admin/products/${p.id}/bids`}>Bids</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProductForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lookups, setLookups] = useState({ categories: [], auctions: [] });
  const [form, setForm] = useState({ name: "", category: "", auction: "", price: "", min_bid_amount: "", code: "", condition: "", location: "", excise_duty: "", sales_duty: "", quantity: 0, started_at: "", expired_at: "" });
  const [image, setImage] = useState(null);
  useEffect(() => {
    api("/admin/lookups", { auth: "admin" }).then(setLookups);
    if (mode === "edit" && id) {
      api(`/admin/product/${id}`, { auth: "admin" }).then((d) => {
        const p = d.product;
        setForm({
          name: p.name, category: p.category_id, auction: p.auction_id, price: p.price, min_bid_amount: p.min_bid_amount,
          code: p.code, condition: p.condition || "", location: p.location || "", excise_duty: p.excise_duty || "",
          sales_duty: p.sales_duty || "", quantity: p.quantity, started_at: p.started_at || "", expired_at: p.expired_at || "",
        });
      });
    }
  }, [mode, id]);
  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append("image", image);
    if (mode === "edit") await api(`/admin/products/${id}`, { method: "PUT", body: fd, auth: "admin", isForm: true });
    else await api("/admin/products", { method: "POST", body: fd, auth: "admin", isForm: true });
    navigate("/admin/products/all");
  };
  return (
    <div>
      <h2>{mode === "edit" ? "Update Product" : "Create Product"}</h2>
      <form className="card" onSubmit={submit}>
        <div className="form-grid">
          <div className="field"><label>Image</label><input type="file" accept=".png,.jpg,.jpeg" onChange={(e) => setImage(e.target.files[0])} /></div>
          <div className="field"><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>Category</label>
            <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select One</option>
              {lookups.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Auction Name</label>
            <select required value={form.auction} onChange={(e) => setForm({ ...form, auction: e.target.value })}>
              <option value="">Select One</option>
              {lookups.auctions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Price</label><input type="number" required min="0" step="any" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          <div className="field"><label>Min Bid Increment Amount</label><input type="number" required min="0" step="any" value={form.min_bid_amount} onChange={(e) => setForm({ ...form, min_bid_amount: e.target.value })} /></div>
          <div className="field"><label>Enter Product Code</label><input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
          <div className="field"><label>Quantity</label><input required type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
          <div className="field"><label>Condition <span style={{ color: "var(--muted)", fontSize: 11 }}>(optional)</span></label><input value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} placeholder="e.g. Used - Good" /></div>
          <div className="field"><label>Location <span style={{ color: "var(--muted)", fontSize: 11 }}>(optional)</span></label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Chennai Yard" /></div>
          <div className="field"><label>Excise Duty (%) <span style={{ color: "var(--muted)", fontSize: 11 }}>(optional)</span></label><input type="number" min="0" step="any" value={form.excise_duty} onChange={(e) => setForm({ ...form, excise_duty: e.target.value })} placeholder="e.g. 12" /></div>
          <div className="field"><label>Sales Duty (%) <span style={{ color: "var(--muted)", fontSize: 11 }}>(optional)</span></label><input type="number" min="0" step="any" value={form.sales_duty} onChange={(e) => setForm({ ...form, sales_duty: e.target.value })} placeholder="e.g. 18" /></div>
          <div className="field"><label>Open Date &amp; Time</label><input type="datetime-local" required value={toLocalInput(form.started_at)} onChange={(e) => setForm({ ...form, started_at: fromLocalInput(e.target.value) })} /></div>
          <div className="field"><label>Close Date &amp; Time</label><input type="datetime-local" required value={toLocalInput(form.expired_at)} onChange={(e) => setForm({ ...form, expired_at: fromLocalInput(e.target.value) })} /></div>
        </div>
        <button className="btn btn-gold" style={{ marginTop: 16 }}>Save</button>
      </form>
    </div>
  );
}

export function ImportProducts() {
  const [lookups, setLookups] = useState({ categories: [], auctions: [] });
  const [form, setForm] = useState({ category: "", auction: "", started_at: "", expired_at: "" });
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  useEffect(() => { api("/admin/lookups", { auth: "admin" }).then(setLookups); }, []);
  return (
    <div>
      <div className="toolbar">
        <h2>Import Product</h2>
        <button
          type="button"
          className="btn btn-gold"
          onClick={() => download("/admin/products/import/sample/excel", "ProductImportSample.xlsx")}
        >
          Download Sample Excel
        </button>
      </div>
      {msg && <div className="alert ok">{msg}</div>}
      <form className="card" onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        fd.append("import_file", file);
        const d = await api("/admin/products/import", { method: "POST", body: fd, auth: "admin", isForm: true });
        setMsg(d.message);
      }}>
        <div className="form-grid">
          <div className="field"><label>Category</label>
            <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select One</option>
              {lookups.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Auction</label>
            <select required value={form.auction} onChange={(e) => setForm({ ...form, auction: e.target.value })}>
              <option value="">Select One</option>
              {lookups.auctions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Open Date &amp; Time</label><input type="datetime-local" required value={toLocalInput(form.started_at)} onChange={(e) => setForm({ ...form, started_at: fromLocalInput(e.target.value) })} /></div>
          <div className="field"><label>Close Date &amp; Time</label><input type="datetime-local" required value={toLocalInput(form.expired_at)} onChange={(e) => setForm({ ...form, expired_at: fromLocalInput(e.target.value) })} /></div>
          <div className="field full"><label>Excel file</label><input type="file" required onChange={(e) => setFile(e.target.files[0])} /></div>
        </div>
        <button className="btn btn-gold" style={{ marginTop: 16 }}>Import</button>
      </form>
    </div>
  );
}

export function ProductBids() {
  const { id } = useParams();
  const [data, setData] = useState({ transactions: [] });
  useEffect(() => { api(`/admin/products/${id}/bids`, { auth: "admin" }).then(setData); }, [id]);
  return (
    <div>
      <div className="toolbar">
        <h2>{data.product?.name} Bids</h2>
        <button className="btn btn-gold" onClick={() => download(`/admin/products/${id}/bids/excel`, "ProductBids.xlsx")}>Excel</button>
      </div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>User</th><th>Amount</th><th>Agent</th><th>TRX</th></tr></thead>
          <tbody>
            {data.transactions.map((t) => (
              <tr key={t.id}><td>{t.username}</td><td>{t.amount}</td><td>{t.agent_amount}</td><td>{t.trx}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Winners() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api("/admin/winners", { auth: "admin" }).then((d) => setRows(d.winners || [])); }, []);
  return (
    <div className="admin-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Results</p>
          <h2>Winners</h2>
          <p className="lead">Highest bids locked per product after close.</p>
        </div>
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Code</th>
              <th>Vendor</th>
              <th>Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.id}>
                <td>{w.product_name}</td>
                <td>{w.code}</td>
                <td>{w.username}</td>
                <td>{w.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="empty-note">No winners recorded yet.</p>}
      </div>
    </div>
  );
}

export function Users() {
  const { scope = "all" } = useParams();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const load = () => api(`/admin/users/${scope}${search ? `?search=${encodeURIComponent(search)}` : ""}`, { auth: "admin" }).then((d) => setRows(d.users || []));
  useEffect(() => { load(); }, [scope]);
  return (
    <div className="admin-page">
      <div className="toolbar page-head">
        <div>
          <p className="eyebrow">Vendors</p>
          <h2>{scope === "all" ? "All vendors" : `${scope} vendors`}</h2>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <form onSubmit={(e) => { e.preventDefault(); load(); }} style={{ display: "flex", gap: 8 }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search firm / email / mobile" />
            <button className="btn soft-toggle" type="submit">Search</button>
          </form>
          <Link className="btn btn-gold" to="/admin/vendors/new">Add vendor</Link>
        </div>
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Unique ID</th>
              <th>Firm</th>
              <th>Contact</th>
              <th>Username</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td><Link className="link" to={`/admin/vendors/${u.id}`}>{u.unique_id || u.id}</Link></td>
                <td>{u.firm_name || "-"}</td>
                <td>{u.contact_person || `${u.firstname || ""} ${u.lastname || ""}`.trim() || "-"}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.contact_no || u.mobile || "-"}</td>
                <td>{u.status ? "Active" : "Inactive"}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={7}><p className="empty-note">No vendors found.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function UserDetail() {
  const { id } = useParams();
  return <Navigate to={`/admin/vendors/${id}`} replace />;
}

export function Contacts() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api("/admin/contacts", { auth: "admin" }).then((d) => setRows(d.contacts || [])); }, []);
  return (
    <div className="admin-page">
      <h2>Contact Enquiries</h2>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Firm</th>
              <th>Contact person</th>
              <th>Contact no</th>
              <th>Email</th>
              <th>Address</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>{c.firm_name || "-"}</td>
                <td>{c.contact_person || c.name || "-"}</td>
                <td>{c.contact_no || "-"}</td>
                <td>{c.email}</td>
                <td>{c.address || "-"}</td>
                <td>{c.message}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={6}><p className="empty-note">No enquiries yet.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

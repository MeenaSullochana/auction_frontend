import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { api, fileUrl } from "../api";

function MultiFilePicker({ label, accept, files, setFiles }) {
  const previews = useMemo(
    () =>
      (files || []).map((f, i) => ({
        key: `${f.name}-${i}`,
        name: f.name,
        isImage: String(f.type || "").startsWith("image/"),
        url: URL.createObjectURL(f),
      })),
    [files]
  );

  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  return (
    <div className="field full">
      <label>{label}</label>
      <input
        type="file"
        multiple
        accept={accept}
        onChange={(e) => setFiles([...(files || []), ...Array.from(e.target.files || [])])}
      />
      {!!previews.length && (
        <div className="file-preview-grid">
          {previews.map((p, idx) => (
            <div className="file-preview" key={p.key}>
              {p.isImage ? <img src={p.url} alt={p.name} /> : <span className="file-chip">{p.name}</span>}
              <button type="button" className="text-btn" onClick={() => setFiles(files.filter((_, i) => i !== idx))}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SavedFiles({ title, items }) {
  if (!items?.length) return null;
  return (
    <div className="saved-files">
      <p className="empty-note" style={{ marginBottom: 8 }}>{title}</p>
      <div className="file-preview-grid">
        {items.map((f) => (
          <a className="file-preview" key={f.filename} href={fileUrl(f.filename)} target="_blank" rel="noreferrer">
            {String(f.mimetype || "").startsWith("image/") || f.kind === "image" ? (
              <img src={fileUrl(f.filename)} alt={f.originalname || f.filename} />
            ) : (
              <span className="file-chip">{f.originalname || f.filename}</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

export function Vendors() {
  return <Navigate to="/admin/users/all" replace />;
}

const emptyVendor = {
  username: "",
  password: "",
  email: "",
  name: "",
  firm_name: "",
  address: "",
  contact_person: "",
  contact_no: "",
  alternate_contact_no: "",
  gst_no: "",
  pan_no: "",
  validation_status: "Pending",
  status: "1",
};

export function VendorCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyVendor);
  const [docs, setDocs] = useState([]);
  const [images, setImages] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="admin-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Vendors</p>
          <h2>Add vendor</h2>
          <p className="lead">Create a login vendor with firm details, documents and images.</p>
        </div>
        <button type="button" className="btn soft-toggle" onClick={() => navigate("/admin/users/all")}>Back to list</button>
      </div>
      {msg && <div className="alert ok">{msg}</div>}
      {err && <div className="alert err">{err}</div>}

      <form
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg("");
          setErr("");
          try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, val]) => fd.append(k, val ?? ""));
            fd.append("contact_email", form.email || "");
            docs.forEach((f) => fd.append("documents", f));
            images.forEach((f) => fd.append("images", f));
            const d = await api("/admin/vendors", { method: "POST", body: fd, auth: "admin", isForm: true });
            setMsg(d.message || "Vendor added");
            const id = d.vendor?.id;
            if (id) navigate(`/admin/vendors/${id}`);
            else navigate("/admin/users/all");
          } catch (ex) {
            setErr(ex.message);
          }
        }}
      >
        <div className="form-grid premium-grid">
          <div className="field"><label>Username *</label><input required minLength={6} value={form.username} onChange={(e) => set("username", e.target.value)} /></div>
          <div className="field"><label>Password *</label><input type="password" required minLength={6} value={form.password} onChange={(e) => set("password", e.target.value)} /></div>
          <div className="field"><label>Email *</label><input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="field"><label>Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
          <div className="field"><label>Name</label><input value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="field"><label>Firm Name *</label><input required value={form.firm_name} onChange={(e) => set("firm_name", e.target.value)} /></div>
          <div className="field full"><label>Address *</label><input required value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
          <div className="field"><label>Contact Person *</label><input required value={form.contact_person} onChange={(e) => set("contact_person", e.target.value)} /></div>
          <div className="field"><label>Contact No *</label><input required value={form.contact_no} onChange={(e) => set("contact_no", e.target.value)} /></div>
          <div className="field"><label>Alternate Contact</label><input value={form.alternate_contact_no} onChange={(e) => set("alternate_contact_no", e.target.value)} /></div>
          <div className="field"><label>GST No</label><input value={form.gst_no} onChange={(e) => set("gst_no", e.target.value)} /></div>
          <div className="field"><label>PAN No</label><input value={form.pan_no} onChange={(e) => set("pan_no", e.target.value)} /></div>
          <div className="field"><label>Validation</label>
            <select value={form.validation_status} onChange={(e) => set("validation_status", e.target.value)}>
              <option>Pending</option>
              <option>Validated</option>
              <option>Rejected</option>
            </select>
          </div>
          <MultiFilePicker label="Documents" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" files={docs} setFiles={setDocs} />
          <MultiFilePicker label="Images" accept="image/*" files={images} setFiles={setImages} />
        </div>
        <div className="action-row">
          <button className="btn btn-primary-soft" type="submit">Create vendor</button>
        </div>
      </form>
    </div>
  );
}

export function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [docs, setDocs] = useState([]);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const load = () =>
    api(`/admin/vendors/${id}`, { auth: "admin" }).then((d) => {
      setData(d);
      const v = d.vendor;
      setForm({
        name: v.name || `${v.firstname || ""} ${v.lastname || ""}`.trim(),
        firm_name: v.firm_name || v.username || "",
        address: v.address || "",
        contact_person: v.contact_person || `${v.firstname || ""} ${v.lastname || ""}`.trim() || v.username || "",
        contact_no: v.contact_no || v.mobile || "",
        alternate_contact_no: v.alternate_contact_no || "",
        email: v.email || v.contact_email || "",
        username: v.username || "",
        password: "",
        gst_no: v.gst_no || "",
        pan_no: v.pan_no || "",
        validation_status: v.validation_status || "Pending",
        status: String(v.status ?? 1),
      });
    });

  useEffect(() => { load().catch((e) => setErr(e.message)); }, [id]);

  if (err && !data) return <div className="alert err">{err}</div>;
  if (!data || !form) return <p>Loading...</p>;
  const v = data.vendor;

  return (
    <div className="admin-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Vendor detail</p>
          <h2>{v.firm_name || v.username}</h2>
          <p className="lead">Unique ID: {v.unique_id || "-"} · Login: {v.username}</p>
        </div>
        <button type="button" className="btn soft-toggle" onClick={() => navigate("/admin/users/all")}>Back to list</button>
      </div>
      {msg && <div className="alert ok">{msg}</div>}
      {err && <div className="alert err">{err}</div>}

      <form
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg("");
          setErr("");
          try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, val]) => {
              if (k === "password" && !val) return;
              fd.append(k, val ?? "");
            });
            fd.append("contact_email", form.email || "");
            docs.forEach((f) => fd.append("documents", f));
            images.forEach((f) => fd.append("images", f));
            const d = await api(`/admin/vendors/${id}`, { method: "POST", body: fd, auth: "admin", isForm: true });
            setMsg(d.message || "Updated");
            setDocs([]);
            setImages([]);
            load();
          } catch (ex) {
            setErr(ex.message);
          }
        }}
      >
        <div className="form-grid premium-grid">
          <div className="field"><label>Username</label><input value={form.username} onChange={(e) => set("username", e.target.value)} /></div>
          <div className="field"><label>New password (optional)</label><input type="password" minLength={6} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Leave blank to keep" /></div>
          <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="field"><label>Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
          <div className="field"><label>Name</label><input value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="field"><label>Firm Name</label><input required value={form.firm_name} onChange={(e) => set("firm_name", e.target.value)} /></div>
          <div className="field full"><label>Address</label><input required value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
          <div className="field"><label>Contact Person</label><input required value={form.contact_person} onChange={(e) => set("contact_person", e.target.value)} /></div>
          <div className="field"><label>Contact No</label><input required value={form.contact_no} onChange={(e) => set("contact_no", e.target.value)} /></div>
          <div className="field"><label>Alternate Contact</label><input value={form.alternate_contact_no} onChange={(e) => set("alternate_contact_no", e.target.value)} /></div>
          <div className="field"><label>GST No</label><input value={form.gst_no} onChange={(e) => set("gst_no", e.target.value)} /></div>
          <div className="field"><label>PAN No</label><input value={form.pan_no} onChange={(e) => set("pan_no", e.target.value)} /></div>
          <div className="field"><label>Validation</label>
            <select value={form.validation_status} onChange={(e) => set("validation_status", e.target.value)}>
              <option>Pending</option>
              <option>Validated</option>
              <option>Rejected</option>
            </select>
          </div>
          <MultiFilePicker label="Add documents" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" files={docs} setFiles={setDocs} />
          <MultiFilePicker label="Add images" accept="image/*" files={images} setFiles={setImages} />
        </div>
        <SavedFiles title="Saved documents" items={v.documents} />
        <SavedFiles title="Saved images" items={v.images} />
        <div className="action-row">
          <button className="btn btn-primary-soft" type="submit">Update vendor</button>
        </div>
      </form>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Assign auctions</h3>
            <p>Checked auctions appear in this vendor&apos;s login.</p>
          </div>
        </div>
        <div className="form-grid">
          {(data.auctions || []).map((a) => {
            let ids = [];
            try {
              ids = JSON.parse(a.assign_user || "[]").map(Number);
            } catch {
              ids = [];
            }
            const checked = ids.includes(Number(id));
            return (
              <label key={a.id} className="field" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  defaultChecked={checked}
                  onChange={async (e) => {
                    await api("/admin/auction-assign", {
                      method: "POST",
                      body: { user_id: Number(id), user_check: e.target.checked ? 1 : 0, auction_id: a.id },
                      auth: "admin",
                    });
                  }}
                />
                <span>{a.name} {a.unique_id ? `(${a.unique_id})` : ""}</span>
              </label>
            );
          })}
          {!data.auctions?.length && <p className="empty-note">No auctions yet.</p>}
        </div>
      </div>
    </div>
  );
}

const emptyCompany = {
  firm_name: "", address: "", gst_no: "", pan_no: "",
  contact_l1_name: "", contact_l1_no: "", contact_l1_email: "",
  contact_l2_name: "", contact_l2_no: "", contact_l2_email: "",
  contact_l3_name: "", contact_l3_no: "", contact_l3_email: "",
  finance_contact_person: "", finance_email: "", validation_status: "Pending",
};

export function Companies() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);
  const [docs, setDocs] = useState([]);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({ ...emptyCompany });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const load = () => api("/admin/companies", { auth: "admin" }).then((d) => setRows(d.companies || []));
  useEffect(() => { load(); }, []);

  return (
    <div className="admin-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Partners</p>
          <h2>Companies / Corporate</h2>
        </div>
        <button type="button" className="btn btn-primary-soft" onClick={() => setShow(true)}>+ Add Company</button>
      </div>
      {msg && <div className="alert ok">{msg}</div>}
      {err && <div className="alert err">{err}</div>}

      {show && (
        <form
          className="panel expand-panel"
          onSubmit={async (e) => {
            e.preventDefault();
            setMsg("");
            setErr("");
            try {
              const fd = new FormData();
              Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
              docs.forEach((f) => fd.append("documents", f));
              images.forEach((f) => fd.append("images", f));
              const d = await api("/admin/companies", { method: "POST", body: fd, auth: "admin", isForm: true });
              setMsg(`Company saved — Unique ID: ${d.company?.unique_id || ""}`);
              setShow(false);
              setDocs([]);
              setImages([]);
              setForm({ ...emptyCompany });
              load();
            } catch (ex) {
              setErr(ex.message || "Save failed");
            }
          }}
        >
          <div className="panel-head">
            <div>
              <h3>Company / Corporate enrolment</h3>
              <p>Separate from vendor login accounts. Use View for full detail.</p>
            </div>
            <button type="button" className="btn soft-toggle" onClick={() => setShow(false)}>Close</button>
          </div>
          <div className="form-grid premium-grid">
            <div className="field"><label>Firm Name *</label><input required value={form.firm_name} onChange={(e) => set("firm_name", e.target.value)} /></div>
            <div className="field"><label>GST No *</label><input required value={form.gst_no} onChange={(e) => set("gst_no", e.target.value)} /></div>
            <div className="field"><label>PAN No</label><input value={form.pan_no} onChange={(e) => set("pan_no", e.target.value)} /></div>
            <div className="field full"><label>Address</label><input value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
            <div className="field"><label>L1 Contact name</label><input value={form.contact_l1_name} onChange={(e) => set("contact_l1_name", e.target.value)} /></div>
            <div className="field"><label>L1 Contact no</label><input value={form.contact_l1_no} onChange={(e) => set("contact_l1_no", e.target.value)} /></div>
            <div className="field"><label>L1 Email</label><input type="email" value={form.contact_l1_email} onChange={(e) => set("contact_l1_email", e.target.value)} /></div>
            <div className="field"><label>L2 Contact name</label><input value={form.contact_l2_name} onChange={(e) => set("contact_l2_name", e.target.value)} /></div>
            <div className="field"><label>L2 Contact no</label><input value={form.contact_l2_no} onChange={(e) => set("contact_l2_no", e.target.value)} /></div>
            <div className="field"><label>L2 Email</label><input type="email" value={form.contact_l2_email} onChange={(e) => set("contact_l2_email", e.target.value)} /></div>
            <div className="field"><label>L3 Contact name</label><input value={form.contact_l3_name} onChange={(e) => set("contact_l3_name", e.target.value)} /></div>
            <div className="field"><label>L3 Contact no</label><input value={form.contact_l3_no} onChange={(e) => set("contact_l3_no", e.target.value)} /></div>
            <div className="field"><label>L3 Email</label><input type="email" value={form.contact_l3_email} onChange={(e) => set("contact_l3_email", e.target.value)} /></div>
            <div className="field"><label>Finance Contact</label><input value={form.finance_contact_person} onChange={(e) => set("finance_contact_person", e.target.value)} /></div>
            <div className="field"><label>Finance Email</label><input type="email" value={form.finance_email} onChange={(e) => set("finance_email", e.target.value)} /></div>
            <MultiFilePicker label="Documents" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" files={docs} setFiles={setDocs} />
            <MultiFilePicker label="Images" accept="image/*" files={images} setFiles={setImages} />
          </div>
          <div className="action-row">
            <button className="btn btn-primary-soft" type="submit">Save Company</button>
          </div>
        </form>
      )}

      <div className="panel table-wrap">
        <table className="soft-table">
          <thead>
            <tr>
              <th>Unique ID</th>
              <th>Firm</th>
              <th>GST</th>
              <th>L1</th>
              <th>Finance</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>{c.unique_id}</td>
                <td>{c.firm_name}</td>
                <td>{c.gst_no}</td>
                <td>{c.contact_l1_no || c.contact_l1_email || "-"}</td>
                <td>{c.finance_email || c.finance_contact_person || "-"}</td>
                <td><span className="status-pill">{c.validation_status}</span></td>
                <td><Link className="btn soft-toggle" to={`/admin/companies/${c.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="empty-note">No companies yet.</p>}
      </div>
    </div>
  );
}

export function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [docs, setDocs] = useState([]);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const load = () =>
    api(`/admin/companies/${id}`, { auth: "admin" }).then((d) => {
      setCompany(d.company);
      const c = d.company;
      setForm({
        firm_name: c.firm_name || "",
        address: c.address || "",
        gst_no: c.gst_no || "",
        pan_no: c.pan_no || "",
        contact_l1_name: c.contact_l1_name || "",
        contact_l1_no: c.contact_l1_no || "",
        contact_l1_email: c.contact_l1_email || "",
        contact_l2_name: c.contact_l2_name || "",
        contact_l2_no: c.contact_l2_no || "",
        contact_l2_email: c.contact_l2_email || "",
        contact_l3_name: c.contact_l3_name || "",
        contact_l3_no: c.contact_l3_no || "",
        contact_l3_email: c.contact_l3_email || "",
        finance_contact_person: c.finance_contact_person || "",
        finance_email: c.finance_email || "",
        validation_status: c.validation_status || "Pending",
      });
    });

  useEffect(() => { load().catch((e) => setErr(e.message)); }, [id]);
  if (err && !company) return <div className="alert err">{err}</div>;
  if (!company || !form) return <p>Loading...</p>;

  return (
    <div className="admin-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Company detail</p>
          <h2>{company.firm_name}</h2>
          <p className="lead">Unique ID: {company.unique_id}</p>
        </div>
        <button type="button" className="btn soft-toggle" onClick={() => navigate("/admin/companies")}>Back to list</button>
      </div>
      {msg && <div className="alert ok">{msg}</div>}
      {err && <div className="alert err">{err}</div>}

      <form
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg("");
          setErr("");
          try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
            docs.forEach((f) => fd.append("documents", f));
            images.forEach((f) => fd.append("images", f));
            const d = await api(`/admin/companies/${id}`, { method: "POST", body: fd, auth: "admin", isForm: true });
            setMsg(d.message || "Updated");
            setDocs([]);
            setImages([]);
            load();
          } catch (ex) {
            setErr(ex.message);
          }
        }}
      >
        <div className="form-grid premium-grid">
          <div className="field"><label>Firm Name</label><input required value={form.firm_name} onChange={(e) => set("firm_name", e.target.value)} /></div>
          <div className="field"><label>GST No</label><input required value={form.gst_no} onChange={(e) => set("gst_no", e.target.value)} /></div>
          <div className="field"><label>PAN No</label><input value={form.pan_no} onChange={(e) => set("pan_no", e.target.value)} /></div>
          <div className="field full"><label>Address</label><input value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
          <div className="field"><label>L1 name</label><input value={form.contact_l1_name} onChange={(e) => set("contact_l1_name", e.target.value)} /></div>
          <div className="field"><label>L1 no</label><input value={form.contact_l1_no} onChange={(e) => set("contact_l1_no", e.target.value)} /></div>
          <div className="field"><label>L1 email</label><input value={form.contact_l1_email} onChange={(e) => set("contact_l1_email", e.target.value)} /></div>
          <div className="field"><label>L2 name</label><input value={form.contact_l2_name} onChange={(e) => set("contact_l2_name", e.target.value)} /></div>
          <div className="field"><label>L2 no</label><input value={form.contact_l2_no} onChange={(e) => set("contact_l2_no", e.target.value)} /></div>
          <div className="field"><label>L2 email</label><input value={form.contact_l2_email} onChange={(e) => set("contact_l2_email", e.target.value)} /></div>
          <div className="field"><label>L3 name</label><input value={form.contact_l3_name} onChange={(e) => set("contact_l3_name", e.target.value)} /></div>
          <div className="field"><label>L3 no</label><input value={form.contact_l3_no} onChange={(e) => set("contact_l3_no", e.target.value)} /></div>
          <div className="field"><label>L3 email</label><input value={form.contact_l3_email} onChange={(e) => set("contact_l3_email", e.target.value)} /></div>
          <div className="field"><label>Finance contact</label><input value={form.finance_contact_person} onChange={(e) => set("finance_contact_person", e.target.value)} /></div>
          <div className="field"><label>Finance email</label><input value={form.finance_email} onChange={(e) => set("finance_email", e.target.value)} /></div>
          <div className="field"><label>Validation</label>
            <select value={form.validation_status} onChange={(e) => set("validation_status", e.target.value)}>
              <option>Pending</option>
              <option>Validated</option>
              <option>Rejected</option>
            </select>
          </div>
          <MultiFilePicker label="Add documents" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" files={docs} setFiles={setDocs} />
          <MultiFilePicker label="Add images" accept="image/*" files={images} setFiles={setImages} />
        </div>
        <SavedFiles title="Saved documents" items={company.documents} />
        <SavedFiles title="Saved images" items={company.images} />
        <div className="action-row">
          <button className="btn btn-primary-soft" type="submit">Update company</button>
        </div>
      </form>
    </div>
  );
}

export function Sliders() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState({
    kicker: "", title: "", text: "", button_label: "Explore", button_link: "/auction", sort_order: "0", status: "1",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const load = () => api("/admin/slides", { auth: "admin" }).then((d) => setRows(d.slides || []));
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!image) return setPreview("");
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  return (
    <div className="admin-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Website</p>
          <h2>Hero Sliders</h2>
        </div>
      </div>
      {msg && <div className="alert ok">{msg}</div>}
      {err && <div className="alert err">{err}</div>}

      <form
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg("");
          setErr("");
          try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (image) fd.append("image", image);
            await api("/admin/slides", { method: "POST", body: fd, auth: "admin", isForm: true });
            setMsg("Slide added");
            setImage(null);
            setForm({ kicker: "", title: "", text: "", button_label: "Explore", button_link: "/auction", sort_order: "0", status: "1" });
            load();
          } catch (ex) {
            setErr(ex.message || "Failed");
          }
        }}
      >
        <div className="panel-head">
          <div>
            <h3>Add slide</h3>
            <p>Each slide: image + kicker, title, text, and button.</p>
          </div>
        </div>
        <div className="form-grid premium-grid">
          <div className="field"><label>Kicker</label><input value={form.kicker} onChange={(e) => set("kicker", e.target.value)} /></div>
          <div className="field"><label>Title *</label><input required value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
          <div className="field full"><label>Text</label><textarea rows={3} value={form.text} onChange={(e) => set("text", e.target.value)} /></div>
          <div className="field"><label>Button label</label><input value={form.button_label} onChange={(e) => set("button_label", e.target.value)} /></div>
          <div className="field"><label>Button link</label><input value={form.button_link} onChange={(e) => set("button_link", e.target.value)} /></div>
          <div className="field"><label>Sort order</label><input type="number" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} /></div>
          <div className="field"><label>Image *</label>
            <input type="file" accept="image/*" required onChange={(e) => setImage(e.target.files?.[0] || null)} />
            {preview && <img className="slide-thumb" src={preview} alt="preview" />}
          </div>
        </div>
        <div className="action-row">
          <button className="btn btn-primary-soft" type="submit">Save Slide</button>
        </div>
      </form>

      <div className="panel table-wrap">
        <table className="soft-table">
          <thead>
            <tr><th>Image</th><th>Title</th><th>Kicker</th><th>Link</th><th>Order</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td>{s.image ? <img className="slide-thumb" src={s.image.startsWith("/") ? s.image : fileUrl(s.image)} alt="" /> : "-"}</td>
                <td>{s.title}</td>
                <td>{s.kicker}</td>
                <td>{s.button_link}</td>
                <td>{s.sort_order}</td>
                <td>
                  <button
                    type="button"
                    className="text-btn"
                    onClick={async () => {
                      await api(`/admin/slides/${s.id}`, { method: "DELETE", auth: "admin" });
                      load();
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="empty-note">No slides yet — homepage uses defaults until you add slides.</p>}
      </div>
    </div>
  );
}

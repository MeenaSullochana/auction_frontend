import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, API_BASE } from "../api";

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

function Req() {
  return <span className="req-star" aria-hidden="true"> *</span>;
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

const emptyAuctionForm = {
  name: "",
  icon: "",
  started_at: "",
  expired_at: "",
  status: 1,
  auction_type: "",
  auction_category: "",
  firm: "",
  firm_kind: "",
  division: "",
  item_type: "",
  inv_type: "",
  goods_location: "",
  gst_mode: "",
};

function newSeparateRow() {
  return { _key: `${Date.now()}-${Math.random()}`, name: "", code: "", price: "", min_bid_amount: "", quantity: "1" };
}

function newComboItem() {
  return { _key: `${Date.now()}-${Math.random()}`, name: "", code: "", quantity: "1" };
}

async function download(path, filename) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` } });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function titleForType(type) {
  if (type === "create") return "Create Auction";
  if (type === "live") return "Live Auctions";
  if (type === "upcoming") return "Upcoming Auctions";
  if (type === "expired" || type === "completed") return "Completed Auctions";
  return "All Auctions";
}

export function Auctions() {
  const { type = "all" } = useParams();
  const navigate = useNavigate();
  const isCreate = type === "create";
  const [rows, setRows] = useState([]);
  const [lookups, setLookups] = useState({ categories: [] });
  const [previewId, setPreviewId] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(!isCreate);
  const [creating, setCreating] = useState(false);
  const [showProduct, setShowProduct] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [form, setForm] = useState({ ...emptyAuctionForm });
  const [productMode, setProductMode] = useState("separate");
  const [separateRows, setSeparateRows] = useState([newSeparateRow()]);
  const [comboItems, setComboItems] = useState([newComboItem(), newComboItem()]);
  const [comboMeta, setComboMeta] = useState({ price: "", min_bid_amount: "" });
  const [importFile, setImportFile] = useState(null);
  const [productNote, setProductNote] = useState("");
  const [listTarget, setListTarget] = useState(null);
  const [viewAuction, setViewAuction] = useState(null);
  const [listProduct, setListProduct] = useState({ name: "", code: "", price: "", min_bid_amount: "", quantity: "1" });
  const listActionRef = useRef(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const refreshPreviewId = async (dateHint) => {
    try {
      const q = dateHint ? `?date=${encodeURIComponent(dateHint)}` : "";
      const d = await api(`/admin/auctions/next-unique-id${q}`, { auth: "admin" });
      setPreviewId(d.unique_id || "");
    } catch { /* keep */ }
  };

  const load = async (opts = {}) => {
    if (isCreate) return [];
    if (!opts.silent) setLoading(true);
    setErr("");
    try {
      const d = await api(`/admin/auctions/${type}`, { auth: "admin" });
      setRows(d.auctions || []);
      return d.auctions || [];
    } catch (e) {
      setErr(e.message || "Failed to load auctions");
      return [];
    } finally {
      if (!opts.silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    api("/admin/lookups", { auth: "admin" })
      .then((d) => {
        setLookups(d);
        if (d.next_unique_id) setPreviewId(d.next_unique_id);
        else refreshPreviewId();
      })
      .catch(() => refreshPreviewId());
  }, [type]);

  useEffect(() => {
    if (form.started_at) refreshPreviewId(form.started_at);
  }, [form.started_at]);

  const validateAuctionForm = () => {
    const requiredKeys = [
      "name", "auction_type", "auction_category", "firm_kind", "firm",
      "division", "item_type", "inv_type", "goods_location", "gst_mode",
      "icon", "started_at", "expired_at",
    ];
    return requiredKeys.find((k) => !String(form[k] || "").trim()) || null;
  };

  const buildProductsFromUi = () => {
    if (productMode === "combo") {
      const items = comboItems.filter((i) => i.name.trim());
      if (!items.length) return [];
      if (!comboMeta.price || !comboMeta.min_bid_amount) {
        throw new Error("Combo needs one price and min bid increment");
      }
      const names = items.map((i) => i.name.trim()).join(" + ");
      const codes = items.map((i) => i.code.trim() || "ITEM").join("-");
      const qty = items.reduce((s, i) => s + Number(i.quantity || 1), 0);
      return [{
        name: `Combo: ${names}`,
        code: codes.slice(0, 40) || `COMBO-${Date.now().toString().slice(-6)}`,
        price: comboMeta.price,
        min_bid_amount: comboMeta.min_bid_amount,
        quantity: String(qty || 1),
        is_combo: true,
      }];
    }
    return separateRows
      .filter((r) => r.name.trim())
      .map((r) => {
        if (!r.code || !r.price || !r.min_bid_amount) {
          throw new Error("Each product needs name, code, price, and min bid");
        }
        return { ...r, is_combo: false };
      });
  };

  const postProduct = async (auction, p) => {
    await api("/admin/products", {
      method: "POST",
      auth: "admin",
      body: {
        name: String(p.name || "").trim(),
        code: String(p.code || "").trim(),
        price: p.price,
        min_bid_amount: p.min_bid_amount,
        quantity: p.quantity || 1,
        auction: auction.id,
        is_combo: p.is_combo ? "1" : undefined,
      },
    });
  };

  const postImport = async (auction, file) => {
    const fd = new FormData();
    fd.append("auction", auction.id);
    fd.append("import_file", file);
    return api("/admin/products/import", { method: "POST", body: fd, auth: "admin", isForm: true });
  };

  const openListAction = async (auction, mode) => {
    let full = auction;
    try {
      const d = await api(`/admin/auction/${auction.id}`, { auth: "admin" });
      full = d.auction || auction;
    } catch { /* row */ }
    setViewAuction(null);
    setListTarget(full);
    setProductNote("");
    setListProduct({ name: "", code: "", price: "", min_bid_amount: "", quantity: "1" });
    setImportFile(null);
    setShowProduct(mode === "product");
    setShowImport(mode === "import");
    setTimeout(() => listActionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const openAuctionView = async (auction) => {
    setShowProduct(false);
    setShowImport(false);
    setListTarget(null);
    try {
      const d = await api(`/admin/auction/${auction.id}`, { auth: "admin" });
      setViewAuction(d.auction || auction);
    } catch {
      setViewAuction(auction);
    }
    setTimeout(() => listActionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  if (isCreate) {
    return (
      <div className="admin-page">
        <div className="page-head">
          <div>
            <p className="eyebrow">Auction desk</p>
            <h2>Create Auction</h2>
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
            if (validateAuctionForm()) {
              setErr("Please fill all required auction fields marked with *");
              return;
            }
            setCreating(true);
            try {
              let pending = [];
              if (showProduct) pending = buildProductsFromUi();
              const d = await api("/admin/auctions", {
                method: "POST",
                body: { ...form, status: 1, unique_id: previewId || undefined },
                auth: "admin",
              });
              const auction = d.auction;
              for (const p of pending) await postProduct(auction, p);
              if (showImport && importFile) await postImport(auction, importFile);
              navigate(`/admin/products/AuctionWise?auction_id=${auction.id}`);
            } catch (ex) {
              setErr(ex.message || "Create failed");
            } finally {
              setCreating(false);
            }
          }}
        >
          <div className="panel-head">
            <div>
              <h3>Auction details</h3>
              <p>Unique ID is auto-generated. Add products optionally, then create — you go to the auction products page.</p>
            </div>
          </div>
          <div className="form-grid premium-grid">
            <div className="field">
              <label>Unique ID</label>
              <div className="id-row">
                <input className="id-preview" value={previewId || "Generating…"} disabled />
                <button type="button" className="btn soft-toggle" onClick={() => refreshPreviewId(form.started_at || "")}>New ID</button>
              </div>
            </div>
            <div className="field"><label>Auction Name<Req /></label><input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Enter auction name" /></div>
            <div className="field schedule-field">
              <label>Auction Open<Req /></label>
              <input type="datetime-local" required value={toLocalInput(form.started_at)} onChange={(e) => set("started_at", fromLocalInput(e.target.value))} />
            </div>
            <div className="field schedule-field">
              <label>Auction Close<Req /></label>
              <input type="datetime-local" required value={toLocalInput(form.expired_at)} onChange={(e) => set("expired_at", fromLocalInput(e.target.value))} />
            </div>
            <div className="field"><label>Auction Type<Req /></label>
              <select required value={form.auction_type} onChange={(e) => set("auction_type", e.target.value)}>
                <option value="">Select</option>
                <option>Open Auction</option>
                <option>Reverse Auction</option>
                <option>Sealed Auction</option>
              </select>
            </div>
            <div className="field"><label>Category<Req /></label>
              <select required value={form.auction_category} onChange={(e) => set("auction_category", e.target.value)}>
                <option value="">Select</option>
                <option>E-waste</option>
                <option>Liquidation</option>
              </select>
            </div>
            <div className="field"><label>Firm Kind<Req /></label>
              <select required value={form.firm_kind} onChange={(e) => set("firm_kind", e.target.value)}>
                <option value="">Select</option>
                <option>Company</option>
                <option>Corporate</option>
                <option>Distributor</option>
              </select>
            </div>
            <div className="field"><label>Firm Name<Req /></label><input required value={form.firm} onChange={(e) => set("firm", e.target.value)} /></div>
            <div className="field"><label>Division<Req /></label>
              <select required value={form.division} onChange={(e) => set("division", e.target.value)}>
                <option value="">Select</option>
                <option>Mobile</option>
                <option>Consumer electronics</option>
                <option>Large Appliance</option>
                <option>small Appliance</option>
                <option>Hardware and Electricals</option>
                <option>Auto Mobiles</option>
                <option>Others</option>
              </select>
            </div>
            <div className="field"><label>Type<Req /></label>
              <select required value={form.item_type} onChange={(e) => set("item_type", e.target.value)}>
                <option value="">Select</option>
                <option>Product</option>
                <option>Material</option>
              </select>
            </div>
            <div className="field"><label>Inv Type<Req /></label>
              <select required value={form.inv_type} onChange={(e) => set("inv_type", e.target.value)}>
                <option value="">Select</option>
                <option>Good</option>
                <option>Defective</option>
                <option>E-waste</option>
              </select>
            </div>
            <div className="field"><label>Goods Location<Req /></label><input required value={form.goods_location} onChange={(e) => set("goods_location", e.target.value)} /></div>
            <div className="field"><label>Price GST Mode<Req /></label>
              <select required value={form.gst_mode} onChange={(e) => set("gst_mode", e.target.value)}>
                <option value="">Select</option>
                <option value="exclusive">Exclusive of GST</option>
                <option value="inclusive">Inclusive of GST</option>
              </select>
            </div>
            <div className="field"><label>Icon<Req /></label>
              <select required value={form.icon} onChange={(e) => set("icon", e.target.value)}>
                <option value="">Select</option>
                {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="action-row">
            <button type="button" className={`btn soft-toggle ${showProduct ? "on" : ""}`} onClick={() => { setShowProduct((v) => !v); if (!showProduct) setShowImport(false); setProductNote(""); }}>
              {showProduct ? "Hide Add Product" : "+ Add Product"}
            </button>
            <button type="button" className={`btn soft-toggle ${showImport ? "on" : ""}`} onClick={() => { setShowImport((v) => !v); if (!showImport) setShowProduct(false); }}>
              {showImport ? "Hide Import" : "Import Products"}
            </button>
          </div>

          {showProduct && (
            <div className="inline-modal expand-panel">
              <div className="panel-head">
                <div>
                  <h3>Add Product</h3>
                  <p>Category &amp; location come from this auction. Add many rows, or one combo with a single price.</p>
                </div>
              </div>
              {productNote && <div className="alert err">{productNote}</div>}
              <div className="product-mode-tabs">
                <button type="button" className={`btn soft-toggle ${productMode === "separate" ? "on" : ""}`} onClick={() => setProductMode("separate")}>Separate products</button>
                <button type="button" className={`btn soft-toggle ${productMode === "combo" ? "on" : ""}`} onClick={() => setProductMode("combo")}>Combo (one price)</button>
              </div>

              {productMode === "separate" && (
                <>
                  <div className="dyn-rows">
                    {separateRows.map((row, idx) => (
                      <div className="dyn-row" key={row._key}>
                        <div className="field"><label>{idx === 0 ? <>Name<Req /></> : "Name"}</label><input value={row.name} onChange={(e) => setSeparateRows((list) => list.map((r) => r._key === row._key ? { ...r, name: e.target.value } : r))} /></div>
                        <div className="field"><label>Code<Req /></label><input value={row.code} onChange={(e) => setSeparateRows((list) => list.map((r) => r._key === row._key ? { ...r, code: e.target.value } : r))} /></div>
                        <div className="field"><label>Price<Req /></label><input type="number" min="0" step="any" value={row.price} onChange={(e) => setSeparateRows((list) => list.map((r) => r._key === row._key ? { ...r, price: e.target.value } : r))} /></div>
                        <div className="field"><label>Min Bid<Req /></label><input type="number" min="0" step="any" value={row.min_bid_amount} onChange={(e) => setSeparateRows((list) => list.map((r) => r._key === row._key ? { ...r, min_bid_amount: e.target.value } : r))} /></div>
                        <div className="field"><label>Qty</label><input type="number" min="1" value={row.quantity} onChange={(e) => setSeparateRows((list) => list.map((r) => r._key === row._key ? { ...r, quantity: e.target.value } : r))} /></div>
                        <button type="button" className="text-btn" onClick={() => setSeparateRows((list) => list.length === 1 ? [newSeparateRow()] : list.filter((r) => r._key !== row._key))}>Remove</button>
                      </div>
                    ))}
                  </div>
                  <div className="action-row">
                    <button type="button" className="btn soft-toggle" onClick={() => setSeparateRows((list) => [...list, newSeparateRow()])}>+ Another product</button>
                  </div>
                </>
              )}

              {productMode === "combo" && (
                <>
                  <div className="dyn-rows">
                    {comboItems.map((row, idx) => (
                      <div className="dyn-row combo-row" key={row._key}>
                        <div className="field"><label>{idx === 0 ? <>Item name<Req /></> : "Item name"}</label><input value={row.name} onChange={(e) => setComboItems((list) => list.map((r) => r._key === row._key ? { ...r, name: e.target.value } : r))} /></div>
                        <div className="field"><label>Code</label><input value={row.code} onChange={(e) => setComboItems((list) => list.map((r) => r._key === row._key ? { ...r, code: e.target.value } : r))} /></div>
                        <div className="field"><label>Qty</label><input type="number" min="1" value={row.quantity} onChange={(e) => setComboItems((list) => list.map((r) => r._key === row._key ? { ...r, quantity: e.target.value } : r))} /></div>
                        <button type="button" className="text-btn" onClick={() => setComboItems((list) => list.length === 1 ? [newComboItem()] : list.filter((r) => r._key !== row._key))}>Remove</button>
                      </div>
                    ))}
                  </div>
                  <div className="action-row">
                    <button type="button" className="btn soft-toggle" onClick={() => setComboItems((list) => [...list, newComboItem()])}>+ Item in combo</button>
                  </div>
                  <div className="combo-shared">
                    <div className="field"><label>Combo price<Req /></label><input type="number" min="0" step="any" value={comboMeta.price} onChange={(e) => setComboMeta({ ...comboMeta, price: e.target.value })} /></div>
                    <div className="field"><label>Min bid increment<Req /></label><input type="number" min="0" step="any" value={comboMeta.min_bid_amount} onChange={(e) => setComboMeta({ ...comboMeta, min_bid_amount: e.target.value })} /></div>
                  </div>
                </>
              )}
            </div>
          )}

          {showImport && (
            <div className="inline-modal expand-panel">
              <div className="panel-head">
                <div>
                  <h3>Import Products</h3>
                  <p>Category &amp; location taken from this auction automatically.</p>
                </div>
                <button type="button" className="btn soft-toggle" onClick={() => download("/admin/products/import/sample/excel", "ProductImportSample.xlsx")}>Sample Excel</button>
              </div>
              <div className="field"><label>Excel file</label><input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setImportFile(e.target.files[0] || null)} /></div>
              <p className="empty-note">
                Sample columns: mode (simple/combo), name, code, price, min_bid_amount, quantity, combo_items (use | between items for combo).
                {importFile ? ` Ready: ${importFile.name}` : ""}
              </p>
            </div>
          )}

          <div className="action-row">
            <button className="btn btn-primary-soft" type="submit" disabled={creating}>
              {creating ? "Creating…" : "Create Auction"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Auction desk</p>
          <h2>{titleForType(type)}</h2>
        </div>
        <Link className="btn soft-toggle" to="/admin/auctions/create">+ Create Auction</Link>
      </div>

      {msg && <div className="alert ok">{msg}</div>}
      {err && <div className="alert err">{err}</div>}

      <div className="panel table-wrap">
        <div className="panel-head">
          <div>
            <h3>Auction list</h3>
            <p>{loading ? "Loading..." : `${rows.length} auction(s)`}</p>
          </div>
          <button type="button" className="btn soft-toggle" onClick={() => load()}>Refresh</button>
        </div>

        <div ref={listActionRef}>
          {viewAuction && (
            <div className="inline-modal expand-panel" style={{ marginBottom: 16 }}>
              <div className="panel-head">
                <div>
                  <h3>Auction details</h3>
                  <p>{viewAuction.unique_id || `AU-${viewAuction.id}`} — {viewAuction.name}</p>
                </div>
                <button type="button" className="btn soft-toggle" onClick={() => setViewAuction(null)}>Close</button>
              </div>
              <div className="detail-grid">
                <div><span>Type</span><b>{viewAuction.auction_type || "-"}</b></div>
                <div><span>Category</span><b>{viewAuction.auction_category || "-"}</b></div>
                <div><span>Firm</span><b>{viewAuction.firm || "-"}</b></div>
                <div><span>Division</span><b>{viewAuction.division || "-"}</b></div>
                <div><span>Location</span><b>{viewAuction.goods_location || "-"}</b></div>
                <div><span>Open</span><b>{fmt(viewAuction.started_at)}</b></div>
                <div><span>Close</span><b>{fmt(viewAuction.expired_at)}</b></div>
                <div><span>Status</span><b>{viewAuction.status ? "Active" : "Pending"}</b></div>
              </div>
              <div className="action-row">
                <button type="button" className="btn soft-toggle" onClick={() => openListAction(viewAuction, "product")}>+ Add Product</button>
                <Link className="btn soft-toggle" to={`/admin/products/AuctionWise?auction_id=${viewAuction.id}`}>Open auction page</Link>
              </div>
            </div>
          )}

          {listTarget && showProduct && (
            <div className="inline-modal expand-panel" style={{ marginBottom: 16 }}>
              <div className="panel-head">
                <div>
                  <h3>Add Product</h3>
                  <p>Into <strong>{listTarget.unique_id}</strong> — {listTarget.name}. Category/location from auction.</p>
                </div>
                <button type="button" className="btn soft-toggle" onClick={() => { setListTarget(null); setShowProduct(false); }}>Close</button>
              </div>
              {productNote && <div className={`alert ${/success/i.test(productNote) ? "ok" : "err"}`}>{productNote}</div>}
              <div className="form-grid premium-grid">
                <div className="field"><label>Name<Req /></label><input value={listProduct.name} onChange={(e) => setListProduct({ ...listProduct, name: e.target.value })} /></div>
                <div className="field"><label>Code<Req /></label><input value={listProduct.code} onChange={(e) => setListProduct({ ...listProduct, code: e.target.value })} /></div>
                <div className="field"><label>Price<Req /></label><input type="number" min="0" step="any" value={listProduct.price} onChange={(e) => setListProduct({ ...listProduct, price: e.target.value })} /></div>
                <div className="field"><label>Min Bid<Req /></label><input type="number" min="0" step="any" value={listProduct.min_bid_amount} onChange={(e) => setListProduct({ ...listProduct, min_bid_amount: e.target.value })} /></div>
                <div className="field"><label>Qty</label><input type="number" min="1" value={listProduct.quantity} onChange={(e) => setListProduct({ ...listProduct, quantity: e.target.value })} /></div>
                <div className="field full action-row">
                  <button
                    type="button"
                    className="btn btn-primary-soft"
                    onClick={async () => {
                      setProductNote("");
                      if (!listProduct.name || !listProduct.code || !listProduct.price || !listProduct.min_bid_amount) {
                        return setProductNote("Fill name, code, price, min bid");
                      }
                      try {
                        await postProduct(listTarget, listProduct);
                        setProductNote("Product added successfully");
                        setListProduct({ name: "", code: "", price: "", min_bid_amount: "", quantity: "1" });
                        navigate(`/admin/products/AuctionWise?auction_id=${listTarget.id}`);
                      } catch (ex) {
                        setProductNote(ex.message || "Failed");
                      }
                    }}
                  >
                    Save &amp; open auction
                  </button>
                </div>
              </div>
            </div>
          )}

          {listTarget && showImport && (
            <div className="inline-modal expand-panel" style={{ marginBottom: 16 }}>
              <div className="panel-head">
                <div>
                  <h3>Import Products</h3>
                  <p>Into <strong>{listTarget.unique_id}</strong> — category from auction.</p>
                </div>
                <button type="button" className="btn soft-toggle" onClick={() => { setListTarget(null); setShowImport(false); }}>Close</button>
              </div>
              {productNote && <div className={`alert ${/success|Import/i.test(productNote) ? "ok" : "err"}`}>{productNote}</div>}
              <div className="field"><label>Excel file</label><input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setImportFile(e.target.files[0] || null)} /></div>
              <div className="action-row">
                <button
                  type="button"
                  className="btn btn-primary-soft"
                  onClick={async () => {
                    if (!importFile) return setProductNote("Choose a file");
                    try {
                      const d = await postImport(listTarget, importFile);
                      setProductNote(d.message || "Imported successfully");
                      navigate(`/admin/products/AuctionWise?auction_id=${listTarget.id}`);
                    } catch (ex) {
                      setProductNote(ex.message || "Import failed");
                    }
                  }}
                >
                  Upload &amp; open auction
                </button>
              </div>
            </div>
          )}
        </div>

        {!loading && !rows.length && <p className="empty-note">No auctions in this list.</p>}
        {!loading && !!rows.length && (
          <table className="soft-table">
            <thead>
              <tr>
                <th>Unique ID</th><th>Name</th><th>Type</th><th>Category</th><th>Firm</th>
                <th>Division</th><th>Open</th><th>Close</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td>{a.unique_id || `AU-${a.id}`}</td>
                  <td>
                    <Link className="text-btn" to={`/admin/products/AuctionWise?auction_id=${a.id}`}>{a.name}</Link>
                  </td>
                  <td>{a.auction_type || "-"}</td>
                  <td>{a.auction_category || "-"}</td>
                  <td>{a.firm || "-"}</td>
                  <td>{a.division || "-"}</td>
                  <td>{fmt(a.started_at)}</td>
                  <td>{fmt(a.expired_at)}</td>
                  <td><span className={`status-pill ${(a.phase || "").toLowerCase()}`}>{a.phase || (a.status ? "Active" : "Pending")}</span></td>
                  <td className="row-actions">
                    <Link className="text-btn" to={`/admin/products/AuctionWise?auction_id=${a.id}`}>Products</Link>
                    <button type="button" className="text-btn" onClick={() => openListAction(a, "product")}>Quick add</button>
                    <button type="button" className="text-btn" onClick={() => openListAction(a, "import")}>Import</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export function Reports() {
  const [status, setStatus] = useState("all");
  const [month, setMonth] = useState("");
  const [category, setCategory] = useState("");
  const [firm, setFirm] = useState("");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const query = () => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (month) p.set("month", month);
    if (category) p.set("category", category);
    if (firm) p.set("firm", firm);
    if (search.trim()) p.set("search", search.trim());
    return p.toString();
  };

  const runPreview = async () => {
    setLoading(true);
    setMsg("");
    try {
      const d = await api(`/admin/reports/auctions?${query()}`, { auth: "admin" });
      setPreview(d.rows || []);
      setMsg(`${d.total ?? (d.rows || []).length} auction(s) — includes completed when status is All or Completed`);
    } catch (e) {
      setMsg(e.message || "Failed to load report");
      setPreview([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPreview();
  }, [status, month, category, firm]);

  return (
    <div className="admin-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Exports</p>
          <h2>Auction Report</h2>
        </div>
      </div>
      {msg && <div className="alert ok">{msg}</div>}

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Filters</h3>
            <p>Filter the auction list below. Leave month empty to include every month (completed auctions stay visible).</p>
          </div>
        </div>
        <div className="form-grid premium-grid">
          <div className="field"><label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All (incl. completed)</option>
              <option value="live">Live</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="field"><label>Month (optional)</label><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></div>
          <div className="field"><label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              <option>E-waste</option>
              <option>Liquidation</option>
            </select>
          </div>
          <div className="field"><label>Firm</label><input value={firm} onChange={(e) => setFirm(e.target.value)} placeholder="Company / firm name" /></div>
          <div className="field full"><label>Search</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Unique ID, name, firm…" onKeyDown={(e) => { if (e.key === "Enter") runPreview(); }} />
          </div>
        </div>
        <div className="action-row">
          <button type="button" className="btn soft-toggle" onClick={runPreview} disabled={loading}>{loading ? "Loading…" : "Apply filters"}</button>
          <button
            type="button"
            className="btn btn-primary-soft"
            onClick={() => download(`/admin/reports/auctions?${query()}&format=excel`, `AuctionReport_${status || "all"}.xlsx`)}
          >
            Export / Download
          </button>
          <button
            type="button"
            className="btn soft-toggle"
            onClick={() => download(`/admin/reports/revenue?${month ? `month=${month}&` : ""}format=excel`, `Revenue_${month || "all"}.xlsx`)}
          >
            Download revenue
          </button>
        </div>
      </div>

      <div className="panel table-wrap">
        <div className="panel-head">
          <div>
            <h3>Filtered auctions</h3>
            <p>{loading ? "Loading…" : `${preview.length} record(s)`}</p>
          </div>
          <button
            type="button"
            className="btn soft-toggle"
            onClick={() => download(`/admin/reports/auctions?${query()}&format=excel`, "AuctionReport.xlsx")}
          >
            Download these rows
          </button>
        </div>
        {!loading && !preview.length && <p className="empty-note">No auctions match these filters.</p>}
        {!!preview.length && (
          <table className="soft-table">
            <thead>
              <tr>{Object.keys(preview[0]).map((k) => <th key={k}>{k}</th>)}</tr>
            </thead>
            <tbody>
              {preview.map((r, i) => (
                <tr key={i}>{Object.values(r).map((v, j) => <td key={j}>{String(v)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

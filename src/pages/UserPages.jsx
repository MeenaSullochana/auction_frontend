import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { api } from "../api";

function fmt(d) {
  if (!d) return "";
  return new Date(d.replace(" ", "T")).toLocaleString();
}

function Countdown({ date }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const end = date ? new Date(date.replace(" ", "T")).getTime() : now;
  let diff = Math.max(0, end - now);
  const days = Math.floor(diff / 86400000); diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
  const minutes = Math.floor(diff / 60000); diff -= minutes * 60000;
  const seconds = Math.floor(diff / 1000);
  return (
    <div className="countdown">
      <b>{String(days).padStart(2, "0")}</b>
      <b>{String(hours).padStart(2, "0")}</b>
      <b>{String(minutes).padStart(2, "0")}</b>
      <b>{String(seconds).padStart(2, "0")}</b>
    </div>
  );
}

export function UserDashboard() {
  const [auctions, setAuctions] = useState([]);
  const [err, setErr] = useState("");
  useEffect(() => {
    api("/user/dashboard", { auth: "user" })
      .then((d) => setAuctions(d.auctions || []))
      .catch((e) => setErr(e.message || "Could not load auctions"));
  }, []);
  return (
    <div className="bidder-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Bidder desk</p>
          <h2>My auctions</h2>
          <p className="lead">Live and upcoming sales assigned to your vendor login.</p>
        </div>
      </div>
      {err && <div className="alert err">{err}</div>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>S.N.</th>
              <th>Auction</th>
              <th>Unique ID</th>
              <th>Status</th>
              <th>Open</th>
              <th>Close</th>
            </tr>
          </thead>
          <tbody>
            {auctions.map((a, i) => (
              <tr key={a.id}>
                <td>{i + 1}</td>
                <td><Link className="link" to={`/user/auction/${a.id}`}>{a.name}</Link></td>
                <td>{a.unique_id || "-"}</td>
                <td><span className={`status-pill ${a.phase || ""}`}>{a.phase_label || a.phase || "-"}</span></td>
                <td>{fmt(a.started_at)}</td>
                <td>{fmt(a.expired_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!auctions.length && !err && (
          <p className="empty-note">No assigned live or upcoming auctions. Ask admin to assign your vendor to an auction.</p>
        )}
      </div>
    </div>
  );
}

export function AuctionProducts() {
  const { id } = useParams();
  const [data, setData] = useState({ products: [], auction: {} });
  useEffect(() => {
    api(`/user/auctions/${id}/products`, { auth: "user" }).then(setData).catch(() => {});
  }, [id]);
  return (
    <div>
      <h2>{data.pageTitle || data.auction?.name}</h2>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>S.N.</th><th>Item ID</th><th>Item Name</th><th>Qty</th><th>bidder</th><th>Current BId(INR)</th><th>Open Date Time</th><th>Close Date Time</th></tr>
          </thead>
          <tbody>
            {data.products?.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>{p.code}</td>
                <td><Link className="link" to={`/user/product/${p.auction_id}/${p.id}`}>{p.name}</Link></td>
                <td>{p.quantity}</td>
                <td>{p.bidder_count}</td>
                <td>{p.current_bid}</td>
                <td>{fmt(p.started_at)}</td>
                <td>{fmt(p.expired_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProductBid() {
  const { auctionId, id } = useParams();
  const [data, setData] = useState(null);
  const [amount, setAmount] = useState("");
  const [agent, setAgent] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const load = () => api(`/user/products/${auctionId}/${id}`, { auth: "user" }).then(setData);
  useEffect(() => { load().catch((e) => setErr(e.message)); }, [auctionId, id]);
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || undefined);
    socket.on("new-trade", () => load());
    socket.on("auction-time", () => load());
    return () => socket.close();
  }, [auctionId, id]);
  if (!data) return <p>{err || "Loading..."}</p>;
  const p = data.product;
  const next = data.max_pro ? Number(data.max_pro) + Number(p.min_bid_amount) : Number(p.price) + Number(p.min_bid_amount);
  return (
    <div>
      <div className="subnav">
        <Link className="link" to={`/user/auction/${p.auction_id}/multiple`}>Multiple Item Bidding</Link>
        <Link className="link" to={`/user/auction/${p.auction_id}/watch`}>My Auction Watch</Link>
        <Link className="link" to={`/user/auction/${p.auction_id}`}>Item List</Link>
      </div>
      {msg && <div className="alert ok">{msg}</div>}
      {err && <div className="alert err">{err}</div>}
      <div className="bid-grid">
        <div className="card">
          <h3>Item Detail</h3>
          <table className="spec">
            <tbody>
              <tr><th>Item Code</th><td>{p.code}</td></tr>
              <tr><th>Item Name</th><td>{p.name}</td></tr>
              {p.condition && <tr><th>Condition</th><td>{p.condition}</td></tr>}
              {p.location && <tr><th>Location</th><td>{p.location}</td></tr>}
              {p.excise_duty > 0 && <tr><th>Excise Duty (%)</th><td>{p.excise_duty}%</td></tr>}
              {p.sales_duty > 0 && <tr><th>Sales Duty (%)</th><td>{p.sales_duty}%</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Auction Detail</h3>
          <table className="spec">
            <tbody>
              <tr><th>Auction Category</th><td>{p.category?.name}</td></tr>
              <tr><th>Starting Bid Price</th><td>{p.price} INR</td></tr>
              <tr><th>Min Bid Increment</th><td>{p.min_bid_amount} INR</td></tr>
              <tr><th>Tentative Auction Opening Date</th><td>{fmt(p.started_at)}</td></tr>
              <tr><th>Tentative Auction closing Date</th><td>{fmt(p.expired_at)}</td></tr>
              <tr><th>Auction Remaining Time</th><td><Countdown date={p.expired_at} /></td></tr>
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Bidding Detail</h3>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!amount && !agent) return setErr("Please Enter Bid Amount or set Agent Amount");
            const ok = window.confirm(amount ? "Are you sure you want to bid?" : "Are you sure you want to set Agent Amount?");
            if (!ok) return;
            try {
              const body = { product_id: p.id, min_bid_increment: p.min_bid_amount, max_bid: next };
              if (amount) body.amount = Number(amount);
              if (agent) body.agent_amount = Number(agent);
              const r = await api("/user/bid", { method: "POST", body, auth: "user" });
              setMsg(r.message); setErr(""); setAmount(""); await load();
            } catch (ex) { setErr(ex.message); }
          }}>
            <div className="field"><label>Bid Amount:</label><input type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter your amount" /></div>
            <div className="field" style={{ marginTop: 10 }}><label>Agent Amount:</label><input type="number" min="0" step="any" value={agent} onChange={(e) => setAgent(e.target.value)} placeholder="Enter Agent Amount" /></div>
            {p.is_live && <button className="btn btn-gold" style={{ marginTop: 16 }}>Bid Now</button>}
          </form>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <p>No. of Top Bidders: {data.max_bid.length} &nbsp; denotes eAgent</p>
        <p><strong>You can Bid for [INR]: {next} or above</strong></p>
        <table>
          <thead><tr><th>S.No</th><th>Bidder Name</th><th>Amt(Rs)</th><th>Bid Position</th><th>Bid Date and Time</th></tr></thead>
          <tbody>
            {data.max_bid.map((b, i) => (
              <tr key={b.id}>
                <td>{i + 1}</td>
                <td>{b.display_name}</td>
                <td>{b.amount} INR</td>
                <td>{b.position}</td>
                <td>{fmt(b.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MultipleBid() {
  const { auctionId } = useParams();
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    api(`/user/auctions/${auctionId}/multiple`, { auth: "user" }).then((d) => setProducts(d.products || []));
  }, [auctionId]);
  return (
    <div>
      <h2>Multiple Item Bidding</h2>
      <button className="btn btn-gold" style={{ marginBottom: 12 }} onClick={async () => {
        await api("/user/watchlist", { method: "POST", body: { productids: selected }, auth: "user" });
        navigate(`/user/auction/${auctionId}/watch`);
      }}>Save Watch</button>
      <div className="card table-wrap">
        <table>
          <thead><tr><th></th><th>Item ID</th><th>Item Name</th><th>Current Bid</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td><input type="checkbox" checked={selected.includes(p.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, p.id] : selected.filter((x) => x !== p.id))} /></td>
                <td>{p.code}</td>
                <td><Link className="link" to={`/user/product/${p.auction_id}/${p.id}`}>{p.name}</Link></td>
                <td>{p.current_bid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function WatchList() {
  const { auctionId } = useParams();
  const [products, setProducts] = useState([]);
  const [err, setErr] = useState("");
  useEffect(() => {
    api(`/user/auctions/${auctionId}/watch`, { auth: "user" }).then((d) => setProducts(d.products || [])).catch((e) => setErr(e.message));
  }, [auctionId]);
  return (
    <div>
      <h2>My Auction Watch</h2>
      {err && <div className="alert err">{err}</div>}
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Item ID</th><th>Item Name</th><th>Current Bid</th><th>Close</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.code}</td>
                <td><Link className="link" to={`/user/product/${p.auction_id}/${p.id}`}>{p.name}</Link></td>
                <td>{p.current_bid}</td>
                <td>{fmt(p.expired_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function WinningHistory() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api("/user/winning-history", { auth: "user" }).then((d) => setRows(d.winningHistories || []));
  }, []);
  return (
    <div className="bidder-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Results</p>
          <h2>My winning history</h2>
          <p className="lead">Lots you won — amounts stay on your vendor record for collection.</p>
        </div>
      </div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Product</th><th>Code</th><th>Bid Amount (INR)</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}><td>{r.product_name}</td><td>{r.product_code}</td><td>{r.bid_amount}</td></tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="empty-note">No winning history found</p>}
      </div>
    </div>
  );
}

export function ChangePassword() {
  const [form, setForm] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  return (
    <div style={{ maxWidth: 480 }}>
      <h2>Change password</h2>
      {msg && <div className="alert ok">{msg}</div>}
      {err && <div className="alert err">{err}</div>}
      <form className="card" onSubmit={async (e) => {
        e.preventDefault();
        try {
          const d = await api("/auth/change-password", { method: "POST", body: form, auth: "user" });
          setMsg(d.message); setErr("");
        } catch (ex) { setErr(ex.message); }
      }}>
        <div className="field"><label>Current password</label><input type="password" onChange={(e) => setForm({ ...form, current_password: e.target.value })} required /></div>
        <div className="field"><label>New password</label><input type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
        <div className="field"><label>Confirm</label><input type="password" onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} required /></div>
        <button className="btn btn-gold" style={{ marginTop: 16 }}>Update</button>
      </form>
    </div>
  );
}

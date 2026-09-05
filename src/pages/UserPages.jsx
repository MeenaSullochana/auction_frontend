import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { api } from "../api";
import { useAuth } from "../auth";

function fmt(d) {
  if (!d) return "";
  return new Date(String(d).replace(" ", "T")).toLocaleString();
}

function fmtTime(d) {
  if (!d) return "—";
  return new Date(String(d).replace(" ", "T")).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(String(d).replace(" ", "T")).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Countdown({ date }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const end = date ? new Date(String(date).replace(" ", "T")).getTime() : now;
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

function AuctionMeta({ auction }) {
  if (!auction) return null;
  return (
    <div className="room-meta">
      <div className="room-meta-col">
        <div><span>Auction Category</span><b>{auction.auction_category || "—"}</b></div>
        <div><span>Auction Type</span><b>{auction.auction_type || "—"}</b></div>
        <div><span>Division</span><b>{auction.division || "—"}</b></div>
        <div><span>Type</span><b>{auction.item_type || "—"}</b></div>
        <div><span>Inv Type</span><b>{auction.inv_type || "—"}</b></div>
        <div><span>Price</span><b>{auction.gst_mode === "inclusive" ? "Inc Tax" : "Exc Tax"}</b></div>
      </div>
      <div className="room-meta-col">
        <div><span>Date</span><b>{fmtDate(auction.started_at)} · {fmtTime(auction.started_at)}</b></div>
        <div><span>Auction No</span><b>{auction.unique_id || `AU-${auction.id}`}</b></div>
        <div><span>Company</span><b>{auction.firm || "—"}</b></div>
        <div><span>Start Time</span><b>{fmtTime(auction.started_at)}</b></div>
        <div><span>End Time</span><b>{fmtTime(auction.expired_at)}</b></div>
        <div><span>Status</span><b>{auction.phase || "—"}</b></div>
      </div>
    </div>
  );
}

async function toggleFavourite(productId, setFlag) {
  const d = await api("/user/favourites/toggle", {
    method: "POST",
    body: { product_id: productId },
    auth: "user",
  });
  if (setFlag) setFlag(!!d.favourited);
  return d;
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
          <p className="lead">Open an auction → favourite items → enter bidder room at sale time.</p>
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
              <th>Type</th>
              <th>Status</th>
              <th>Open</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {auctions.map((a, i) => (
              <tr key={a.id}>
                <td>{i + 1}</td>
                <td>{a.name}</td>
                <td>{a.unique_id || "-"}</td>
                <td>{a.auction_type || "-"}</td>
                <td><span className={`status-pill ${a.phase || ""}`}>{a.phase_label || a.phase || "-"}</span></td>
                <td>{fmt(a.started_at)}</td>
                <td className="row-actions">
                  <Link className="text-btn" to={`/user/auction/${a.id}`}>Items</Link>
                  <Link className="text-btn" to={`/user/auction/${a.id}/room`}>Bidder room</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!auctions.length && !err && (
          <p className="empty-note">No assigned live or upcoming auctions.</p>
        )}
      </div>
    </div>
  );
}

export function AuctionProducts() {
  const { id } = useParams();
  const [data, setData] = useState({ products: [], auction: {} });
  const [err, setErr] = useState("");
  const load = () =>
    api(`/user/auctions/${id}/products`, { auth: "user" })
      .then(setData)
      .catch((e) => setErr(e.message));

  useEffect(() => { load(); }, [id]);

  const onFav = async (p) => {
    try {
      await toggleFavourite(p.id);
      await load();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="bidder-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Item list</p>
          <h2>{data.pageTitle || data.auction?.name}</h2>
          <p className="lead">Star favourites now. At live time the bidder room shows favourites first — you can still add others.</p>
        </div>
        <div className="action-row">
          <Link className="btn soft-toggle" to={`/user/auction/${id}/room`}>Open bidder room</Link>
          <Link className="btn btn-gold" to={`/user/auction/${id}/watch`}>My favourites</Link>
        </div>
      </div>
      {err && <div className="alert err">{err}</div>}
      <AuctionMeta auction={data.auction} />
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>★</th>
              <th>S.N.</th>
              <th>Item ID</th>
              <th>Item Name</th>
              <th>Qty</th>
              <th>Bidders</th>
              <th>Current Bid (INR)</th>
              <th>Open</th>
              <th>Close</th>
            </tr>
          </thead>
          <tbody>
            {data.products?.map((p, i) => (
              <tr key={p.id}>
                <td>
                  <button
                    type="button"
                    className={`fav-btn ${p.is_favourite ? "on" : ""}`}
                    title={p.is_favourite ? "Remove favourite" : "Add favourite"}
                    onClick={() => onFav(p)}
                  >
                    {p.is_favourite ? "★" : "☆"}
                  </button>
                </td>
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
        {!data.products?.length && <p className="empty-note">No items in this auction yet.</p>}
      </div>
    </div>
  );
}

function ItemBidRow({ product, onPlaced }) {
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const next = product.next_min
    || (product.current_bid > 0
      ? Number(product.current_bid) + Number(product.min_bid_amount)
      : Number(product.price) + Number(product.min_bid_amount));

  return (
    <div className={`room-item-row ${product.is_sold ? "is-sold" : ""}`}>
      <div className="room-item-info">
        <div className="room-item-box">
          <strong>{product.name || "Item"}</strong>
          <span>Code: {product.code || "—"}</span>
          <span>Qty: {product.quantity ?? "—"}</span>
        </div>
        <div className="room-item-box">
          <span>Price per Qty / Lot</span>
          <strong>₹ {product.current_bid || product.price}</strong>
          <span className="muted">Start ₹{product.price}</span>
        </div>
      </div>

      <form
        className="room-bid-stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg("");
          setErr("");
          if (!amount) return setErr("Enter bid amount");
          if (!window.confirm(`Bid ₹${amount} on ${product.name}?`)) return;
          try {
            const r = await api("/user/bid", {
              method: "POST",
              auth: "user",
              body: {
                product_id: product.id,
                amount: Number(amount),
                min_bid_increment: product.min_bid_amount,
                max_bid: next,
              },
            });
            setMsg(r.message || "Bid placed");
            setAmount("");
            onPlaced?.();
          } catch (ex) {
            setErr(ex.message);
          }
        }}
      >
        <div className="room-bid-head">BID</div>
        <div className="room-bid-chip">Start Price — {product.price}</div>
        <div className="room-bid-chip">Increment — {product.min_bid_amount}</div>
        <div className="room-bid-hint">You can bid {next} or above</div>
        <input
          type="number"
          min={next}
          step="any"
          placeholder="Bidder value"
          value={amount}
          disabled={!product.is_live || product.is_sold}
          onChange={(e) => setAmount(e.target.value)}
        />
        {product.is_live && !product.is_sold && (
          <button type="submit" className="btn btn-gold room-submit">Submit</button>
        )}
        {msg && <div className="alert ok">{msg}</div>}
        {err && <div className="alert err">{err}</div>}
      </form>

      <div className="room-status-stack">
        <div className="room-bid-head">Bidder Status</div>
        <div className={`room-rank ${String(product.rank_label).toLowerCase().includes("sold") ? "sold" : ""}`}>
          {product.rank_label || "—"}
        </div>
        <Link className="text-btn" to={`/user/product/${product.auction_id}/${product.id}`}>Full detail →</Link>
      </div>
    </div>
  );
}

export function BidderRoom() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [err, setErr] = useState("");
  const [adding, setAdding] = useState("");

  const load = (forceAll) => {
    const all = forceAll ?? showAll;
    const q = all ? "favourites_only=0" : "favourites_only=1";
    return api(`/user/auctions/${id}/room?${q}`, { auth: "user" })
      .then(setData)
      .catch((e) => setErr(e.message));
  };

  useEffect(() => { load(); }, [id, showAll]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || undefined);
    socket.on("new-trade", () => load());
    socket.on("auction-time", () => load());
    return () => socket.close();
  }, [id, showAll]);

  const addOther = async () => {
    const pid = Number(adding);
    if (!pid) return;
    try {
      await toggleFavourite(pid);
      setAdding("");
      setShowAll(false);
      await load(false);
    } catch (e) {
      setErr(e.message);
    }
  };

  if (!data && !err) return <p>Loading bidder room…</p>;
  if (err && !data) return <div className="alert err">{err}</div>;

  const a = data.auction;

  return (
    <div className="bidder-page bidder-room">
      <div className="room-topbar">
        <strong>Auction House</strong>
        <span>{user?.username || "Bidder"} Room</span>
      </div>

      <div className="page-head">
        <div>
          <p className="eyebrow">{a?.phase === "live" ? "Live floor" : "Auction desk"}</p>
          <h2>{a?.name}</h2>
        </div>
        <div className="action-row">
          <Link className="btn soft-toggle" to={`/user/auction/${id}`}>Item list</Link>
          <Link className="btn soft-toggle" to={`/user/auction/${id}/watch`}>Favourites</Link>
        </div>
      </div>

      {err && <div className="alert err">{err}</div>}
      <AuctionMeta auction={a} />

      <div className="room-toolbar">
        <h3>List of Items</h3>
        <div className="action-row">
          {data.favourites_only ? (
            <button type="button" className="btn soft-toggle" onClick={() => setShowAll(true)}>
              Show all items
            </button>
          ) : (
            <button type="button" className="btn soft-toggle" onClick={() => setShowAll(false)}>
              Favourites only
            </button>
          )}
        </div>
      </div>

      {data.favourites_only && (
        <p className="lead room-note">
          Showing your favourites for this live sale. Use <strong>Show all items</strong> or add another lot below.
        </p>
      )}

      <div className="room-items">
        {data.products.map((p) => (
          <ItemBidRow key={p.id} product={p} onPlaced={() => load()} />
        ))}
        {!data.products.length && (
          <p className="empty-note">
            {data.favourite_ids?.length
              ? "No favourited live items — show all or add favourites from the item list."
              : "No items available. Star favourites on the item list first."}
          </p>
        )}
      </div>

      {!!data.other_items?.length && (
        <div className="card room-add-others">
          <h3>Add other items</h3>
          <p className="lead">Favourite another lot so it appears in your room.</p>
          <div className="action-row" style={{ alignItems: "center" }}>
            <select value={adding} onChange={(e) => setAdding(e.target.value)}>
              <option value="">Select item…</option>
              {data.other_items.map((o) => (
                <option key={o.id} value={o.id}>{o.code} — {o.name}</option>
              ))}
            </select>
            <button type="button" className="btn btn-gold" onClick={addOther} disabled={!adding}>Add to favourites</button>
          </div>
        </div>
      )}
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
    <div className="bidder-page">
      <div className="subnav">
        <Link className="link" to={`/user/auction/${p.auction_id}/room`}>Bidder room</Link>
        <Link className="link" to={`/user/auction/${p.auction_id}/multiple`}>Pick favourites</Link>
        <Link className="link" to={`/user/auction/${p.auction_id}/watch`}>My favourites</Link>
        <Link className="link" to={`/user/auction/${p.auction_id}`}>Item list</Link>
      </div>

      <div className="item-nav">
        {data.prev_id ? (
          <Link className="btn soft-toggle" to={`/user/product/${auctionId}/${data.prev_id}`}>← Previous item</Link>
        ) : <span />}
        <span className="lead">
          Item {(data.siblings || []).findIndex((s) => Number(s.id) === Number(p.id)) + 1}
          {" / "}
          {(data.siblings || []).length}
        </span>
        {data.next_id ? (
          <Link className="btn soft-toggle" to={`/user/product/${auctionId}/${data.next_id}`}>Next item →</Link>
        ) : <span />}
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
              <tr><th>Qty</th><td>{p.quantity}</td></tr>
              {p.condition && <tr><th>Condition</th><td>{p.condition}</td></tr>}
              {p.location && <tr><th>Location</th><td>{p.location}</td></tr>}
            </tbody>
          </table>
          <button
            type="button"
            className={`fav-btn large ${p.is_favourite ? "on" : ""}`}
            onClick={async () => {
              await toggleFavourite(p.id);
              load();
            }}
          >
            {p.is_favourite ? "★ Favourited" : "☆ Add favourite"}
          </button>
        </div>
        <div className="card">
          <h3>Auction Detail</h3>
          <table className="spec">
            <tbody>
              <tr><th>Auction Category</th><td>{data.auction?.auction_category || p.category?.name}</td></tr>
              <tr><th>Auction Type</th><td>{data.auction?.auction_type || "—"}</td></tr>
              <tr><th>Starting Bid Price</th><td>{p.price} INR</td></tr>
              <tr><th>Min Bid Increment</th><td>{p.min_bid_amount} INR</td></tr>
              <tr><th>Opening</th><td>{fmt(p.started_at)}</td></tr>
              <tr><th>Closing</th><td>{fmt(p.expired_at)}</td></tr>
              <tr><th>Remaining</th><td><Countdown date={p.expired_at} /></td></tr>
              <tr><th>Your status</th><td>{p.rank_label}</td></tr>
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
            <div className="field"><label>Bid Amount</label><input type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter your amount" /></div>
            <div className="field" style={{ marginTop: 10 }}><label>Agent Amount</label><input type="number" min="0" step="any" value={agent} onChange={(e) => setAgent(e.target.value)} placeholder="Enter Agent Amount" /></div>
            <p className="lead" style={{ marginTop: 12 }}>You can bid {next} or above</p>
            {p.is_live && !p.is_sold && <button className="btn btn-gold" style={{ marginTop: 16 }}>Bid Now</button>}
          </form>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <p>Top bidders · status {p.rank_label}</p>
        <table>
          <thead><tr><th>S.No</th><th>Bidder</th><th>Amt (₹)</th><th>Position</th><th>Time</th></tr></thead>
          <tbody>
            {(data.max_bid || []).map((b, i) => (
              <tr key={b.id}>
                <td>{i + 1}</td>
                <td>{b.display_name}</td>
                <td>{b.amount}</td>
                <td>{String(b.position || "").toUpperCase()}</td>
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
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    api(`/user/auctions/${auctionId}/multiple`, { auth: "user" }).then((d) => {
      setProducts(d.products || []);
      setSelected(d.favourite_ids || []);
    });
  }, [auctionId]);
  return (
    <div className="bidder-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Favourites</p>
          <h2>Pick items for live room</h2>
          <p className="lead">Tick lots to favourite. At auction time the bidder room shows these first.</p>
        </div>
      </div>
      {msg && <div className="alert ok">{msg}</div>}
      <div className="action-row" style={{ marginBottom: 12 }}>
        <button
          className="btn btn-gold"
          type="button"
          onClick={async () => {
            await api("/user/watchlist", {
              method: "POST",
              body: { auction_id: Number(auctionId), productids: selected },
              auth: "user",
            });
            setMsg("Favourites saved");
            navigate(`/user/auction/${auctionId}/room`);
          }}
        >
          Save &amp; open room
        </button>
        <Link className="btn soft-toggle" to={`/user/auction/${auctionId}`}>Back to list</Link>
      </div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>★</th><th>Item ID</th><th>Item Name</th><th>Current Bid</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={(e) => setSelected(e.target.checked ? [...selected, p.id] : selected.filter((x) => x !== p.id))}
                  />
                </td>
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
    api(`/user/auctions/${auctionId}/watch`, { auth: "user" })
      .then((d) => setProducts(d.products || []))
      .catch((e) => setErr(e.message));
  }, [auctionId]);
  return (
    <div className="bidder-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Watch</p>
          <h2>My favourites</h2>
        </div>
        <Link className="btn btn-gold" to={`/user/auction/${auctionId}/room`}>Open bidder room</Link>
      </div>
      {err && <div className="alert err">{err}</div>}
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Item ID</th><th>Item Name</th><th>Current Bid</th><th>Status</th><th>Close</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.code}</td>
                <td><Link className="link" to={`/user/product/${p.auction_id}/${p.id}`}>{p.name}</Link></td>
                <td>{p.current_bid}</td>
                <td>{p.rank_label}</td>
                <td>{fmt(p.expired_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!products.length && <p className="empty-note">No favourites yet — star items on the list or pick favourites.</p>}
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

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

const FALLBACK = [
  {
    id: "f1",
    name: "E-waste clearance · Chennai desk",
    auction_type: "Open Auction",
    auction_category: "E-waste",
    statusLabel: "Live",
    started_at: new Date().toISOString(),
    expired_at: new Date(Date.now() + 6 * 3600000).toISOString(),
  },
  {
    id: "f2",
    name: "Home appliances liquidation",
    auction_type: "Open Auction",
    auction_category: "Home Appliances",
    statusLabel: "Upcoming",
    started_at: new Date(Date.now() + 86400000).toISOString(),
    expired_at: new Date(Date.now() + 2 * 86400000).toISOString(),
  },
  {
    id: "f3",
    name: "Mobile & PCB reverse desk",
    auction_type: "Reverse Auction",
    auction_category: "Mobile",
    statusLabel: "Upcoming",
    started_at: new Date(Date.now() + 2 * 86400000).toISOString(),
    expired_at: new Date(Date.now() + 3 * 86400000).toISOString(),
  },
  {
    id: "f4",
    name: "Consumer electronics surplus",
    auction_type: "Sealed Auction",
    auction_category: "Consumer Electronics",
    statusLabel: "Live",
    started_at: new Date(Date.now() - 3600000).toISOString(),
    expired_at: new Date(Date.now() + 5 * 3600000).toISOString(),
  },
  {
    id: "f5",
    name: "Hardware & electrical stores",
    auction_type: "Open Auction",
    auction_category: "Hardware",
    statusLabel: "Upcoming",
    started_at: new Date(Date.now() + 3 * 86400000).toISOString(),
    expired_at: new Date(Date.now() + 4 * 86400000).toISOString(),
  },
];

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso).slice(11, 16) || "—";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function normalize(live = [], upcoming = []) {
  const rows = [
    ...live.map((a) => ({ ...a, statusLabel: "Live" })),
    ...upcoming.map((a) => ({ ...a, statusLabel: "Upcoming" })),
  ];
  return rows.length ? rows : FALLBACK;
}

export default function AuctionScroll() {
  const [items, setItems] = useState(FALLBACK);
  const trackRef = useRef(null);
  const pause = useRef(false);

  useEffect(() => {
    api("/public/auctions")
      .then((d) => setItems(normalize(d.live || [], d.upcoming || [])))
      .catch(() => setItems(FALLBACK));
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    let raf;
    const step = () => {
      if (!pause.current && el) {
        el.scrollLeft += 0.55;
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) {
          el.scrollLeft = 0;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [items.length]);

  const cards = [...items, ...items];

  return (
    <section className="section auction-scroll-section">
      <div className="container auction-scroll-head">
        <div>
          <p className="chip">Floor schedule</p>
          <h2>Live &amp; upcoming auctions</h2>
          <p className="lead">Titles, dates and clocks for desks open now or about to open.</p>
        </div>
        <Link className="btn btn-gold" to="/auction">View all auctions</Link>
      </div>

      <div
        className="auction-scroll"
        ref={trackRef}
        onMouseEnter={() => { pause.current = true; }}
        onMouseLeave={() => { pause.current = false; }}
        onTouchStart={() => { pause.current = true; }}
        onTouchEnd={() => { pause.current = false; }}
      >
        <div className="auction-scroll-track">
          {cards.map((a, i) => (
            <article
              className={`auction-card ${a.statusLabel === "Live" ? "is-live" : "is-upcoming"}`}
              key={`${a.id}-${i}`}
              style={{ animationDelay: `${(i % items.length) * 0.08}s` }}
            >
              <div className="auction-card-top">
                <span className={`auction-status ${a.statusLabel === "Live" ? "live" : "soon"}`}>
                  {a.statusLabel === "Live" ? "● Live" : "Upcoming"}
                </span>
                <span className="auction-type">{a.auction_type || "Auction"}</span>
              </div>
              <h3 className="auction-card-title">{a.name}</h3>
              {a.auction_category && <p className="auction-cat">{a.auction_category}</p>}
              <div className="auction-meta">
                <div>
                  <span>Starts</span>
                  <b>{formatDate(a.started_at)}</b>
                  <em>{formatTime(a.started_at)}</em>
                </div>
                <div>
                  <span>Closes</span>
                  <b>{formatDate(a.expired_at)}</b>
                  <em>{formatTime(a.expired_at)}</em>
                </div>
              </div>
              <Link className="auction-card-link" to="/auction">
                Open desk →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

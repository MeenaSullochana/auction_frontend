import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth";
import { api } from "../api";
import Logo from "./Logo";

const FALLBACK_TAGS = [
  "Chennai floor",
  "Approved vendors",
  "Fair clock",
  "E-waste",
  "Liquidation",
];

function pastHero() {
  const hero = document.querySelector(".slider, .page-hero, .formats-hero, .content-showcase");
  if (!hero) return window.scrollY > 80;
  return hero.getBoundingClientRect().bottom <= 88;
}

export default function PublicLayout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [liveNames, setLiveNames] = useState([]);
  const [showingLive, setShowingLive] = useState(false);
  const location = useLocation();
  const lastY = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      api("/public/auctions")
        .then((d) => {
          if (cancelled) return;
          const live = (d.live || []).map((a) => a.name).filter(Boolean);
          if (live.length) {
            setLiveNames(live);
            setShowingLive(true);
          } else {
            const upcoming = (d.upcoming || []).map((a) => a.name).filter(Boolean);
            setLiveNames(upcoming.slice(0, 6));
            setShowingLive(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setLiveNames([]);
            setShowingLive(false);
          }
        });
    };
    load();
    const t = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const marqueeItems = liveNames.length
    ? liveNames.map((name) => ({
        type: showingLive ? "live" : "soon",
        name,
      }))
    : FALLBACK_TAGS.map((name) => ({ type: "tag", name }));
  const loop = [...marqueeItems, ...marqueeItems];

  useEffect(() => {
    setOpen(false);
    setHidden(false);
    lastY.current = window.scrollY;
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const overContent = pastHero();
      setScrolled(overContent);

      const goingDown = y > lastY.current + 6;
      const goingUp = y < lastY.current - 6;

      if (!overContent || y < 40) {
        setHidden(false);
      } else if (goingDown && !open) {
        setHidden(true);
      } else if (goingUp) {
        setHidden(false);
      }

      lastY.current = y;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [location.pathname, open]);

  return (
    <div className="site">
      <div className="site-orb site-orb-a" aria-hidden />
      <div className="site-orb site-orb-b" aria-hidden />

      <header
        className={[
          "public-header",
          scrolled ? "is-scrolled" : "is-top over-hero",
          hidden ? "is-hidden" : "is-visible",
        ].join(" ")}
      >
        <div className="header-marquee" aria-label="Live auctions">
          <div className="header-marquee-track">
            {loop.map((item, i) => (
              <span
                className={`header-marquee-tag ${item.type === "live" ? "is-live-auction" : ""} ${item.type === "soon" ? "is-soon-auction" : ""}`}
                key={`${item.name}-${i}`}
              >
                {item.type === "live" && (
                  <span className="live-blink">
                    <i className="live-dot" />
                    LIVE
                  </span>
                )}
                {item.type === "soon" && (
                  <span className="soon-badge">UPCOMING</span>
                )}
                <span className="marquee-auction-name">{item.name}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="header-inner">
          <Logo to="/" size="md" />
          <button className="btn btn-ghost" onClick={() => setOpen((v) => !v)} id="menuBtn" type="button">
            Menu
          </button>
          <nav className={`nav ${open ? "open" : ""}`}>
            <NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/about" onClick={() => setOpen(false)}>About</NavLink>
            <div className="drop">
              <span>Services</span>
              <div className="drop-menu">
                <Link to="/services/e-waste" onClick={() => setOpen(false)}>E-waste</Link>
                <Link to="/services/liquidation" onClick={() => setOpen(false)}>Liquidation</Link>
              </div>
            </div>
            <div className="drop">
              <span>Auctions</span>
              <div className="drop-menu">
                <Link to="/auctions/open" onClick={() => setOpen(false)}>Open Auction</Link>
                <Link to="/auctions/sealed" onClick={() => setOpen(false)}>Sealed Auction</Link>
                <Link to="/auctions/reverse" onClick={() => setOpen(false)}>Reverse Auction</Link>
              </div>
            </div>
            <NavLink to="/contact" onClick={() => setOpen(false)}>Contact</NavLink>
          </nav>
          {user ? (
            <Link className="btn btn-login" to="/user/dashboard">Floor</Link>
          ) : (
            <Link className="btn btn-login" to="/login">Login</Link>
          )}
        </div>
      </header>

      <main className="site-main" key={location.pathname}>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <Logo to="/" size="lg" />
          <div>
            <strong>Sales</strong>
            <Link to="/services/e-waste">E-waste</Link>
            <Link to="/services/liquidation">Liquidation</Link>
            <Link to="/auctions/open">Open auction</Link>
          </div>
          <div>
            <strong>Auctions</strong>
            <Link to="/auctions/sealed">Sealed</Link>
            <Link to="/auctions/reverse">Reverse</Link>
            <Link to="/auction">Live lots</Link>
          </div>
          <div>
            <strong>House</strong>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/login">Login</Link>
          </div>
          <div>
            <strong>Chennai desk</strong>
            <span>+91 98412 81212</span>
            <span>auction@gmail.com</span>
          </div>
        </div>
        <p className="copy">© {new Date().getFullYear()} The Auction House. Bidding records stay with the lot.</p>
      </footer>
    </div>
  );
}

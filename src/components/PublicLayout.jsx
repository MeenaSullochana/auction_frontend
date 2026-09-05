import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth";
import Logo from "./Logo";

const MARQUEE_TAGS = [
  "Plant & machinery",
  "Commercial vehicles",
  "Process scrap",
  "Unused stores",
  "Unclaimed cargo",
  "Disposal auction",
  "Procurement auction",
  "Transparent bid tape",
  "Approved vendors",
  "Chennai floor",
  "Live catalogue",
  "Fair clock",
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
  const location = useLocation();
  const lastY = useRef(0);
  const loop = [...MARQUEE_TAGS, ...MARQUEE_TAGS];

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
        <div className="header-marquee" aria-hidden>
          <div className="header-marquee-track">
            {loop.map((tag, i) => (
              <span className="header-marquee-tag" key={`${tag}-${i}`}>
                {tag}
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
                <Link to="/disposal-auction" onClick={() => setOpen(false)}>Disposal auction</Link>
                <Link to="/procurement-auction" onClick={() => setOpen(false)}>Procurement auction</Link>
              </div>
            </div>
            <NavLink to="/auction" onClick={() => setOpen(false)}>Auctions</NavLink>
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
            <Link to="/disposal-auction">Disposal</Link>
            <Link to="/procurement-auction">Procurement</Link>
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

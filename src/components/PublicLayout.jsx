import { NavLink, Outlet, Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth";
import Logo from "./Logo";

export default function PublicLayout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <div className="site">
      <header className="public-header">
        <div className="header-inner">
          <Logo to="/" size="md" />
          <button className="btn btn-ghost" onClick={() => setOpen((v) => !v)} id="menuBtn" type="button">
            Menu
          </button>
          <nav className={`nav ${open ? "open" : ""}`}>
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <div className="drop">
              <span>Services</span>
              <div className="drop-menu">
                <Link to="/disposal-auction">Disposal auction</Link>
                <Link to="/procurement-auction">Procurement auction</Link>
              </div>
            </div>
            <NavLink to="/auction">Auctions</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>
          {user ? (
            <Link className="btn btn-login" to="/user/dashboard">Floor</Link>
          ) : (
            <Link className="btn btn-login" to="/login">Login</Link>
          )}
        </div>
      </header>
      <Outlet />
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

import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import Logo from "./Logo";

function NavGroup({ label, match, children }) {
  const location = useLocation();
  const active = match(location.pathname);
  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  return (
    <div className={`nav-group ${open ? "open" : ""} ${active ? "active-group" : ""}`}>
      <button type="button" className="nav-group-btn" onClick={() => setOpen((v) => !v)}>
        <span>{label}</span>
        <span className="chev">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="nav-sub">{children}</div>}
    </div>
  );
}

export default function AdminLayout() {
  const { logoutAdmin } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="dash">
      <aside className="side">
        <Logo to="/admin/dashboard" size="sm" />
        <nav>
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/brand">Logo &amp; Colors</NavLink>
          <NavLink to="/admin/sliders">Sliders</NavLink>

          <NavGroup label="Auctions" match={(p) => p.startsWith("/admin/auctions")}>
            <NavLink to="/admin/auctions/create">Create Auction</NavLink>
            <NavLink to="/admin/auctions/all">All</NavLink>
            <NavLink to="/admin/auctions/live">Live</NavLink>
            <NavLink to="/admin/auctions/upcoming">Upcoming</NavLink>
            <NavLink to="/admin/auctions/expired">Completed</NavLink>
          </NavGroup>

          <NavLink to="/admin/reports">Reports</NavLink>
          <NavLink to="/admin/products/add">Add Product</NavLink>
          <NavLink to="/admin/products/import">Import Product</NavLink>
          <NavLink to="/admin/winners">Winners</NavLink>

          <NavGroup
            label="Vendors"
            match={(p) =>
              p.startsWith("/admin/users")
              || p.startsWith("/admin/user/")
              || p.startsWith("/admin/vendors")
              || p.startsWith("/admin/companies")
            }
          >
            <NavLink to="/admin/users/all">All Vendors</NavLink>
            <NavLink to="/admin/users/active">Active</NavLink>
            <NavLink to="/admin/users/inactive">Inactive</NavLink>
            <NavLink to="/admin/companies">Companies</NavLink>
          </NavGroup>

          <NavLink to="/admin/contacts">Contact Enquiries</NavLink>
          <button className="linkish" onClick={() => { logoutAdmin(); navigate("/admin"); }}>Logout</button>
        </nav>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  );
}

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import Logo from "./Logo";

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
          <NavLink to="/admin/categories">Categories</NavLink>
          <NavLink to="/admin/auctions/all">All Auctions</NavLink>
          <NavLink to="/admin/auctions/live">Live Auction</NavLink>
          <NavLink to="/admin/auctions/upcoming">Upcoming Auction</NavLink>
          <NavLink to="/admin/auctions/expired">Expired Auction</NavLink>
          <NavLink to="/admin/products/add">Add Product</NavLink>
          <NavLink to="/admin/products/import">Import Product</NavLink>
          <NavLink to="/admin/winners">Winners</NavLink>
          <NavLink to="/admin/users/all">Users</NavLink>
          <NavLink to="/admin/users/pending">Pending Users</NavLink>
          <NavLink to="/admin/users/active">Active Users</NavLink>
          <NavLink to="/admin/contacts">Contact Enquiries</NavLink>
          <button className="linkish" onClick={() => { logoutAdmin(); navigate("/admin"); }}>Logout</button>
        </nav>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  );
}

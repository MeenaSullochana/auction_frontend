import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import Logo from "./Logo";

export default function UserLayout() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="dash bidder-dash">
      <aside className="side">
        <Logo to="/" size="sm" />
        <div className="bidder-side-meta">
          <p className="eyebrow">Vendor login</p>
          <p className="bidder-name">{user?.firm_name || user?.username}</p>
          <p className="lead">{user?.username}{user?.unique_id ? ` · ${user.unique_id}` : ""}</p>
        </div>
        <nav>
          <NavLink to="/user/dashboard">My Auctions</NavLink>
          <NavLink to="/user/winning-history">Winning History</NavLink>
          <NavLink to="/user/change-password">Change Password</NavLink>
          <NavLink to="/contact">Contact Enquiry</NavLink>
          <button
            className="linkish"
            onClick={() => {
              logoutUser();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </nav>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

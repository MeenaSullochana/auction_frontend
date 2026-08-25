import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import Logo from "./Logo";

export default function UserLayout() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="dash">
      <aside className="side">
        <Logo to="/" size="sm" />
        <p className="lead" style={{ marginTop: 18 }}>{user?.username}</p>
        <nav>
          <NavLink to="/user/dashboard">Dashboard</NavLink>
          <NavLink to="/user/winning-history">Wining History</NavLink>
          <NavLink to="/user/change-password">Change Password</NavLink>
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

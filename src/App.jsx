import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth";
import PublicLayout from "./components/PublicLayout";
import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/AdminLayout";
import { About, AuctionPage, AuctionTypeDetail, Contact, Disposal, Home, Procurement, ServiceDetail } from "./pages/PublicPages";
import { AdminLogin, ForgotPassword, Login } from "./pages/AuthPages";
import { AuctionProducts, BidderRoom, ChangePassword, MultipleBid, ProductBid, UserDashboard, WatchList, WinningHistory } from "./pages/UserPages";
import { AdminDash, BrandSettings, Contacts, ImportProducts, ProductBids, ProductForm, Products, UserDetail, Users, Winners } from "./pages/AdminPages";
import { Auctions, Reports } from "./pages/AdminAuctions";
import { Companies, CompanyDetail, Sliders, VendorCreate, VendorDetail, Vendors } from "./pages/AdminPartners";

function UserGate({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminArea() {
  const { admin, ready } = useAuth();
  if (!ready) return null;
  if (!admin) return <AdminLogin />;
  return <AdminLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/disposal-auction" element={<Disposal />} />
        <Route path="/procurement-auction" element={<Procurement />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/auctions/:type" element={<AuctionTypeDetail />} />
        <Route path="/auction" element={<AuctionPage />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/password/reset" element={<ForgotPassword />} />

      <Route path="/user" element={<UserGate><UserLayout /></UserGate>}>
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="winning-history" element={<WinningHistory />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="auction/:id" element={<AuctionProducts />} />
        <Route path="auction/:id/room" element={<BidderRoom />} />
        <Route path="auction/:auctionId/multiple" element={<MultipleBid />} />
        <Route path="auction/:auctionId/watch" element={<WatchList />} />
        <Route path="product/:auctionId/:id" element={<ProductBid />} />
      </Route>

      <Route path="/admin" element={<AdminArea />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDash />} />
        <Route path="brand" element={<BrandSettings />} />
        <Route path="sliders" element={<Sliders />} />
        <Route path="auctions/:type" element={<Auctions />} />
        <Route path="reports" element={<Reports />} />
        <Route path="products/add" element={<ProductForm mode="create" />} />
        <Route path="products/import" element={<ImportProducts />} />
        <Route path="products/edit/:id" element={<ProductForm mode="edit" />} />
        <Route path="products/:id/bids" element={<ProductBids />} />
        <Route path="products/:type" element={<Products />} />
        <Route path="winners" element={<Winners />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="vendors/new" element={<VendorCreate />} />
        <Route path="vendors/:id" element={<VendorDetail />} />
        <Route path="companies" element={<Companies />} />
        <Route path="companies/:id" element={<CompanyDetail />} />
        <Route path="users/:scope" element={<Users />} />
        <Route path="user/:id" element={<UserDetail />} />
        <Route path="contacts" element={<Contacts />} />
      </Route>
    </Routes>
  );
}

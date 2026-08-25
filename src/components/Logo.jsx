import { Link } from "react-router-dom";
import { useSite } from "../site";

export default function Logo({ to = "/", size = "md", className = "" }) {
  const { site } = useSite();
  const inner = (
    <span className={`wordmark ${size} ${className}`}>
      <span className="w-the" style={{ color: site.colorThe }}>{site.wordThe}</span>
      <span className="w-auction" style={{ color: site.colorAuction }}>{site.wordAuction}</span>
      <span className="w-house" style={{ color: site.colorHouse }}>{site.wordHouse}</span>
    </span>
  );
  if (!to) return inner;
  return <Link to={to} className="brand-link">{inner}</Link>;
}

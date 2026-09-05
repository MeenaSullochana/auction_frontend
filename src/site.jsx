import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

export const DEFAULT_SITE = {
  wordThe: "THE",
  wordAuction: "AUCTION",
  wordHouse: "HOUSE",
  colorThe: "#5F8F54",
  colorAuction: "#1A1E1A",
  colorHouse: "#5F8F54",
  colorBg: "#050605",
  colorPanel: "#121A13",
  colorAccent: "#7AAB6D",
  colorAccent2: "#A3C496",
  colorText: "#F4F7F2",
  colorMuted: "#A8B8A4",
  adminNotifyEmail: "auction@gmail.com",
  vendorEnrolmentMail:
    "Dear Vendor,\n\nThank you for your enquiry with The Auction House.\n\nPlease find enclosed / request for:\n1. Vendor enrolment documents\n2. Auction House terms & conditions\n3. Vendor registration fee details\n\nKindly complete registration after document submission.\n\nRegards,\nThe Auction House\nChennai",
};

function hexToRgba(hex, a) {
  const h = String(hex || "").replace("#", "");
  if (h.length !== 6) return `rgba(147,196,125,${a})`;
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export function applyTheme(s) {
  const r = document.documentElement;
  r.style.setProperty("--ink", s.colorBg || DEFAULT_SITE.colorBg);
  r.style.setProperty("--navy", s.colorPanel || DEFAULT_SITE.colorPanel);
  r.style.setProperty("--panel", s.colorPanel || DEFAULT_SITE.colorPanel);
  r.style.setProperty("--copper", s.colorAccent || DEFAULT_SITE.colorAccent);
  r.style.setProperty("--copper-2", s.colorAccent2 || DEFAULT_SITE.colorAccent2);
  r.style.setProperty("--cream", s.colorText || DEFAULT_SITE.colorText);
  r.style.setProperty("--muted", s.colorMuted || DEFAULT_SITE.colorMuted);
  r.style.setProperty("--line", hexToRgba(s.colorAccent || DEFAULT_SITE.colorAccent, 0.22));
}

const SiteContext = createContext({ site: DEFAULT_SITE, refresh: () => {} });

export function SiteProvider({ children }) {
  const [site, setSite] = useState(DEFAULT_SITE);
  const load = () =>
    api("/public/settings")
      .then((d) => {
        const next = { ...DEFAULT_SITE, ...(d.settings || {}) };
        setSite(next);
        applyTheme(next);
        document.title = `${next.wordThe} ${next.wordAuction} ${next.wordHouse}`.replace(/\s+/g, " ").trim();
      })
      .catch(() => applyTheme(DEFAULT_SITE));
  useEffect(() => { load(); }, []);
  return <SiteContext.Provider value={{ site, refresh: load }}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}

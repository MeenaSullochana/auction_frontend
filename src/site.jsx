import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

export const DEFAULT_SITE = {
  wordThe: "THE",
  wordAuction: "AUCTION",
  wordHouse: "HOUSE",
  colorThe: "#5F8F54",
  colorAuction: "#1A1E1A",
  colorHouse: "#5F8F54",
  colorBg: "#F2F5F2",
  colorPanel: "#FFFFFF",
  colorAccent: "#7AAB6D",
  colorAccent2: "#5F8F54",
  colorText: "#1A1E1A",
  colorMuted: "#5E6A5E",
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
  const raw = { ...DEFAULT_SITE, ...(s || {}) };
  const bg = String(raw.colorBg || "").toLowerCase();
  const legacyDark = ["#050605", "#000000", "#0a0f0b", "#121a13"].includes(bg);
  const next = legacyDark
    ? {
        ...raw,
        colorBg: DEFAULT_SITE.colorBg,
        colorPanel: DEFAULT_SITE.colorPanel,
        colorAccent: DEFAULT_SITE.colorAccent,
        colorAccent2: DEFAULT_SITE.colorAccent2,
        colorText: DEFAULT_SITE.colorText,
        colorMuted: DEFAULT_SITE.colorMuted,
        colorThe: DEFAULT_SITE.colorThe,
        colorAuction: DEFAULT_SITE.colorAuction,
        colorHouse: DEFAULT_SITE.colorHouse,
      }
    : raw;
  const r = document.documentElement;
  r.style.setProperty("--ink", next.colorBg || DEFAULT_SITE.colorBg);
  r.style.setProperty("--navy", next.colorPanel || DEFAULT_SITE.colorPanel);
  r.style.setProperty("--panel", next.colorPanel || DEFAULT_SITE.colorPanel);
  r.style.setProperty("--copper", next.colorAccent || DEFAULT_SITE.colorAccent);
  r.style.setProperty("--copper-2", next.colorAccent2 || DEFAULT_SITE.colorAccent2);
  r.style.setProperty("--cream", next.colorText || DEFAULT_SITE.colorText);
  r.style.setProperty("--muted", next.colorMuted || DEFAULT_SITE.colorMuted);
  r.style.setProperty("--line", hexToRgba(next.colorText || DEFAULT_SITE.colorText, 0.12));
  r.style.setProperty("--shadow", "0 18px 44px rgba(26, 40, 26, 0.08)");
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

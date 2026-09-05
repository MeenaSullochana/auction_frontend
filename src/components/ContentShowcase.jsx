import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Home showcase — short copy from your category briefs.
 * Backgrounds are related stock photos (not the exact collage/mockup images).
 */
export const SHOWCASE_SLIDES = [
  {
    id: "formats",
    label: "Auction",
    title: "Open · Reverse · Sealed",
    text: "Three clear desks — rising bids, falling prices, or confidential closes.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1800&q=80",
    cta: { label: "Open auction", to: "/auctions/open" },
  },
  {
    id: "ewaste",
    label: "E-waste",
    title: "Clear e-waste the right way",
    text: "Safe collection, recycling and EPR support — value recovered, compliance kept.",
    image:
      "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=1800&q=80",
    cta: { label: "E-waste", to: "/services/e-waste" },
  },
  {
    id: "liquidation",
    label: "Liquidation",
    title: "Idle stock → working capital",
    text: "Excess and end-of-life inventory cleared through a transparent auction desk.",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1800&q=80",
    cta: { label: "Liquidation", to: "/services/liquidation" },
  },
  {
    id: "mobile",
    label: "Mobile",
    title: "Mobile phones in bulk",
    text: "Handsets and parts — PCBs, screens, cameras, batteries — sold with a recorded close.",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1800&q=80",
    cta: { label: "Mobile lots", to: "/auction" },
  },
  {
    id: "consumer",
    label: "Consumer Electronics",
    title: "Consumer electronics",
    text: "TVs, laptops, printers and routers — excess cleared cleanly for principals.",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1800&q=80",
    cta: { label: "Electronics", to: "/auction" },
  },
  {
    id: "home",
    label: "Home Appliances",
    title: "Home appliances",
    text: "Washers, fridges, ACs and parts — bulk lots with a simple, fair clock.",
    image:
      "https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=1800&q=80",
    cta: { label: "Home Appliances", to: "/auction" },
  },
  {
    id: "kitchen",
    label: "Kitchen Appliances",
    title: "Kitchen & small appliances",
    text: "Mixers, kettles, microwaves and more — surplus moved in organised sales.",
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1800&q=80",
    cta: { label: "Kitchen lots", to: "/auction" },
  },
  {
    id: "hardware",
    label: "Hardware & Electrical",
    title: "Hardware & electrical",
    text: "Cables, switches, lighting and tools — idle stores returned to market.",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1800&q=80",
    cta: { label: "Hardware lots", to: "/auction" },
  },
  {
    id: "auto",
    label: "Auto Mobile",
    title: "Autos & spare parts",
    text: "Vehicles and components — fleets and workshops cleared at fair market value.",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&q=80",
    cta: { label: "Auto Mobile", to: "/services/liquidation" },
  },
];

export default function ContentShowcase({ slides = SHOWCASE_SLIDES, autoMs = 6500 }) {
  const [i, setI] = useState(0);
  const list = slides.length ? slides : SHOWCASE_SLIDES;
  const slide = list[i % list.length];

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % list.length), autoMs);
    return () => clearInterval(t);
  }, [list.length, autoMs]);

  return (
    <section className="content-showcase content-showcase--bg">
      {list.map((s, n) => (
        <img
          key={s.id}
          className={`cs-bg ${n === i ? "on" : ""}`}
          src={s.image}
          alt=""
          aria-hidden={n !== i}
        />
      ))}
      <div className="cs-shade" />

      <div className="container cs-overlay" key={slide.id}>
        <p className="chip chip-on-dark">{slide.label}</p>
        <h2 className="cs-title">{slide.title}</h2>
        <p className="cs-lead">{slide.text}</p>
        {slide.cta && (
          <Link className="btn btn-gold cs-cta" to={slide.cta.to}>
            {slide.cta.label}
          </Link>
        )}
      </div>

      <div className="container cs-controls">
        <button
          type="button"
          className="btn cs-nav"
          onClick={() => setI((n) => (n - 1 + list.length) % list.length)}
        >
          Prev
        </button>
        <span className="cs-pill">
          {i + 1} / {list.length} · {slide.label}
        </span>
        <button type="button" className="btn cs-nav" onClick={() => setI((n) => (n + 1) % list.length)}>
          Next
        </button>
      </div>

      <div className="cs-cats">
        <div className="container cs-cats-row">
          {list.map((s, n) => (
            <button key={s.id} type="button" className={n === i ? "on" : ""} onClick={() => setI(n)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

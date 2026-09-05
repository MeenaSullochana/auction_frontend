import { Link, Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth";
import Reveal from "../components/Reveal";
import ContentShowcase from "../components/ContentShowcase";
import AuctionScroll from "../components/AuctionScroll";

const SERVICE_PAGES = {
  "e-waste": {
    chip: "Service",
    title: "E-waste",
    hero: "/media/online-showcase-ewaste.jpg",
    photo: "/media/online-ewaste-detail.jpg",
    headline: "Clear e-waste the right way.",
    lead:
      "Auction House helps companies manage and clear their e-waste in a proper and responsible manner. It supports the safe collection, segregation, recycling, and disposal of electronic waste through appropriate channels.",
    body:
      "Auction House also helps companies obtain Extended Producer Responsibility (EPR) credits by supporting proper e-waste recycling and compliance processes. This helps organizations reduce environmental impact, meet regulatory requirements, and recover value from their e-waste.",
    points: [
      "Safe collection, segregation and recycling channels",
      "EPR credit support for compliance teams",
      "Value recovery from boards, handsets, appliances and IT assets",
    ],
    cta: { label: "See live lots", to: "/auction" },
  },
  liquidation: {
    chip: "Service",
    title: "Liquidation",
    hero: "/media/hero-yard.jpg",
    photo: "/media/slide-machinery.jpg",
    headline: "Idle stock → working capital.",
    lead:
      "Auction House runs liquidation desks for excess, end-of-life and surplus inventory — plant stores, consumer goods, vehicles and unfinished lots — through a transparent bidding floor.",
    body:
      "One seller, many buyers and a shared clock: catalogues can be typed lot by lot or imported from Excel. Principals keep control of reserves while winners and amounts stay on record for collection and delivery.",
    points: [
      "Transparent rising bids for disposal and surplus clears",
      "Lot photos, codes, quantity and location on every card",
      "Winner reports with amounts and bidder names",
    ],
    cta: { label: "Request a desk", to: "/contact" },
  },
};

const AUCTION_TYPE_PAGES = {
  open: {
    chip: "Auction type",
    title: "Open Auction",
    hero: "/media/hero-floor.jpg",
    photo: "/media/slide-machinery.jpg",
    headline: "Prices start low and climb in the open.",
    lead:
      "Open auction is the classic rising-bid desk. Multiple approved buyers compete on a shared clock; every raise is visible on the bid tape until the highest accepted bid closes the lot.",
    body:
      "Use open format for liquidation and e-waste clears when principals want competitive, transparent pricing with live remaining time and anti-snipe extensions.",
    points: [
      "Visible bid ladder for every lot",
      "Live countdown with late-bid extensions",
      "Approved bidders only",
    ],
    cta: { label: "View live sales", to: "/auction" },
  },
  sealed: {
    chip: "Auction type",
    title: "Sealed Auction",
    hero: "/media/slide-scrap.jpg",
    photo: "/media/hero-fleet.jpg",
    headline: "Confidential bids until the desk opens the close.",
    lead:
      "In a sealed auction, buyers submit confidential offers without seeing competing amounts. The house opens the close on schedule and awards against the accepted sealed price.",
    body:
      "Choose sealed when principals want quiet, competitive offers — no public bid ladder during the sale window — with results attached to the lot for collection.",
    points: [
      "No public ladder during the window",
      "Scheduled open of sealed closes",
      "Results stay on the lot record",
    ],
    cta: { label: "Talk to the desk", to: "/contact" },
  },
  reverse: {
    chip: "Auction type",
    title: "Reverse Auction",
    hero: "/media/service-procurement.jpg",
    photo: "/media/slide-vehicles.jpg",
    headline: "One buyer. Competing vendors. Falling prices.",
    lead:
      "Reverse auction flips the floor: you publish what you need — spares, packing, transport or stores — and qualified sellers bid down to win the order on a shared, recorded clock.",
    body:
      "Purchasing teams can defend the final rate. Assign only approved vendors to a given sale — ideal for recurring industrial supply and procurement desks.",
    points: [
      "Vendors compete by lowering price",
      "Assign approved users per sale",
      "Recorded tape for audit-ready closes",
    ],
    cta: { label: "Request reverse desk", to: "/contact" },
  },
};

function DetailPage({ page }) {
  if (!page) return <Navigate to="/" replace />;
  const fallbackPhoto = "/media/hero-floor.jpg";
  return (
    <div className="topic-page">
      <div
        className="page-hero with-photo topic-hero"
        style={{ backgroundImage: `url(${page.hero}), url(${fallbackPhoto})` }}
      >
        <div className="container topic-hero-copy">
          <p className="chip chip-on-dark">{page.chip}</p>
          <h1>{page.title}</h1>
          <p className="topic-hero-lead">{page.lead}</p>
        </div>
      </div>
      <section className="section">
        <Reveal className="container split detail-split">
          <img
            className="round-photo detail-photo"
            src={page.photo}
            alt=""
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackPhoto;
            }}
          />
          <div>
            <h2>{page.headline}</h2>
            {page.body && <p className="lead">{page.body}</p>}
            <ul className="ticks">
              {page.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <Link className="btn btn-gold" to={page.cta.to}>{page.cta.label}</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

export function ServiceDetail() {
  const { slug } = useParams();
  return <DetailPage page={SERVICE_PAGES[slug]} />;
}

export function AuctionTypeDetail() {
  const { type } = useParams();
  return <DetailPage page={AUCTION_TYPE_PAGES[type]} />;
}

export function Home() {
  return (
    <div>
      <ContentShowcase />
      <section className="strip glass-strip">
        <div className="container strip-row">
          <span>Plant &amp; machinery</span>
          <span>Commercial vehicles</span>
          <span>Process scrap</span>
          <span>Unused stores</span>
          <span>Unclaimed cargo</span>
        </div>
      </section>
      <section className="section">
        <Reveal className="container split">
          <div>
            <p className="chip">Why yards choose us</p>
            <h2>A bidding floor that stays on record.</h2>
            <p className="lead">We host disposal sales for one seller and many buyers, and reverse auctions when a buyer needs competing vendors. Lots stay live with a public clock, bid history and anti-snipe extensions.</p>
            <ul className="ticks">
              <li>Approved bidder access only</li>
              <li>Lot photos, codes and duty notes on every card</li>
              <li>Excel import for large catalogues</li>
            </ul>
            <Link className="btn btn-gold" to="/about">Read our story</Link>
          </div>
          <div className="photo-stack">
            <img src="/media/online-home-why1.jpg" alt="Industrial plant floor" />
            <img src="/media/online-home-why2.jpg" alt="Workshop and machinery" />
          </div>
        </Reveal>
      </section>
      <AuctionScroll />
    </div>
  );
}

export function About() {
  return (
    <div>
      <div className="page-hero with-photo" style={{ backgroundImage: "url(/media/hero-floor.jpg)" }}>
        <div className="container">
          <p className="chip chip-on-dark">About the house</p>
          <h1>Built by people who have run yards, not just websites.</h1>
        </div>
      </div>
      <section className="section">
        <Reveal className="container split">
          <div>
            <h2>Industrial sales, held in the open.</h2>
            <p className="lead">The Auction House is a Chennai bidding desk for plant and machinery, commercial vehicles, process scrap, unused stores and unclaimed air or surface cargo. Principals keep control of reserves. Bidders see the same catalogue, the same clock and the same bid tape.</p>
            <p className="lead">Our floor team knows disposal sales and reverse procurement. Catalogues can be typed lot by lot or imported from Excel. Winning bids stay attached to the user record for collection and delivery.</p>
          </div>
          <img className="round-photo" src="/media/slide-scrap.jpg" alt="Catalogued scrap lots" />
        </Reveal>
      </section>
      <section className="section alt">
        <div className="container grid-3">
          <Reveal className="card" delay={0}><h3>Clear lots</h3><p>Every item carries a code, quantity, location and optional duty notes before bidding starts.</p></Reveal>
          <Reveal className="card" delay={90}><h3>Fair clock</h3><p>Live lots show remaining time. Late bids can extend the close so nobody wins on a last-second trick alone.</p></Reveal>
          <Reveal className="card" delay={180}><h3>Known bidders</h3><p>Accounts are approved before they can raise. Banned or pending users stay off the floor.</p></Reveal>
        </div>
      </section>
    </div>
  );
}

export function Disposal() {
  return <Navigate to="/services/liquidation" replace />;
}

export function Procurement() {
  return <Navigate to="/auctions/reverse" replace />;
}

export function AuctionPage() {
  const [data, setData] = useState({ live: [], upcoming: [] });
  useEffect(() => {
    api("/public/auctions").then(setData).catch(() => {});
  }, []);
  return (
    <div>
      <div className="page-hero with-photo" style={{ backgroundImage: "url(/media/hero-yard.jpg)" }}>
        <div className="container">
          <p className="chip chip-on-dark">Floor</p>
          <h1>Live and upcoming sales</h1>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{ marginBottom: 24 }}>
          <div className="action-row">
            <Link className="btn soft-toggle" to="/auctions/open">Open Auction</Link>
            <Link className="btn soft-toggle" to="/auctions/sealed">Sealed Auction</Link>
            <Link className="btn soft-toggle" to="/auctions/reverse">Reverse Auction</Link>
          </div>
        </div>
        <div className="container grid-2">
          <Reveal className="card" delay={0}>
            <h3>Open now</h3>
            <ul className="lot-list">
              {data.live.map((a) => <li key={a.id}>{a.name}{a.auction_type ? ` · ${a.auction_type}` : ""}</li>)}
            </ul>
            {!data.live.length && <p className="lead">No live sale at this hour. Check upcoming lots or request access.</p>}
          </Reveal>
          <Reveal className="card" delay={100}>
            <h3>On the calendar</h3>
            <ul className="lot-list">
              {data.upcoming.map((a) => <li key={a.id}>{a.name}{a.auction_type ? ` · ${a.auction_type}` : ""}</li>)}
            </ul>
            {!data.upcoming.length && <p className="lead">No upcoming sale posted yet.</p>}
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function profileToEnquiry(user) {
  if (!user) {
    return {
      firm_name: "",
      address: "",
      contact_person: "",
      contact_no: "",
      email: "",
      message: "",
    };
  }
  const contactPerson =
    user.contact_person
    || `${user.firstname || ""} ${user.lastname || ""}`.trim()
    || user.name
    || user.username
    || "";
  return {
    firm_name: user.firm_name || "",
    address: user.address || "",
    contact_person: contactPerson,
    contact_no: user.contact_no || user.mobile || "",
    email: user.email || user.contact_email || "",
    message: "",
  };
}

export function Contact() {
  const { user, ready } = useAuth();
  const [form, setForm] = useState(profileToEnquiry(null));
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!ready) return;
    setForm((prev) => {
      const filled = profileToEnquiry(user);
      // Keep any message the user already typed; overwrite identity fields from profile when logged in.
      return { ...filled, message: prev.message || "" };
    });
  }, [ready, user]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <div>
      <div className="page-hero with-photo" style={{ backgroundImage: "url(/media/hero-floor.jpg)" }}>
        <div className="container">
          <p className="chip chip-on-dark">Desk</p>
          <h1>Contact the Chennai floor</h1>
        </div>
      </div>
      <section className="section">
        <Reveal className="container contact-grid contact-grid--trio">
          <div className="contact-intro">
            <h2>Vendor enquiry</h2>
            <p className="lead">
              Submit enrolment details below. We share documents, terms &amp; registration fee by email, then complete vendor setup with a unique ID in admin.
            </p>
          </div>

          <aside className="contact-side-card">
            <h3>Chennai desk</h3>
            <a className="contact-side-row" href="tel:+919841281212">
              <span className="contact-side-icon" aria-hidden>
                <i className="las la-phone" />
              </span>
              <span>
                <small>Phone</small>
                <strong>+91 98412 81212</strong>
              </span>
            </a>
            <a className="contact-side-row" href="mailto:auction@gmail.com">
              <span className="contact-side-icon" aria-hidden>
                <i className="las la-envelope" />
              </span>
              <span>
                <small>Email</small>
                <strong>auction@gmail.com</strong>
              </span>
            </a>
            <div className="contact-side-row">
              <span className="contact-side-icon" aria-hidden>
                <i className="las la-map-marker" />
              </span>
              <span>
                <small>Location</small>
                <strong>Chennai, Tamil Nadu</strong>
              </span>
            </div>
          </aside>

          <form
            className="card glass-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setMsg("");
              setErr("");
              try {
                const data = await api("/public/contact", { method: "POST", body: form });
                setMsg(data.message);
                setForm(profileToEnquiry(user));
              } catch (ex) {
                setErr(ex.message || "Could not send enquiry");
              }
            }}
          >
            {user && (
              <p className="lead" style={{ marginBottom: 12 }}>
                Signed in as <strong>{user.username}</strong> — firm and contact fields are filled from your vendor profile.
              </p>
            )}
            {msg && <div className="alert ok">{msg}</div>}
            {err && <div className="alert err">{err}</div>}
            <div className="form-grid">
              <div className="field"><label>Firm Name</label><input name="firm_name" required value={form.firm_name} onChange={onChange} /></div>
              <div className="field"><label>Contact Person</label><input name="contact_person" required value={form.contact_person} onChange={onChange} /></div>
              <div className="field full"><label>Address</label><input name="address" required value={form.address} onChange={onChange} /></div>
              <div className="field"><label>Contact No</label><input name="contact_no" required value={form.contact_no} onChange={onChange} /></div>
              <div className="field"><label>Email</label><input name="email" type="email" required value={form.email} onChange={onChange} /></div>
              <div className="field full"><label>Message (optional)</label><textarea name="message" rows="4" value={form.message} onChange={onChange} /></div>
            </div>
            <button className="btn btn-gold" style={{ marginTop: 16 }}>Send enquiry</button>
          </form>
        </Reveal>
      </section>
    </div>
  );
}

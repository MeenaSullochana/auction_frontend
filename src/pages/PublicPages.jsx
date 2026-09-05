import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth";
import Reveal from "../components/Reveal";
import ContentShowcase from "../components/ContentShowcase";
import AuctionScroll from "../components/AuctionScroll";

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
            <img src="/media/service-disposal.jpg" alt="Disposal auction on a factory floor" />
            <img src="/media/service-procurement.jpg" alt="Procurement auction with vendors" />
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
  return (
    <div>
      <div className="page-hero with-photo" style={{ backgroundImage: "url(/media/service-disposal.jpg)" }}>
        <div className="container">
          <p className="chip chip-on-dark">Service</p>
          <h1>Disposal auction</h1>
        </div>
      </div>
      <section className="section">
        <Reveal className="container split">
          <img className="round-photo" src="/media/slide-vehicles.jpg" alt="Vehicles listed for disposal" />
          <div>
            <h2>One seller. Many buyers. Rising prices.</h2>
            <p className="lead">Use disposal when you need to clear a factory line, a vehicle fleet, scrap heaps or leftover stores. We publish the catalogue, collect approved bids and hand you a winner report with amounts and bidder names.</p>
            <ul className="ticks">
              <li>Seller keeps the right to accept or reject</li>
              <li>Suitable for PSUs, private plants and cargo yards</li>
              <li>Photos and condition notes sit on each product card</li>
            </ul>
            <Link className="btn btn-gold" to="/auction">See current sales</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

export function Procurement() {
  return (
    <div>
      <div className="page-hero with-photo" style={{ backgroundImage: "url(/media/service-procurement.jpg)" }}>
        <div className="container">
          <p className="chip chip-on-dark">Service</p>
          <h1>Procurement auction</h1>
        </div>
      </div>
      <section className="section">
        <Reveal className="container split">
          <div>
            <h2>One buyer. Competing vendors. Falling prices.</h2>
            <p className="lead">Reverse the usual auction. You publish what you need — spares, packing, transport or stores — and qualified sellers bid down to win the order. The tape is visible, so purchasing teams can defend the final rate.</p>
            <ul className="ticks">
              <li>Vendor competition on a shared clock</li>
              <li>Useful for recurring industrial supply</li>
              <li>Assign only approved users to a given sale</li>
            </ul>
            <Link className="btn btn-gold" to="/contact">Request a procurement desk</Link>
          </div>
          <img className="round-photo" src="/media/slide-scrap.jpg" alt="Stores and spares for procurement" />
        </Reveal>
      </section>
    </div>
  );
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
        <div className="container grid-2">
          <Reveal className="card" delay={0}>
            <h3>Open now</h3>
            <ul className="lot-list">
              {data.live.map((a) => <li key={a.id}>{a.name}</li>)}
            </ul>
            {!data.live.length && <p className="lead">No live sale at this hour. Check upcoming lots or request access.</p>}
          </Reveal>
          <Reveal className="card" delay={100}>
            <h3>On the calendar</h3>
            <ul className="lot-list">
              {data.upcoming.map((a) => <li key={a.id}>{a.name}</li>)}
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

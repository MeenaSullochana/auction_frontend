import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api";
import HeroSlider from "../components/HeroSlider";

const people = [
  { name: "Ananya Rao", role: "Plant manager, Coimbatore", quote: "We closed a full CNC line in two days. Bids were transparent and the yard team handled handover without drama.", img: "/media/user-ananya.jpg" },
  { name: "Karthik Menon", role: "Procurement head, Chennai", quote: "Reverse auctions cut our spare-part cost by nearly 18%. Vendors compete on our terms, not theirs.", img: "/media/user-karthik.jpg" },
  { name: "Meera Iyer", role: "Fleet owner, Trichy", quote: "Old tankers and yard vehicles finally moved at fair market value. The catalogue photos matched what we received.", img: "/media/user-meera.jpg" },
];

export function Home() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [msg, setMsg] = useState("");
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const slides = [
    {
      image: "/media/hero-yard.jpg",
      kicker: "Live industrial lots",
      title: "Plant, machinery and idle assets, sold in the open.",
      text: "The Auction House runs timed online bidding for factories, PSUs and private yards across Tamil Nadu.",
      action: <Link className="btn btn-gold" to="/auction">View live lots</Link>,
    },
    {
      image: "/media/hero-fleet.jpg",
      kicker: "Fleet & commercial vehicles",
      title: "Trucks, cars and yard vehicles with documented lots.",
      text: "Every unit is catalogued with condition notes so bidders know what they are raising on.",
      action: <Link className="btn btn-gold" to="/disposal-auction">Disposal auctions</Link>,
    },
    {
      image: "/media/hero-floor.jpg",
      kicker: "The Chennai floor",
      title: "A bidding desk built for principals and vendors.",
      text: "Sellers set a reserve. Buyers compete. Closing prices stay on record for both sides.",
      action: <Link className="btn btn-gold" to="/procurement-auction">Procurement auctions</Link>,
    },
  ];
  return (
    <div>
      <HeroSlider slides={slides} />
      <section className="strip">
        <div className="container strip-row">
          <span>Plant &amp; machinery</span>
          <span>Commercial vehicles</span>
          <span>Process scrap</span>
          <span>Unused stores</span>
          <span>Unclaimed cargo</span>
        </div>
      </section>
      <section className="section">
        <div className="container split">
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
        </div>
      </section>
      <section className="section alt" id="services">
        <div className="container">
          <p className="chip">Services</p>
          <h2>Two auction formats. One bidding desk.</h2>
          <div className="service-grid">
            <article className="service-card">
              <img src="/media/service-disposal.jpg" alt="Disposal" />
              <div>
                <h3>Disposal auction</h3>
                <p>One principal offers plant, vehicles or scrap. Qualified buyers raise until the clock closes. The seller may accept the high bid or reject the lot.</p>
                <Link className="link" to="/disposal-auction">How disposal works</Link>
              </div>
            </article>
            <article className="service-card">
              <img src="/media/service-procurement.jpg" alt="Procurement" />
              <div>
                <h3>Procurement auction</h3>
                <p>The buyer publishes a requirement. Vendors compete downward on price and terms. Ideal for stores, spares and recurring industrial supply.</p>
                <Link className="link" to="/procurement-auction">How procurement works</Link>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <p className="chip">From the floor</p>
          <h2>People who already bid with us</h2>
          <div className="people">
            {people.map((p) => (
              <article className="person" key={p.name}>
                <img src={p.img} alt={p.name} />
                <blockquote>{p.quote}</blockquote>
                <strong>{p.name}</strong>
                <span>{p.role}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section alt">
        <div className="container stats-row">
          <div className="stat card"><b>2,400+</b>Closed lots</div>
          <div className="stat card"><b>180</b>Active bidders</div>
          <div className="stat card"><b>12 yrs</b>Yard operations</div>
          <div className="stat card"><b>Chennai</b>Home base</div>
        </div>
      </section>
      <section className="section" id="contact">
        <div className="container contact-grid">
          <div>
            <p className="chip">Talk to the desk</p>
            <h2>List a lot or request bidder access.</h2>
            <p className="lead">Chennai operations · +91 98412 81212 · auction@gmail.com</p>
          </div>
          <form
            className="card"
            onSubmit={async (e) => {
              e.preventDefault();
              const data = await api("/public/contact", { method: "POST", body: form });
              setMsg(data.message);
              setForm({ name: "", email: "", subject: "", message: "" });
            }}
          >
            {msg && <div className="alert ok">{msg}</div>}
            <div className="form-grid">
              <div className="field"><label>Name</label><input name="name" value={form.name} onChange={onChange} required /></div>
              <div className="field"><label>Email</label><input name="email" type="email" value={form.email} onChange={onChange} required /></div>
              <div className="field full"><label>Subject</label><input name="subject" value={form.subject} onChange={onChange} required /></div>
              <div className="field full"><label>Message</label><textarea name="message" rows="5" value={form.message} onChange={onChange} required /></div>
            </div>
            <button className="btn btn-gold" style={{ marginTop: 16 }}>Send to the desk</button>
          </form>
        </div>
      </section>
    </div>
  );
}

export function About() {
  return (
    <div>
      <div className="page-hero with-photo" style={{ backgroundImage: "url(/media/hero-floor.jpg)" }}>
        <div className="container">
          <p className="chip">About the house</p>
          <h1>Built by people who have run yards, not just websites.</h1>
        </div>
      </div>
      <section className="section">
        <div className="container split">
          <div>
            <h2>Industrial sales, held in the open.</h2>
            <p className="lead">The Auction House is a Chennai bidding desk for plant and machinery, commercial vehicles, process scrap, unused stores and unclaimed air or surface cargo. Principals keep control of reserves. Bidders see the same catalogue, the same clock and the same bid tape.</p>
            <p className="lead">Our floor team knows disposal sales and reverse procurement. Catalogues can be typed lot by lot or imported from Excel. Winning bids stay attached to the user record for collection and delivery.</p>
          </div>
          <img className="round-photo" src="/media/slide-scrap.jpg" alt="Catalogued scrap lots" />
        </div>
      </section>
      <section className="section alt">
        <div className="container grid-3">
          <div className="card"><h3>Clear lots</h3><p>Every item carries a code, quantity, location and optional duty notes before bidding starts.</p></div>
          <div className="card"><h3>Fair clock</h3><p>Live lots show remaining time. Late bids can extend the close so nobody wins on a last-second trick alone.</p></div>
          <div className="card"><h3>Known bidders</h3><p>Accounts are approved before they can raise. Banned or pending users stay off the floor.</p></div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2>Voices from principals and bidders</h2>
          <div className="people">
            {people.map((p) => (
              <article className="person" key={p.name}>
                <img src={p.img} alt={p.name} />
                <blockquote>{p.quote}</blockquote>
                <strong>{p.name}</strong>
                <span>{p.role}</span>
              </article>
            ))}
          </div>
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
          <p className="chip">Service</p>
          <h1>Disposal auction</h1>
        </div>
      </div>
      <section className="section">
        <div className="container split">
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
        </div>
      </section>
    </div>
  );
}

export function Procurement() {
  return (
    <div>
      <div className="page-hero with-photo" style={{ backgroundImage: "url(/media/service-procurement.jpg)" }}>
        <div className="container">
          <p className="chip">Service</p>
          <h1>Procurement auction</h1>
        </div>
      </div>
      <section className="section">
        <div className="container split">
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
        </div>
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
          <p className="chip">Floor</p>
          <h1>Live and upcoming sales</h1>
        </div>
      </div>
      <section className="section">
        <div className="container grid-2">
          <div className="card">
            <h3>Open now</h3>
            <ul className="lot-list">
              {data.live.map((a) => <li key={a.id}>{a.name}</li>)}
            </ul>
            {!data.live.length && <p className="lead">No live sale at this hour. Check upcoming lots or request access.</p>}
          </div>
          <div className="card">
            <h3>On the calendar</h3>
            <ul className="lot-list">
              {data.upcoming.map((a) => <li key={a.id}>{a.name}</li>)}
            </ul>
            {!data.upcoming.length && <p className="lead">No upcoming sale posted yet.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [msg, setMsg] = useState("");
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <div>
      <div className="page-hero with-photo" style={{ backgroundImage: "url(/media/hero-floor.jpg)" }}>
        <div className="container">
          <p className="chip">Desk</p>
          <h1>Contact the Chennai floor</h1>
        </div>
      </div>
      <section className="section">
        <div className="container contact-grid">
          <div>
            <h2>Operations</h2>
            <p className="lead">+91 98412 81212<br />auction@gmail.com<br />Chennai, Tamil Nadu</p>
            <img className="round-photo" src="/media/user-karthik.jpg" alt="Floor desk" />
          </div>
          <form className="card" onSubmit={async (e) => {
            e.preventDefault();
            const data = await api("/public/contact", { method: "POST", body: form });
            setMsg(data.message);
          }}>
            {msg && <div className="alert ok">{msg}</div>}
            <div className="form-grid">
              <div className="field"><label>Name</label><input name="name" required value={form.name} onChange={onChange} /></div>
              <div className="field"><label>Email</label><input name="email" type="email" required value={form.email} onChange={onChange} /></div>
              <div className="field full"><label>Subject</label><input name="subject" required value={form.subject} onChange={onChange} /></div>
              <div className="field full"><label>Message</label><textarea name="message" rows="6" required value={form.message} onChange={onChange} /></div>
            </div>
            <button className="btn btn-gold" style={{ marginTop: 16 }}>Send</button>
          </form>
        </div>
      </section>
    </div>
  );
}

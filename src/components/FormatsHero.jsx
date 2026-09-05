import { useState } from "react";
import { api } from "../api";
import Reveal from "./Reveal";

const FORMATS = [
  {
    id: "reverse",
    title: "Reverse Auction",
    text: "Prices start high and drop until a buyer accepts the current price.",
  },
  {
    id: "open",
    title: "Open Auction",
    text: "Prices start low and go up as multiple buyers compete, ending with the highest bid.",
  },
  {
    id: "sealed",
    title: "Sealed Auction",
    text: "Buyers submit confidential bids without seeing competing offers until the desk opens the close.",
  },
];

const empty = {
  firm_name: "",
  address: "",
  contact_person: "",
  contact_no: "",
  alternate_no: "",
  email: "",
};

export default function FormatsHero({ image = "/media/hero-floor.jpg" }) {
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <section className="formats-hero">
      <img className="formats-hero-img" src={image} alt="" />
      <div className="formats-hero-shade" />
      <div className="container formats-hero-inner">
        <Reveal className="formats-heading formats-hero-title">
          <p className="chip">Auction</p>
          <h1>Open · Reverse · Sealed</h1>
        </Reveal>

        <div className="formats-layout">
          <div className="formats-clouds">
            {FORMATS.map((f, i) => (
              <Reveal
                as="article"
                key={f.id}
                className={`format-cloud format-cloud--${f.id}`}
                delay={i * 100}
              >
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </Reveal>
            ))}
          </div>

          <Reveal
            as="form"
            className="enquiry-panel"
            delay={120}
            onSubmit={async (e) => {
              e.preventDefault();
              setMsg("");
              setErr("");
              try {
                const data = await api("/public/contact", {
                  method: "POST",
                  body: {
                    firm_name: form.firm_name,
                    address: form.address,
                    contact_person: form.contact_person,
                    contact_no: form.contact_no,
                    email: form.email,
                    message: form.alternate_no
                      ? `Alternate no: ${form.alternate_no}`
                      : "Vendor enrolment enquiry",
                  },
                });
                setMsg(data.message);
                setForm(empty);
              } catch (ex) {
                setErr(ex.message || "Could not send enquiry");
              }
            }}
          >
            <h3>Enquiry Form</h3>
            {msg && <div className="alert ok">{msg}</div>}
            {err && <div className="alert err">{err}</div>}
            <div className="enquiry-fields">
              <label>
                <span>Firm Name</span>
                <input name="firm_name" value={form.firm_name} onChange={onChange} required />
              </label>
              <label>
                <span>Address</span>
                <input name="address" value={form.address} onChange={onChange} required />
              </label>
              <label>
                <span>Contact Person</span>
                <input name="contact_person" value={form.contact_person} onChange={onChange} required />
              </label>
              <label>
                <span>Contact No</span>
                <input name="contact_no" value={form.contact_no} onChange={onChange} required />
              </label>
              <label>
                <span>Alternate No</span>
                <input name="alternate_no" value={form.alternate_no} onChange={onChange} />
              </label>
              <label>
                <span>Email</span>
                <input name="email" type="email" value={form.email} onChange={onChange} required />
              </label>
            </div>
            <button type="submit" className="btn btn-gold enquiry-submit">
              Send enquiry
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

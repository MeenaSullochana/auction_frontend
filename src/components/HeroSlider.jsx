import { useEffect, useState } from "react";

export default function HeroSlider({ slides }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 5200);
    return () => clearInterval(t);
  }, [slides.length]);
  const slide = slides[i];
  return (
    <section className="slider">
      {slides.map((s, n) => (
        <img key={s.image} className={`slider-img ${n === i ? "on" : ""}`} src={s.image} alt={s.title} />
      ))}
      <div className="slider-shade" />
      <div className="slider-copy container">
        <p className="chip">{slide.kicker}</p>
        <h1>{slide.title}</h1>
        <p>{slide.text}</p>
        <div className="hero-actions">{slide.action}</div>
      </div>
      <div className="slider-nav">
        <button type="button" className="btn btn-ghost" onClick={() => setI((n) => (n - 1 + slides.length) % slides.length)}>Prev</button>
        <div className="dots">
          {slides.map((_, n) => (
            <button key={n} type="button" className={n === i ? "dot on" : "dot"} onClick={() => setI(n)} aria-label={`Slide ${n + 1}`} />
          ))}
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => setI((n) => (n + 1) % slides.length)}>Next</button>
      </div>
    </section>
  );
}

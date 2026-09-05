import { useEffect, useState } from "react";

export default function HeroSlider({ slides }) {
  const [i, setI] = useState(0);
  const list = slides?.length ? slides : [];

  useEffect(() => {
    if (list.length < 2) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % list.length), 5200);
    return () => clearInterval(t);
  }, [list.length]);

  if (!list.length) return null;
  const slide = list[i % list.length];

  return (
    <section className="slider">
      {list.map((s, n) => (
        <img
          key={`${s.image}-${n}`}
          className={`slider-img ${n === i ? "on" : ""}`}
          src={s.image}
          alt={s.title}
        />
      ))}
      <div className="slider-shade" />
      <div className="slider-copy container" key={slide.title}>
        <p className="chip chip-on-dark">{slide.kicker}</p>
        <h1>{slide.title}</h1>
        <p>{slide.text}</p>
        <div className="hero-actions">{slide.action}</div>
      </div>
      <div className="slider-nav">
        <button
          type="button"
          className="btn slider-nav-btn"
          onClick={() => setI((n) => (n - 1 + list.length) % list.length)}
        >
          Prev
        </button>
        <div className="dots">
          {list.map((_, n) => (
            <button
              key={n}
              type="button"
              className={n === i ? "dot on" : "dot"}
              onClick={() => setI(n)}
              aria-label={`Slide ${n + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          className="btn slider-nav-btn"
          onClick={() => setI((n) => (n + 1) % list.length)}
        >
          Next
        </button>
      </div>
    </section>
  );
}

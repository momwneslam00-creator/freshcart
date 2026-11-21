"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const slides = [
  {
    title: "Fresh finds, delivered fast",
    text: "Fashion, electronics and everyday essentials — all in one cart.",
    cta: { href: "/products", label: "Shop now" },
    bg: "from-emerald-100 via-lime-50 to-white",
  },
  {
    title: "Up to 30% off new arrivals",
    text: "Discover this season's picks from your favorite brands.",
    cta: { href: "/brands", label: "Browse brands" },
    bg: "from-amber-100 via-orange-50 to-white",
  },
  {
    title: "Everything you love, by category",
    text: "From women's fashion to electronics — find it in a tap.",
    cta: { href: "/categories", label: "Explore categories" },
    bg: "from-sky-100 via-cyan-50 to-white",
  },
];

export default function HomeSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Promotions"
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s, i) => (
          <div
            key={s.title}
            aria-hidden={i !== index}
            className={`flex h-[320px] w-full shrink-0 items-center bg-linear-to-r sm:h-[420px] ${s.bg}`}
          >
            <div className="container-page">
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold text-ink sm:text-5xl">{s.title}</h2>
                <p className="mt-4 text-base text-slate-600 sm:text-lg">{s.text}</p>
                <Link
                  href={s.cta.href}
                  tabIndex={i === index ? 0 : -1}
                  className="btn-primary mt-6 px-6 py-3 text-base"
                >
                  {s.cta.label}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button
            key={s.title}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`h-3 w-3 rounded-full transition-colors ${
              i === index ? "bg-brand" : "bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

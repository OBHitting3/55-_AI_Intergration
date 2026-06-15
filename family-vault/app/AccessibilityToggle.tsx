"use client";

import { useEffect, useState } from "react";

const KEY = "fv_large";

// Per-device large-print + higher-contrast toggle for older eyes. Persisted so a
// grandparent only sets it once on their device.
export default function AccessibilityToggle() {
  const [large, setLarge] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem(KEY) === "1";
    setLarge(v);
    document.documentElement.classList.toggle("large", v);
  }, []);

  function toggle() {
    const v = !large;
    setLarge(v);
    localStorage.setItem(KEY, v ? "1" : "0");
    document.documentElement.classList.toggle("large", v);
  }

  return (
    <button
      onClick={toggle}
      aria-pressed={large}
      title={large ? "Normal text size" : "Large text & higher contrast"}
      className="fixed right-2 top-2 z-[60] rounded-full border border-slate-500 bg-panel/90 px-3 py-1.5 text-sm font-semibold text-slate-100 shadow backdrop-blur"
    >
      {large ? "A−" : "A+"}
    </button>
  );
}

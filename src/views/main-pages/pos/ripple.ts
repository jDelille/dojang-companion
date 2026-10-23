import type { MouseEvent } from "react";

/*
   Ink-ripple micro-interaction, ported from ripple() in
   tailwind/src/assets/js/pos.js.

   The template delegated a single document-level listener onto anything with
   .ripple. Here it is called from the handler of the element that spawned it,
   so the span it appends is owned by that element and removes itself after
   the 600ms animation the CSS expects.

   Kept out of rippleButton.tsx so that file only exports a component, which
   is what react-refresh needs to hot-reload it.
*/

const INK_MS = 600;

export const spawnRipple = (e: MouseEvent<HTMLElement>) => {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const size = Math.max(r.width, r.height);
  const ink = document.createElement("span");
  ink.className = "ripple-ink";
  ink.style.width = size + "px";
  ink.style.height = size + "px";
  ink.style.left = e.clientX - r.left - size / 2 + "px";
  ink.style.top = e.clientY - r.top - size / 2 + "px";
  el.appendChild(ink);
  setTimeout(() => ink.remove(), INK_MS);
};

export default spawnRipple;

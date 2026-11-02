// Shared by record buttons and proposal review. No business action occurs here.
export function revealCompanion(pageReview: boolean) {
  requestAnimationFrame(() => {
    const target = (pageReview ? document.getElementById("do-for-me-review") : null)
      ?? document.getElementById("do-for-me-rail");
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({
      block: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
    if (!pageReview) document.getElementById("companion-question")?.focus({ preventScroll: true });
  });
}

"use client";

import { useEffect, useState } from "react";
import { SCHOOL_NAME } from "@/domain/kiosk/kioskConfig";

// Name on the left, clock on the right. Sits at the top of every kiosk screen.
// Rendered only in the browser (kioskClient loads the journey with ssr: false),
// so the clock can start with the real time without a server/browser mismatch.
const KioskHeader = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id); // stop ticking when the page goes away
  }, []);

  return (
    // Negative margins stretch the line across the whole panel, whatever its padding
    <header className="-mx-5 -mt-5 flex items-center justify-between border-b border-(--kiosk-line) px-5 py-5 @min-[540px]:-mx-14 @min-[540px]:-mt-10 @min-[540px]:px-14">
      <span className="font-(family-name:--kiosk-font-label) text-sm tracking-[0.25em] uppercase">
        {SCHOOL_NAME}
      </span>
      <span className="text-base text-(--kiosk-text-secondary) tabular-nums">
        {now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
      </span>
    </header>
  );
};

export default KioskHeader;

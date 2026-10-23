"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const PrelineInit = () => {
  const pathname = usePathname();

  useEffect(() => {
    import("preline").then(({ HSStaticMethods }) => {
      HSStaticMethods.autoInit();
    });
  }, [pathname]);

  return null;
};

export default PrelineInit;

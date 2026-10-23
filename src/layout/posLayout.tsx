"use client";

import { useEffect } from "react";

const POS_BODY_CLASSES = ["bg-light", "min-h-screen"];

const PosLayout = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    document.body.classList.add(...POS_BODY_CLASSES);

    return () => {
      document.body.classList.remove(...POS_BODY_CLASSES);
    };
  }, []);

  return (
    <div id="main" className="pos-shell">
      {children}
    </div>
  );
};

export default PosLayout;

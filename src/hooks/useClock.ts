import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

const stamp = () => {
  const d = new Date();
  return pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
};

export function useClock(): string {
  const [time, setTime] = useState(stamp);

  useEffect(() => {
    const timer = setInterval(() => setTime(stamp()), 1000);
    return () => clearInterval(timer);
  }, []);

  return time;
}

export default useClock;

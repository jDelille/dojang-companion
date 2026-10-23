import { useCallback, useEffect, useRef, useState } from "react";

const VISIBLE_MS = 1900;

export type ToastState = {
  message: string;
  visible: boolean;
  showToast: (message: string) => void;
};

export function useToast(): ToastState {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((next: string) => {
    setMessage(next);
    setVisible(true);

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), VISIBLE_MS);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { message, visible, showToast };
}

export default useToast;

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const OFFSET = 6;
const MARGIN = 8;

type RowMenuProps = {

  trigger: ReactNode;
  triggerClassName?: string;
  triggerTitle?: string;
  children: ReactNode;
};

const RowMenu = ({
  trigger,
  triggerClassName = "icon-btn",
  triggerTitle,
  children,
}: RowMenuProps) => {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const measure = useCallback(() => {
    const button = triggerRef.current;
    const menu = menuRef.current;
    if (!button || !menu) return;

    const rect = button.getBoundingClientRect();
    const height = menu.offsetHeight;
    const width = menu.offsetWidth;

    let top = rect.bottom + OFFSET;
    if (top + height > window.innerHeight - MARGIN) {
      top = Math.max(MARGIN, rect.top - height - OFFSET);
    }
    let left = rect.right - width;
    if (left < MARGIN) left = MARGIN;

    setStyle({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (open) measure();
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close();
    };

    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        title={triggerTitle}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {trigger}
      </button>
      {createPortal(
        <div
          ref={menuRef}
          role="menu"
          className={open ? "dropdown-menu open" : "dropdown-menu"}
          style={{ position: "fixed", top: style.top, left: style.left, right: "auto" }}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a,button")) setOpen(false);
          }}
        >
          {children}
        </div>,
        document.body,
      )}
    </>
  );
};

export default RowMenu;

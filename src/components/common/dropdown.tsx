import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type DropdownContextValue = {
  openId: string | null;
  setOpenId: (id: string | null) => void;
};

const DropdownContext = createContext<DropdownContextValue | null>(null);
export const DropdownProvider = ({ children }: { children: ReactNode }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const value = useMemo(() => ({ openId, setOpenId }), [openId]);
  return (
    <DropdownContext.Provider value={value}>
      {children}
    </DropdownContext.Provider>
  );
};

type ItemContextValue = {
  id: string;
  open: boolean;
  toggle: () => void;
  close: () => void;
  variant: "down" | "up";
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
};

const ItemContext = createContext<ItemContextValue | null>(null);

const useItem = (component: string) => {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error(`<Dropdown.${component}> must be used inside <Dropdown>`);
  }
  return context;
};
const OFFSET = 8;
const MARGIN = 8;
const RAIL_WIDTH = 74;
const MIN_PANEL_HEIGHT = 100;

type PositionStyle = {
  position?: "fixed";
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  width?: string;
  maxHeight?: string;
  overflowY?: "auto";
};
function useDropdownPosition(
  open: boolean,
  variant: "down" | "up",
  triggerRef: React.RefObject<HTMLElement | null>,
  menuRef: React.RefObject<HTMLElement | null>,
) {
  const [style, setStyle] = useState<PositionStyle>({});

  const measure = useCallback(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;

    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const railCollapsed =
      variant === "up" &&
      !!trigger.closest("#sidebar")?.classList.contains("collapsed");

    if (railCollapsed) {
      const height = menuRect.height;
      const next: PositionStyle = {
        position: "fixed",
        left: `${RAIL_WIDTH}px`,
        right: "auto",
        width: "220px",
      };
      if (triggerRect.bottom - height < MARGIN) {
        next.top = `${MARGIN}px`;
        next.bottom = "auto";
        next.maxHeight = `${vh - MARGIN * 2}px`;
        next.overflowY = "auto";
      } else {
        next.bottom = `${Math.max(vh - triggerRect.bottom, MARGIN)}px`;
        next.top = "auto";
      }
      setStyle(next);
      return;
    }

    const next: PositionStyle = {};

    if (menuRect.width > vw - MARGIN * 2) {
      next.width = `${vw - MARGIN * 2}px`;
      next.left = `${MARGIN - triggerRect.left}px`;
      next.right = "auto";
    } else if (menuRect.right > vw - MARGIN) {
      next.right = "0";
      next.left = "auto";
    } else if (menuRect.left < MARGIN) {
      next.left = "0";
      next.right = "auto";
    }
    if (variant === "down") {
      const spaceBelow = vh - triggerRect.bottom - OFFSET - MARGIN;
      const spaceAbove = triggerRect.top - OFFSET - MARGIN;

      if (menuRect.height > spaceBelow) {
        if (spaceAbove > spaceBelow) {
          next.bottom = `calc(100% + ${OFFSET}px)`;
          next.top = "auto";
          if (menuRect.height > spaceAbove) {
            next.maxHeight = `${spaceAbove}px`;
            next.overflowY = "auto";
          }
        } else if (spaceBelow > MIN_PANEL_HEIGHT) {
          next.maxHeight = `${spaceBelow}px`;
          next.overflowY = "auto";
        }
      }
    } else {
      const spaceAbove = triggerRect.top - OFFSET - MARGIN;
      if (menuRect.height > spaceAbove && spaceAbove > MIN_PANEL_HEIGHT) {
        next.maxHeight = `${spaceAbove}px`;
        next.overflowY = "auto";
      }
    }

    setStyle(next);
  }, [triggerRef, menuRef, variant]);

  useLayoutEffect(() => {
    if (open) measure();
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;
    const onChange = () => measure();
    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
    };
  }, [open, measure]);
  return open ? style : {};
}

export type DropdownProps = {
  id?: string;
  variant?: "down" | "up";
  className?: string;
  children: ReactNode;
};

const Dropdown = ({
  id,
  variant = "down",
  className,
  children,
}: DropdownProps) => {
  const generatedId = useId();
  const dropdownId = id ?? generatedId;

  const shared = useContext(DropdownContext);
  const [localOpenId, setLocalOpenId] = useState<string | null>(null);
  const openId = shared ? shared.openId : localOpenId;
  const setOpenId = shared ? shared.setOpenId : setLocalOpenId;

  const open = openId === dropdownId;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpenId(null);
  }, [setOpenId]);

  const toggle = useCallback(() => {
    setOpenId(open ? null : dropdownId);
  }, [open, dropdownId, setOpenId]);
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const value = useMemo<ItemContextValue>(
    () => ({
      id: dropdownId,
      open,
      toggle,
      close,
      variant,
      triggerRef,
      menuRef,
    }),
    [dropdownId, open, toggle, close, variant],
  );

  return (
    <ItemContext.Provider value={value}>
      <div
        ref={rootRef}
        className={className ? `dropdown ${className}` : "dropdown"}
      >
        {children}
      </div>
    </ItemContext.Provider>
  );
};

export type DropdownTriggerProps = {
  className?: string;
  title?: string;
  "aria-label"?: string;
  children: ReactNode;
};

const Trigger = ({ className, children, ...rest }: DropdownTriggerProps) => {
  const { id, open, toggle, triggerRef } = useItem("Trigger");

  return (
    <button
      ref={triggerRef}
      type="button"
      className={className}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={id}
      onClick={toggle}
      {...rest}
    >
      {children}
    </button>
  );
};

export type DropdownMenuProps = {
  className?: string;
  children: ReactNode;
};

const Menu = ({ className, children }: DropdownMenuProps) => {
  const { id, open, variant, menuRef, triggerRef, close } = useItem("Menu");
  const style = useDropdownPosition(open, variant, triggerRef, menuRef);

  const base = variant === "up" ? "dropup-menu" : "dropdown-menu";
  const classes = [base, open && "open", className].filter(Boolean).join(" ");

  return (
    <div
      ref={menuRef}
      id={id}
      role="menu"
      className={classes}
      style={style}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a,button")) close();
      }}
    >
      {children}
    </div>
  );
};

Dropdown.Trigger = Trigger;
Dropdown.Menu = Menu;

export default Dropdown;

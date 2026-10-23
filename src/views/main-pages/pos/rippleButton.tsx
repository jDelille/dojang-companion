import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { spawnRipple } from "./ripple";

/*
   A button that carries the register's ink-ripple. Thin wrapper over
   spawnRipple for call sites that need nothing else from the event.
*/

type RippleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

const RippleButton = ({
  children,
  className = "",
  onClick,
  ...rest
}: RippleButtonProps) => (
  <button
    type="button"
    className={`ripple ${className}`.trim()}
    onClick={(e) => {
      spawnRipple(e);
      onClick?.(e);
    }}
    {...rest}
  >
    {children}
  </button>
);

export default RippleButton;

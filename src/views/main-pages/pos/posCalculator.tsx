import { useRef, useState } from "react";
import { Calculator, Minus, X } from "lucide-react";
import useDraggable from "../../../hooks/useDraggable";

/*
   Floating calculator, ported from the CALCULATOR block in
   tailwind/src/assets/js/pos.js.

   Stays mounted while hidden (.hidden-floater) so a drag position and the
   running expression survive being closed and reopened, exactly as the
   template's single #calc element did.
*/

/* [key, label, extra classes] */
const KEYS: [string, string, string][] = [
  ["C", "C", "calc-op"],
  ["back", "⌫", "calc-op"],
  ["%", "%", "calc-op"],
  ["/", "÷", "calc-op"],
  ["7", "7", ""],
  ["8", "8", ""],
  ["9", "9", ""],
  ["*", "×", "calc-op"],
  ["4", "4", ""],
  ["5", "5", ""],
  ["6", "6", ""],
  ["-", "−", "calc-op"],
  ["1", "1", ""],
  ["2", "2", ""],
  ["3", "3", ""],
  ["+", "+", "calc-op"],
  ["0", "0", "col-span-2"],
  [".", ".", ""],
  ["=", "=", "calc-eq"],
];

type PosCalculatorProps = {
  open: boolean;
  minimized: boolean;
  onToggleMin: () => void;
  onClose: () => void;
};

const PosCalculator = ({
  open,
  minimized,
  onToggleMin,
  onClose,
}: PosCalculatorProps) => {
  const [expr, setExpr] = useState("");
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState("");

  const boxRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  useDraggable(boxRef, headRef);

  const press = (k: string) => {
    if (k === "C") {
      setExpr("");
      setDisplay("0");
      setHistory("");
      return;
    }
    if (k === "back") {
      const next = expr.slice(0, -1);
      setExpr(next);
      setDisplay(next || "0");
      return;
    }
    if (k === "=") {
      try {
        /*
           The keypad can only produce digits and operators, and the source is
           stripped to that set again here before evaluation.
        */
        const safe = expr.replace(/[^0-9+\-*/.%() ]/g, "").replace(/%/g, "/100");
        const r = Function("return (" + (safe || "0") + ")")() as number;
        const res = String(Math.round(r * 1e6) / 1e6);
        setHistory(expr + " =");
        setExpr(res);
        setDisplay(res);
      } catch {
        setDisplay("Error");
        setExpr("");
      }
      return;
    }
    // Typing a second operator replaces the first rather than stacking.
    const next =
      "+-*/".includes(k) && (expr === "" || "+-*/".includes(expr.slice(-1)))
        ? expr.slice(0, -1) + k
        : expr + k;
    setExpr(next);
    setDisplay(next);
  };

  return (
    <div
      ref={boxRef}
      id="calc"
      className={`floater float-anchor${open ? "" : " hidden-floater"}${minimized ? " min" : ""}`}
    >
      <div
        ref={headRef}
        className="flex items-center justify-between px-3 py-2.5 cursor-grab select-none float-head"
      >
        <div className="flex items-center gap-2">
          <Calculator className="ic-14 t-gold" aria-hidden="true" />
          <span className="text-xs font-bold c-text">Calculator</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="float-btn"
            onClick={onToggleMin}
            title="Minimize"
            aria-label="Minimize calculator"
          >
            <Minus className="ic-13" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="float-btn"
            onClick={onClose}
            title="Close"
            aria-label="Close calculator"
          >
            <X className="ic-13" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="calc-body p-3">
        <div className="text-right text-[11px] h-4 mb-1 truncate t-muted">
          {history || " "}
        </div>
        <div className="text-right text-2xl font-black c-text mb-3 truncate">
          {display}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {KEYS.map(([key, label, cls]) => (
            <button
              key={key}
              type="button"
              className={`calc-key text-center ${cls}`.trim()}
              onClick={() => press(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PosCalculator;

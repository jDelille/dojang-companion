import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy, Eye } from "lucide-react";
import { RADIUS } from "../common/tokens";

const COPIED_MS = 1500;

type PreviewCodeToggleProps = {
  title: ReactNode;
  code?: string;
  cardClassName?: string;
  cardShellClassName?: string;
  contentClassName?: string;
  codeMaxHeightClassName?: string;
  children: ReactNode;
};

const PreviewCodeToggle = ({
  title,
  code,
  cardClassName,
  cardShellClassName = "preview-card glass-card p-5",
  contentClassName,
  codeMaxHeightClassName = "max-h-[450px]",
  children,
}: PreviewCodeToggleProps) => {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const handleCopy = useCallback(async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      // Clipboard unavailable (insecure context or denied permission).
    }
  }, [code]);

  return (
    <div
      className={`${cardShellClassName}${cardClassName ? ` ${cardClassName}` : ""}`}
    >
      <div className="pb-5 mb-5 flex items-center xxl:gap-0 gap-3 justify-between flex-wrap border-b border-[var(--border)]">
        <h2 className="text-lg font-bold c-text mb-0">{title}</h2>
        {code && (
          <button
            type="button"
            onClick={() => setShowCode((prev) => !prev)}
            aria-pressed={showCode}
            className="flex items-center gap-2 py-1.5 px-2.5 text-xs font-semibold rounded-md bd bg-[var(--card2)] focus:bg-[var(--gold)] focus:text-[var(--on-accent)] c-text cursor-pointer"
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
            <span className="code-btn">
              {showCode ? "Show Preview" : "Show Code"}
            </span>
          </button>
        )}
      </div>

      <div
        className={`preview-content${contentClassName ? ` ${contentClassName}` : ""}${showCode ? " hidden" : ""}`}
      >
        {children}
      </div>

      {code && (
        <pre
          className={`code relative mt-4 p-0! ${RADIUS} bg-[#18181b] text-gray-100 text-sm overflow-hidden${showCode ? "" : " hidden"}`}
        >
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Code copied" : "Copy code"}
            className="sticky float-end top-3 right-3 z-10 bg-white/10 text-white text-xs px-2.5 py-1.5 rounded-md hover:bg-white/20 flex items-center gap-1 cursor-pointer"
          >
            {copied ? (
              <Check className="w-3 h-3" aria-hidden="true" />
            ) : (
              <Copy className="w-3 h-3" aria-hidden="true" />
            )}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
          <code
            className={`language-html block w-full ${codeMaxHeightClassName} mb-[-21px] mt-[-10px]! overflow-auto p-4 pr-16`}
          >
            {code}
          </code>
        </pre>
      )}
    </div>
  );
};

export default PreviewCodeToggle;

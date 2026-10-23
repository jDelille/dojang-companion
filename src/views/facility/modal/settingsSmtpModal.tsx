import { useState } from "react";
import { AlertCircle, Send, X } from "lucide-react";
import type { SmtpSettings } from "../../../types/settings";

/*
   Send Test Email — ported from #modal-smtp in tailwind/src/settings.html and
   openSmtp()/runSmtpTest() in assets/js/settings.js. The staged connection log
   is driven by a setTimeout chain in the run handler (no setState-in-effect).
*/

type LogLine = { t: string; cls?: string };

type SettingsSmtpModalProps = {
  open: boolean;
  smtp: SmtpSettings;
  defaultTo: string;
  outcome: () => { ok: boolean; problems: string[] };
  onClose: () => void;
  onResult: (ok: boolean, to: string) => void;
};

const SettingsSmtpModal = ({
  open,
  smtp,
  defaultTo,
  outcome,
  onClose,
  onResult,
}: SettingsSmtpModalProps) => {
  const [to, setTo] = useState(defaultTo);
  const [toErr, setToErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [lines, setLines] = useState<LogLine[] | null>(null);

  const run = () => {
    if (busy) return;
    const dest = to.trim();
    if (!dest || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(dest)) {
      setToErr("Enter a valid destination address");
      return;
    }
    setToErr("");
    const { ok, problems } = outcome();
    setBusy(true);
    const acc: LogLine[] = [];
    const push = (line: LogLine) => {
      acc.push(line);
      setLines([...acc]);
    };
    const steps: (() => void)[] = [
      () => push({ t: "→ Connecting to " + smtp.host + ":" + smtp.port + " …" }),
      () => push({ t: "→ Starting " + smtp.encryption + " handshake …" }),
      () => push({ t: "→ Authenticating as " + smtp.user + " …" }),
      () => push({ t: "→ Sending test message to " + dest + " …" }),
      () => {
        if (!ok) {
          problems.forEach((p) => push({ t: "✖ " + p, cls: "log-err" }));
          push({ t: "✖ Test failed — fix the settings above and retry.", cls: "log-err" });
        } else {
          push({ t: "✔ 250 OK — message queued", cls: "log-ok" });
          push({ t: "✔ Test email sent to " + dest, cls: "log-ok" });
        }
        setBusy(false);
        onResult(ok, dest);
      },
    ];
    setLines([]);
    steps.forEach((fn, i) => setTimeout(fn, 420 * (i + 1)));
  };

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-520">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Send Test Email</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {smtp.host + ":" + smtp.port + " · " + smtp.encryption + " · from " + smtp.from}
        </div>
        <div className="mb-4">
          <label className="f-label" htmlFor="sm-to">
            Send to
          </label>
          <input
            id="sm-to"
            type="email"
            className="fp-input py-2.5 text-sm"
            placeholder="you@example.com"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <div className={`f-error${toErr ? " show" : ""}`}>
            <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
            <span>{toErr}</span>
          </div>
        </div>
        <div className="mb-4">
          <span className="f-label">Connection log</span>
          <div className="log-box">
            {lines === null ? (
              "Ready. Press “Run Test” to check the SMTP connection."
            ) : (
              lines.map((l, i) => (
                <span key={i}>
                  {l.cls ? <span className={l.cls}>{l.t}</span> : l.t}
                  {i < lines.length - 1 ? "\n" : ""}
                </span>
              ))
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            disabled={busy}
            onClick={run}
          >
            {busy ? (
              <>
                <span className="spin" />
                Testing…
              </>
            ) : (
              <>
                <Send className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
                Run Test
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsSmtpModal;

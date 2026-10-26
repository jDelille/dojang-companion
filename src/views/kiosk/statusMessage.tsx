// Neutral message for empty and unavailable states, shared by every kiosk
// screen so they all say things the same way. Never shows a reason.
// Ported from Companion's components/kiosk/status-message.

export type StatusAction = {
  label: string;
  onClick: () => void;
};

type StatusMessageProps = {
  message: string; // what happened: "No classes today."
  detail?: string; // where to go: "Please see the front desk."
  actions?: StatusAction[]; // e.g. Try again, Back
};

const StatusMessage = ({ message, detail, actions = [] }: StatusMessageProps) => {
  return (
    // role="status" so screen readers announce it when it appears
    <div
      role="status"
      className="mt-6 flex flex-col gap-[18px] rounded-2xl border border-(--kiosk-line) bg-(--kiosk-canvas) p-6"
    >
      <div className="flex flex-col gap-1.5">
        <p className="text-2xl leading-[1.35] font-semibold text-(--kiosk-text)">{message}</p>
        {detail && <p className="text-base text-(--kiosk-text-secondary)">{detail}</p>}
      </div>

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2.5">
          {actions.map((action) => (
            // Always look like buttons: a touch screen has no hover
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="inline-flex min-h-16 flex-auto cursor-pointer items-center justify-center rounded-2xl border border-(--kiosk-line) bg-(--kiosk-raised) px-6 text-xl font-semibold text-(--kiosk-text) transition-colors hover:border-(--kiosk-text-secondary) hover:bg-(--kiosk-interactive) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--kiosk-text-secondary) active:border-(--kiosk-text-secondary) active:bg-(--kiosk-interactive)"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusMessage;

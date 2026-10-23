

export const SURFACE = "bg-[var(--surface)]";
export const CARD = "glass-card";
export const BORDER = "border-[var(--border)]";
export const DIVIDER = "border-[var(--border)]";

export const TEXT = "text-[var(--text)]";
export const TEXT_MUTED = "text-[var(--dim)]";
export const TEXT_FAINT = "text-[var(--dim2)]";

export const RADIUS = "rounded-[calc(10px*var(--rs))]";
export const RADIUS_SM = "rounded-[calc(6px*var(--rs))]";

export const SKELETON = "bg-[var(--border)] rounded-[calc(6px*var(--rs))] animate-pulse";

/* ── Buttons ────────────────────────────────────────────────────────── */

export const BTN_BASE =
  "inline-flex items-center gap-2 px-3 h-8 text-[calc(12px*var(--fs))] font-semibold cursor-pointer transition-colors rounded-[calc(8px*var(--rs))] disabled:opacity-60 disabled:cursor-not-allowed";

export const BTN_GHOST = `${BTN_BASE} bg-transparent border ${BORDER} ${TEXT} hover:bg-[rgba(var(--gold-rgb),0.08)]`;

export const BTN_PRIMARY = `${BTN_BASE} border border-[rgba(var(--gold-rgb),0.9)] bg-[rgba(var(--gold-rgb),0.9)] text-[#111] hover:bg-[rgba(var(--gold-rgb),1)]`;

export const ICON_BTN =
  "flex items-center justify-center size-7 cursor-pointer transition-colors rounded-[calc(8px*var(--rs))] border border-[var(--border)] text-[var(--dim2)] hover:bg-[rgba(var(--gold-rgb),0.08)] hover:text-[var(--text)] disabled:opacity-60 disabled:cursor-not-allowed";

/* ── Menus (Preline-driven dropdowns) ───────────────────────────────── */

export const MENU_LABEL =
  "text-[calc(11px*var(--fs))] font-semibold text-[var(--dim)] px-1 mb-1";

export const MENU_ITEM =
  "w-full text-left flex items-center gap-2 px-2 py-1.5 text-[calc(12px*var(--fs))] rounded-[calc(6px*var(--rs))] text-[var(--text)] cursor-pointer transition-colors hover:bg-[rgba(var(--gold-rgb),0.08)]";

export const MENU_ITEM_ACTIVE = "text-[var(--gold)] font-semibold";

/** Floating panel for Preline `hs-dropdown-menu` popovers. */
export const MENU_PANEL = `${SURFACE} border ${BORDER} shadow-lg ${RADIUS}`;

/** Native checkbox tinted to the accent. */
export const CHECK_INPUT =
  "size-4 rounded-[calc(4px*var(--rs))] border-[var(--border)] bg-[var(--surface)] accent-[rgba(var(--gold-rgb),0.9)] focus:ring-0";

/** Small count pill, e.g. the active-filter badge. */
export const BADGE_COUNT =
  "text-[calc(10px*var(--fs))] leading-none rounded-full size-4 flex items-center justify-center bg-[rgba(var(--gold-rgb),0.9)] text-[#111] font-bold";

/** Matches the template's `.fp-input` height and padding for text-like fields. */
export const FIELD =
  "fp-input flex items-center w-full cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

/** Floating surface for dropdown panels / calendars / popups. */
export const PANEL =
  "z-[9999] mt-1 overflow-hidden bg-[var(--surface)] border border-[var(--border)] rounded-[calc(10px*var(--rs))] shadow-lg";

export const PANEL_LIST = "max-h-60 overflow-auto p-1 list-none m-0";

export const PANEL_ITEM =
  "px-3 py-2 text-[calc(13px*var(--fs))] text-[var(--text)] rounded-[calc(6px*var(--rs))] cursor-pointer transition-colors hover:bg-[rgba(var(--gold-rgb),0.08)] data-[p-highlight=true]:bg-[rgba(var(--gold-rgb),0.15)] data-[p-highlight=true]:text-[var(--text)]";

export const PANEL_EMPTY =
  "px-3 py-2 text-[calc(13px*var(--fs))] text-[var(--dim2)]";

export const PANEL_HEADER =
  "p-2 border-b border-[var(--border)] bg-[var(--surface)]";

/** Small pill used for multi-select tokens and tag-input chips. */
export const CHIP =
  "inline-flex items-center gap-1 px-2 py-0.5 text-[calc(11px*var(--fs))] font-semibold rounded-[calc(6px*var(--rs))] bg-[rgba(var(--gold-rgb),0.12)] text-[var(--text)] border border-[rgba(var(--gold-rgb),0.25)]";

export const CHIP_REMOVE_ICON = "w-3 h-3 cursor-pointer opacity-70 hover:opacity-100";

export const TRIGGER_ICON = "w-4 h-4 shrink-0 text-[var(--dim2)]";

export const PLACEHOLDER = "text-[var(--dim2)] truncate";

export const CHECKBOX_BOX =
  "flex items-center justify-center w-4 h-4 shrink-0 rounded-[calc(4px*var(--rs))] border border-[var(--border)] bg-[var(--surface)] data-[p-highlight=true]:bg-[rgba(var(--gold-rgb),0.9)] data-[p-highlight=true]:border-[rgba(var(--gold-rgb),0.9)]";

/* ── Slider ─────────────────────────────────────────────────────────── */

/*
   Mirrors the noUiSlider theme in style.css (.noUi-target / .noUi-connect /
   .noUi-handle) so PrimeReact-based sliders sit alongside the noUiSlider demos
   on the ui-rangeslider page without looking like a different control.
*/
export const SLIDER_ROOT =
  "relative w-full h-1.5 rounded-[calc(4px*var(--rs))] bg-[var(--surface)] border border-[var(--border)]";

export const SLIDER_RANGE =
  "absolute h-full rounded-[calc(4px*var(--rs))] bg-[var(--gold)]";

export const SLIDER_HANDLE =
  "absolute w-4 h-4 -mt-[6px] -ml-2 rounded-[calc(4px*var(--rs))] bg-[var(--card)] border border-[var(--border)] shadow-[0_2px_6px_rgba(0,0,0,0.4)] cursor-pointer hover:border-[rgba(var(--gold-rgb),0.6)] focus:outline-none focus:border-[rgba(var(--gold-rgb),0.6)] transition-colors";

/* ── DataTable ──────────────────────────────────────────────────────── */

export const TABLE_WRAPPER = "overflow-x-auto";

export const TABLE_ROOT = "w-full";

export const TABLE_TABLE = "w-full border-collapse text-[calc(13px*var(--fs))]";

/*
   Header text uses --text2, matching `text-dark` in the template's tables
   (tailwind/src/data-tables.html). --dim reads as washed-out against the
   header fill — 3.8:1 versus 12.6:1.
*/
export const TABLE_HEADER_CELL =
  "text-left font-semibold text-[var(--text2)] whitespace-nowrap px-3 py-2.5 border-b border-[var(--border)] bg-[rgba(var(--gold-rgb),0.04)]";

export const TABLE_BODY_CELL =
  "px-3 py-2.5 text-[var(--text)] border-b border-[var(--border)] align-middle";

export const TABLE_BODY_ROW =
  "transition-colors hover:bg-[rgba(var(--gold-rgb),0.04)] data-[p-highlight=true]:bg-[rgba(var(--gold-rgb),0.1)]";

/* ── Calendar (date / time / range pickers) ─────────────────────────── */

export const calendarPt = {
  root: { className: "w-full" },
  input: { root: { className: FIELD } },
  dropdownButton: {
    root: {
      className:
        "absolute inset-y-0 right-0 flex items-center px-3 cursor-pointer bg-transparent border-0",
    },
  },
  panel: { className: `${PANEL} p-3` },
  header: { className: "flex items-center justify-between mb-2" },
  title: { className: "text-[calc(13px*var(--fs))] font-semibold text-[var(--text)]" },
  previousButton: {
    className:
      "w-7 h-7 flex items-center justify-center rounded-[calc(6px*var(--rs))] text-[var(--dim2)] hover:bg-[rgba(var(--gold-rgb),0.08)] cursor-pointer bg-transparent border-0",
  },
  nextButton: {
    className:
      "w-7 h-7 flex items-center justify-center rounded-[calc(6px*var(--rs))] text-[var(--dim2)] hover:bg-[rgba(var(--gold-rgb),0.08)] cursor-pointer bg-transparent border-0",
  },
  table: { className: "w-full border-collapse" },
  weekDay: {
    className:
      "text-[calc(11px*var(--fs))] font-semibold text-[var(--dim2)] p-1 text-center",
  },
  day: { className: "p-0.5" },
  dayLabel: {
    className:
      "w-8 h-8 flex items-center justify-center text-[calc(12px*var(--fs))] rounded-[calc(6px*var(--rs))] text-[var(--text)] cursor-pointer hover:bg-[rgba(var(--gold-rgb),0.08)] data-[p-highlight=true]:bg-[rgba(var(--gold-rgb),0.9)] data-[p-highlight=true]:text-[var(--on-accent)] data-[p-disabled=true]:opacity-40",
  },
  timePicker: {
    className: "flex items-center justify-center gap-2 mt-2 pt-2 border-t border-[var(--border)]",
  },
  hourPicker: { className: "flex flex-col items-center" },
  minutePicker: { className: "flex flex-col items-center" },
  separator: { className: "text-[var(--text)]" },
  incrementButton: {
    className:
      "w-6 h-6 flex items-center justify-center text-[var(--dim2)] hover:text-[var(--text)] cursor-pointer bg-transparent border-0",
  },
  decrementButton: {
    className:
      "w-6 h-6 flex items-center justify-center text-[var(--dim2)] hover:text-[var(--text)] cursor-pointer bg-transparent border-0",
  },
};

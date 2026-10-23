import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

const BODY_TEXT =
  "It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions.";

const TOGGLE_TAIL =
  "inline-flex items-center gap-x-3 w-full font-semibold text-start c-dim disabled:pointer-events-none";

/* Preline drives open/close from these classes; see lazyRoute.tsx autoInit. */
const CONTENT_OPEN = "hs-accordion-content w-full overflow-hidden duration-300";
const CONTENT_CLOSED =
  "hs-accordion-content hidden w-full overflow-hidden transition-[height] duration-300";

type AccordionCardConfig = {
  title: string;
  /** Classes on the `.preview-content` wrapper. */
  groupClassName: string;
  /** Extra classes on each `.hs-accordion` item, e.g. a per-item border. */
  itemClassName?: string;
  /**
   * Toggle classes. Cards whose items are individually bordered use one string;
   * the rest border the first item differently from the following two.
   */
  toggleClassName: string | { first: string; rest: string };
  /** Omit to render the toggle with no expand/collapse icon at all. */
  icon?: "chevron" | "plus" | "none";
  /** First item's id; the card's three items are numbered from here. */
  startId: number;
};

const GROUP_BORDERED =
  "preview-content hs-accordion-group border border-[var(--border)] rounded-lg overflow-hidden";
const GROUP_FLUSH = "preview-content hs-accordion-group overflow-hidden";

/* Solid/light cards share this pair, differing only in the active colours. */
const stackedToggle = (active: string) => ({
  first: `hs-accordion-toggle py-4 px-5 ${active} hs-accordion-active:border-0 border-y-0 border-x-0 border-[var(--border)] ${TOGGLE_TAIL}`,
  rest: `hs-accordion-toggle py-4 px-5 ${active} hs-accordion-active:border-0 border-t border-b-0 border-x-0 border-[var(--border)] ${TOGGLE_TAIL}`,
});

/* Individually-bordered cards use one toggle class for all three items. */
const boxedToggle = (active: string, border: string) =>
  `hs-accordion-toggle py-4 px-5 ${active} hs-accordion-active:rounded-t-lg hs-accordion-active:border-b border-0 ${border} ${TOGGLE_TAIL}`;

const ACCORDION_CARDS: AccordionCardConfig[] = [
  {
    title: "Default Accordion",
    groupClassName: GROUP_BORDERED,
    toggleClassName: stackedToggle("hs-accordion-active:bg-[var(--card2)]"),
    startId: 1,
  },
  {
    title: "Flush Accordions",
    groupClassName: GROUP_FLUSH,
    toggleClassName: `hs-accordion-toggle py-4 px-5 hs-accordion-active:bg-[var(--card2)] hs-accordion-active:border-0 border-b border-[var(--border)] ${TOGGLE_TAIL}`,
    startId: 4,
  },
  {
    title: "Bordered Accordions",
    groupClassName: GROUP_FLUSH,
    itemClassName: " border border-[var(--border)] rounded-lg mb-2",
    toggleClassName: boxedToggle(
      "hs-accordion-active:bg-[var(--card2)]",
      "border-[var(--border)]",
    ),
    startId: 7,
  },
  {
    title: "Custom Icon Accordion",
    groupClassName: GROUP_FLUSH,
    itemClassName: " border border-[var(--border)] rounded-lg mb-2",
    toggleClassName: boxedToggle(
      "hs-accordion-active:bg-[var(--card2)]",
      "border-[var(--border)]",
    ),
    icon: "plus",
    startId: 10,
  },
  {
    // No hs-accordion-group wrapper, so Preline lets the items open together.
    title: "Always Open Accordions",
    groupClassName: "preview-content border border-[var(--border)] rounded-lg overflow-hidden",
    toggleClassName: stackedToggle("hs-accordion-active:bg-[var(--card2)]"),
    startId: 13,
  },
  {
    title: "Accordion Without Arrow",
    groupClassName: GROUP_BORDERED,
    toggleClassName: stackedToggle("hs-accordion-active:bg-[var(--card2)]"),
    icon: "none",
    startId: 16,
  },
  {
    title: "Primary - Light Color",
    groupClassName: GROUP_BORDERED,
    toggleClassName: stackedToggle(
      "hs-accordion-active:bg-primary-100 hs-accordion-active:c-gold",
    ),
    startId: 55,
  },
  {
    title: "Dark - Light Color",
    groupClassName: GROUP_BORDERED,
    toggleClassName: stackedToggle(
      "hs-accordion-active:bg-gray-100 hs-accordion-active:text-dark",
    ),
    startId: 58,
  },
  {
    title: "Primary - Solid Color",
    groupClassName: GROUP_BORDERED,
    toggleClassName: stackedToggle(
      "hs-accordion-active:bg-primary hs-accordion-active:text-white hs-accordion-active:-white ",
    ),
    startId: 19,
  },
  {
    title: "Success - Solid Color",
    groupClassName: GROUP_BORDERED,
    toggleClassName: stackedToggle(
      "hs-accordion-active:bg-success hs-accordion-active:text-white hs-accordion-active:-white ",
    ),
    startId: 22,
  },
  {
    title: "Warning - Solid Color",
    groupClassName: GROUP_BORDERED,
    toggleClassName: stackedToggle(
      "hs-accordion-active:bg-warning hs-accordion-active:text-white hs-accordion-active:-white ",
    ),
    startId: 25,
  },
  {
    title: "Error - Solid Color",
    groupClassName: GROUP_BORDERED,
    toggleClassName: stackedToggle(
      "hs-accordion-active:bg-danger hs-accordion-active:text-white hs-accordion-active:-white ",
    ),
    startId: 28,
  },
  {
    title: "Dark - Solid Color",
    groupClassName: GROUP_BORDERED,
    toggleClassName: stackedToggle(
      "hs-accordion-active:bg-dark hs-accordion-active:text-white ",
    ),
    startId: 31,
  },
  {
    title: "Info - Solid Color",
    groupClassName: GROUP_BORDERED,
    toggleClassName: stackedToggle(
      "hs-accordion-active:bg-info hs-accordion-active:text-white hs-accordion-active:-white ",
    ),
    startId: 34,
  },
  {
    title: "Primary - Colored Border",
    groupClassName: GROUP_FLUSH,
    itemClassName: " border border-primary rounded-lg mb-2",
    toggleClassName: boxedToggle(
      "hs-accordion-active:bg-[var(--card)] hs-accordion-active:c-gold",
      "border-primary",
    ),
    startId: 37,
  },
  {
    title: "Success - Colored Border",
    groupClassName: GROUP_FLUSH,
    itemClassName: " border border-success rounded-lg mb-2",
    toggleClassName: boxedToggle(
      "hs-accordion-active:bg-[var(--card)] hs-accordion-active:c-green",
      "border-success",
    ),
    startId: 40,
  },
  {
    title: "Warning - Colored Border",
    groupClassName: GROUP_FLUSH,
    itemClassName: " border border-warning rounded-lg mb-2",
    toggleClassName: boxedToggle(
      "hs-accordion-active:bg-[var(--card)] hs-accordion-active:c-orange",
      "border-warning",
    ),
    startId: 43,
  },
  {
    title: "Error - Colored Border",
    groupClassName: GROUP_FLUSH,
    itemClassName: " border border-danger rounded-lg mb-2",
    toggleClassName: boxedToggle(
      "hs-accordion-active:bg-[var(--card)] hs-accordion-active:c-red",
      "border-danger",
    ),
    startId: 46,
  },
  {
    title: "Dark - Colored Border",
    groupClassName: GROUP_FLUSH,
    itemClassName: " border border-dark rounded-lg mb-2",
    toggleClassName: boxedToggle(
      "hs-accordion-active:bg-[var(--card)] hs-accordion-active:text-dark dark:hs-accordion-active:text-white",
      "border-dark",
    ),
    startId: 49,
  },
  {
    title: "Info - Colored Border",
    groupClassName: GROUP_FLUSH,
    itemClassName: " border border-info rounded-lg mb-2",
    toggleClassName: boxedToggle(
      "hs-accordion-active:bg-[var(--card)] hs-accordion-active:c-cyan",
      "border-info",
    ),
    startId: 52,
  },
];

/*
   Built from the same config the card renders with, so the listing cannot
   drift from the preview above it.
*/
const accordionCode = (config: AccordionCardConfig) => {
  const { groupClassName, itemClassName, toggleClassName, icon = "chevron", startId } = config;
  const lines: string[] = [`<div class="${groupClassName.replace("preview-content ", "")}">`];

  [0, 1, 2].forEach((offset) => {
    const id = `acc-${startId + offset}`;
    const isFirst = offset === 0;
    const toggle =
      typeof toggleClassName === "string"
        ? toggleClassName
        : isFirst
          ? toggleClassName.first
          : toggleClassName.rest;

    lines.push(
      `  <div class="${isFirst ? "hs-accordion active" : " hs-accordion"}${itemClassName ?? ""}">`,
    );
    lines.push(
      `    <button class="${toggle}" aria-expanded="${isFirst}" aria-controls="${id}">`,
    );
    lines.push(`      Accordion #${offset + 1}`);
    if (icon !== "none") {
      const collapsed = icon === "plus" ? "plus" : "chevron-down";
      const expanded = icon === "plus" ? "minus" : "chevron-up";
      lines.push(
        `      <span class="hs-accordion-active:hidden block size-4 ms-auto"><i data-lucide="${collapsed}" class="w-4 h-4"></i></span>`,
      );
      lines.push(
        `      <span class="hs-accordion-active:block hidden size-4 ms-auto"><i data-lucide="${expanded}" class="w-4 h-4"></i></span>`,
      );
    }
    lines.push("    </button>");
    lines.push(
      `    <div id="${id}" class="${isFirst ? CONTENT_OPEN : CONTENT_CLOSED}" role="region">`,
    );
    lines.push('      <div class="px-5 py-4">');
    lines.push(`        <p class="c-dim">${BODY_TEXT}</p>`);
    lines.push("      </div>");
    lines.push("    </div>");
    lines.push("  </div>");
  });

  lines.push("</div>");
  return lines.join("\n");
};

const ToggleIcons = ({ icon }: { icon: "chevron" | "plus" }) => (
  <>
    <span className="hs-accordion-active:hidden block size-4 ms-auto">
      {icon === "plus" ? (
        <Plus className="w-4 h-4" aria-hidden="true" />
      ) : (
        <ChevronDown className="w-4 h-4" aria-hidden="true" />
      )}
    </span>
    <span className="hs-accordion-active:block hidden size-4 ms-auto">
      {icon === "plus" ? (
        <Minus className="w-4 h-4" aria-hidden="true" />
      ) : (
        <ChevronUp className="w-4 h-4" aria-hidden="true" />
      )}
    </span>
  </>
);

const AccordionCard = ({ config }: { config: AccordionCardConfig }) => {
  const { groupClassName, itemClassName, toggleClassName, icon = "chevron", startId } = config;

  return (
    <PreviewCodeToggle
      title={config.title}
      contentClassName={groupClassName}
      code={accordionCode(config)}
    >
      {[0, 1, 2].map((offset) => {
        const id = `acc-${startId + offset}`;
        const isFirst = offset === 0;
        const toggle =
          typeof toggleClassName === "string"
            ? toggleClassName
            : isFirst
              ? toggleClassName.first
              : toggleClassName.rest;

        return (
          <div
            key={id}
            className={`${isFirst ? "hs-accordion active" : " hs-accordion"}${itemClassName ?? ""}`}
          >
            <button className={toggle} aria-expanded={isFirst} aria-controls={id}>
              {`Accordion #${offset + 1}`}
              {icon !== "none" && <ToggleIcons icon={icon} />}
            </button>
            <div id={id} className={isFirst ? CONTENT_OPEN : CONTENT_CLOSED} role="region">
              <div className="px-5 py-4">
                <p className="c-dim">{BODY_TEXT}</p>
              </div>
            </div>
          </div>
        );
      })}
    </PreviewCodeToggle>
  );
};

const UiAccordion = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Accordion</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ACCORDION_CARDS.map((config) => (
          <AccordionCard key={config.title} config={config} />
        ))}
      </div>
      {/* End grid */}
    </div>
  );
};

export default UiAccordion;

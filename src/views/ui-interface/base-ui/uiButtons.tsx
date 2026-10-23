import { ChevronLeft, ChevronRight } from "lucide-react";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

const CARD = "preview-card bg-[var(--card)] rounded-xl border border-[var(--border)] p-5";
const ROW = "preview-content flex flex-wrap items-end gap-9";

type ButtonVariant = {
  label: string;
  className: string;
};

/* The 7 colour variants below are shared by every button card on the page. */
const SOLID: ButtonVariant[] = [
  {
    label: "Primary",
    className:
      "bg-primary border border-primary text-white text-center hover:bg-primary-hover hover:border-primary-hover hover:text-white",
  },
  {
    label: "Dark",
    className:
      "bg-dark border border-dark text-white text-center hover:bg-black hover:border-black hover:text-white dark:hover:text-dark!",
  },
  {
    label: "Light",
    className:
      "bg-[var(--card2)] border border-[var(--border)] text-dark text-center hover:bg-[var(--card2)] hover:border-light-800 hover:text-dark",
  },
  {
    label: "Info",
    className:
      "bg-info border border-info text-white text-center hover:bg-info-800 hover:border-info-800 hover:text-white",
  },
  {
    label: "Warning",
    className:
      "bg-warning border border-warning text-white text-center hover:bg-warning-800 hover:border-warning-800 hover:text-white",
  },
  {
    label: "Success",
    className:
      "bg-success border border-success text-white text-center hover:bg-success-800 hover:border-success-800 hover:text-white",
  },
  {
    label: "Error",
    className:
      "bg-danger border border-danger text-white text-center hover:bg-danger-800 hover:border-danger-800 hover:text-white",
  },
];

const OUTLINE: ButtonVariant[] = [
  {
    label: "Primary",
    className: "bg-transparent border border-primary c-gold text-center hover:bg-primary-100",
  },
  {
    label: "Dark",
    className: "bg-transparent border border-dark text-dark text-center hover:bg-gray-100",
  },
  {
    label: "Light",
    className:
      "bg-transparent border border-[var(--border)] text-gray-700 text-center hover:bg-[var(--card2)]",
  },
  {
    label: "Info",
    className: "bg-transparent border border-info c-cyan text-center hover:bg-info-100",
  },
  {
    label: "Warning",
    className: "bg-transparent border border-warning c-orange text-center hover:bg-warning-100",
  },
  {
    label: "Success",
    className: "bg-transparent border border-success c-green text-center hover:bg-success-100",
  },
  {
    label: "Error",
    className: "bg-transparent border border-danger c-red text-center hover:bg-danger-100",
  },
];

const GHOST: ButtonVariant[] = [
  {
    label: "Primary",
    className: "bg-primary-100 border border-primary c-gold text-center hover:bg-primary-200",
  },
  {
    label: "Dark",
    className: "bg-gray-100 border border-dark text-dark text-center hover:bg-gray-200 ",
  },
  {
    label: "Light",
    className:
      "bg-[var(--card2)] border border-[var(--border)] text-dark text-center hover:bg-gray-200 dark:hover:text-dark!",
  },
  {
    label: "Info",
    className: "bg-info-100 border border-info c-cyan text-center hover:bg-info-200",
  },
  {
    label: "Warning",
    className: "bg-warning-100 border border-warning c-orange text-center hover:bg-warning-200",
  },
  {
    label: "Success",
    className: "bg-success-100 border border-success c-green text-center hover:bg-success-200",
  },
  {
    label: "Error",
    className: "bg-danger-100 border border-danger c-red text-center hover:bg-danger-200",
  },
];

const ICON_BUTTON_BASE = "btn flex items-center justify-center gap-1.5 cursor-pointer";

const PRIMARY_SIZE_BUTTON =
  "bg-primary border border-primary text-white text-center hover:bg-primary-hover hover:border-primary-hover hover:text-white";

const CIRCLE_SIZES = [
  "w-7.5 h-7.5 flex justify-center items-center bg-primary border border-primary text-white text-center hover:bg-primary-hover hover:border-primary-hover hover:text-white rounded-full cursor-pointer",
  "w-8.75 h-8.75 flex justify-center items-center bg-primary border border-primary text-white text-lg text-center hover:bg-primary-hover hover:border-primary-hover hover:text-white rounded-full cursor-pointer",
  "w-11 h-11 flex justify-center items-center bg-primary border border-primary text-white  text-xl text-center hover:bg-primary-hover hover:border-primary-hover hover:text-white rounded-full cursor-pointer",
];

/* Shared by the preview and the code listing so the two cannot disagree. */
const buttonClassName = (variant: ButtonVariant, extraClassName: string, icon?: "left" | "right") =>
  `${icon ? ICON_BUTTON_BASE : "btn"} ${variant.className}${extraClassName}`;

/*
   Built from the same variants and props the card renders with, so the listing
   cannot drift from the preview above it.
*/
const buttonsCode = (variants: ButtonVariant[], extraClassName = "", icon?: "left" | "right") =>
  [
    '<div class="flex flex-wrap items-end gap-9">',
    ...variants.map((variant) => {
      const left = icon === "left" ? '<i data-lucide="chevron-left" class="w-4 h-4"></i>' : "";
      const right = icon === "right" ? '<i data-lucide="chevron-right" class="w-4 h-4"></i>' : "";
      const cls = buttonClassName(variant, extraClassName, icon);
      return `  <button type="button" class="${cls}">${left}${variant.label}${right}</button>`;
    }),
    "</div>",
  ].join("\n");

const SIZES_CODE = [
  '<div class="flex items-end flex-wrap gap-12">',
  ...["btn-sm", "btn", "btn-lg"].map(
    (size) => `  <button type="button" class="${size} ${PRIMARY_SIZE_BUTTON}">Button</button>`,
  ),
  "</div>",
].join("\n");

const CIRCLE_CODE = [
  '<div class="flex items-end gap-12">',
  ...CIRCLE_SIZES.map(
    (className) =>
      `  <button type="button" class="${className}"><i data-lucide="chevron-right" class="w-4 h-4"></i></button>`,
  ),
  "</div>",
].join("\n");

const ButtonRow = ({
  variants,
  extraClassName = "",
  icon,
}: {
  variants: ButtonVariant[];
  extraClassName?: string;
  icon?: "left" | "right";
}) => (
  <>
    {variants.map((variant) => (
      <button
        key={variant.label}
        type="button"
        className={buttonClassName(variant, extraClassName, icon)}
      >
        {icon === "left" && <ChevronLeft className="w-4 h-4" aria-hidden="true" />}
        {variant.label}
        {icon === "right" && <ChevronRight className="w-4 h-4" aria-hidden="true" />}
      </button>
    ))}
  </>
);

const UiButtons = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Buttons</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6">
        <PreviewCodeToggle
          title="Primary Buttons Sizes"
          cardShellClassName={`${CARD} mb-6`}
          contentClassName="preview-content flex items-end flex-wrap gap-12"
          code={SIZES_CODE}
        >
          {["btn-sm", "btn", "btn-lg"].map((size) => (
            <button
              key={size}
              type="button"
              className={`${size} ${PRIMARY_SIZE_BUTTON}`}
            >
              Button
            </button>
          ))}
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Circular Buttons Sizes"
          cardShellClassName={`${CARD} mb-6`}
          contentClassName="preview-content flex items-end gap-12"
          code={CIRCLE_CODE}
        >
          {CIRCLE_SIZES.map((className) => (
            <button key={className} type="button" className={className}>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ))}
        </PreviewCodeToggle>
      </div>
      {/* Start grid */}

      <div className="grid grid-cols-1 gap-6">
        <PreviewCodeToggle
          title="Default Buttons"
          cardShellClassName={CARD}
          contentClassName={ROW}
          code={buttonsCode(SOLID)}
        >
          <ButtonRow variants={SOLID} />
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Outline Buttons"
          cardShellClassName={CARD}
          contentClassName={ROW}
          code={buttonsCode(OUTLINE)}
        >
          <ButtonRow variants={OUTLINE} />
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Ghost Buttons"
          cardShellClassName={CARD}
          contentClassName={ROW}
          code={buttonsCode(GHOST)}
        >
          <ButtonRow variants={GHOST} />
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Rounded Buttons"
          cardShellClassName={CARD}
          contentClassName={ROW}
          code={buttonsCode(SOLID, " rounded-full")}
        >
          <ButtonRow variants={SOLID} extraClassName=" rounded-full" />
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Outline Round Buttons"
          cardShellClassName={CARD}
          contentClassName={ROW}
          code={buttonsCode(OUTLINE, " rounded-full")}
        >
          <ButtonRow variants={OUTLINE} extraClassName=" rounded-full" />
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Ghost Round Buttons"
          cardShellClassName={CARD}
          contentClassName={ROW}
          code={buttonsCode(GHOST, " rounded-full")}
        >
          <ButtonRow variants={GHOST} extraClassName=" rounded-full" />
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Default Buttons with Left Icon"
          cardShellClassName={CARD}
          contentClassName={ROW}
          code={buttonsCode(SOLID, "", "left")}
        >
          <ButtonRow variants={SOLID} icon="left" />
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Default Buttons with Right  Icon"
          cardShellClassName={CARD}
          contentClassName={ROW}
          code={buttonsCode(SOLID, "", "right")}
        >
          <ButtonRow variants={SOLID} icon="right" />
        </PreviewCodeToggle>
      </div>
      {/* end card */}
    </div>
  );
};

export default UiButtons;

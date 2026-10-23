import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

type Swatch = {
  /** Background utility, e.g. "bg-primary-100". */
  className: string;
  label: string;
};

type SwatchGroup = {
  title: string;
  contentClassName: string;
  swatches: Swatch[];
};

/*
   Every shade card is `bg-<token>-<shade>` paired with "<Label> <shade>", so
   only the class list varies per palette. The classes are spelled out rather
   than built with `bg-${token}-${shade}`: Tailwind v4 scans source files for
   literal utility strings, and an interpolated name generates no CSS.
*/
const shadeSwatches = (classNames: string[], label: string): Swatch[] =>
  classNames.map((className, index) => ({
    className,
    label: index < 9 ? `${label} ${(index + 1) * 100}` : `${label} hover`,
  }));

const SWATCH_ROW = "preview-content flex items-center flex-wrap gap-3";

const COLOR_GROUPS: SwatchGroup[] = [
  {
    title: "Brand",
    contentClassName: "preview-content flex flex-wrap items-center gap-3",
    swatches: [
      { className: "bg-primary", label: "Primary" },
      { className: "bg-dark", label: "Dark" },
      { className: "bg-[var(--card)]", label: "White" },
    ],
  },
  {
    title: "Grey Shades",
    contentClassName: SWATCH_ROW,
    swatches: shadeSwatches(
      [
        "bg-gray-100",
        "bg-gray-200",
        "bg-gray-300",
        "bg-gray-400",
        "bg-gray-500",
        "bg-gray-600",
        "bg-gray-700",
        "bg-gray-800",
        "bg-gray-900",
      ],
      "Grey",
    ),
  },
  {
    title: "Primary Shades",
    contentClassName: SWATCH_ROW,
    swatches: shadeSwatches(
      [
        "bg-primary-100",
        "bg-primary-200",
        "bg-primary-300",
        "bg-primary-400",
        "bg-primary-500",
        "bg-primary-600",
        "bg-primary-700",
        "bg-primary-800",
        "bg-primary-900",
        "bg-primary-hover",
      ],
      "Primary",
    ),
  },
  {
    title: "Info Shades",
    contentClassName: SWATCH_ROW,
    swatches: shadeSwatches(
      [
        "bg-info-100",
        "bg-info-200",
        "bg-info-300",
        "bg-info-400",
        "bg-info-500",
        "bg-info-600",
        "bg-info-700",
        "bg-info-800",
        "bg-info-900",
        "bg-info-hover",
      ],
      "Info",
    ),
  },
  {
    title: "Warning Shades",
    contentClassName: SWATCH_ROW,
    swatches: shadeSwatches(
      [
        "bg-warning-100",
        "bg-warning-200",
        "bg-warning-300",
        "bg-warning-400",
        "bg-warning-500",
        "bg-warning-600",
        "bg-warning-700",
        "bg-warning-800",
        "bg-warning-900",
        "bg-warning-hover",
      ],
      "Warning",
    ),
  },
  {
    title: "Success Shades",
    contentClassName: SWATCH_ROW,
    swatches: shadeSwatches(
      [
        "bg-success-100",
        "bg-success-200",
        "bg-success-300",
        "bg-success-400",
        "bg-success-500",
        "bg-success-600",
        "bg-success-700",
        "bg-success-800",
        "bg-success-900",
        "bg-success-hover",
      ],
      "Success",
    ),
  },
  {
    title: "Error Shades",
    contentClassName: SWATCH_ROW,
    swatches: shadeSwatches(
      [
        "bg-danger-100",
        "bg-danger-200",
        "bg-danger-300",
        "bg-danger-400",
        "bg-danger-500",
        "bg-danger-600",
        "bg-danger-700",
        "bg-danger-800",
        "bg-danger-900",
        "bg-danger-hover",
      ],
      "Error",
    ),
  },
  {
    title: "Pink Shades",
    contentClassName: SWATCH_ROW,
    swatches: shadeSwatches(
      [
        "bg-pink-100",
        "bg-pink-200",
        "bg-pink-300",
        "bg-pink-400",
        "bg-pink-500",
        "bg-pink-600",
        "bg-pink-700",
        "bg-pink-800",
        "bg-pink-900",
      ],
      "Pink",
    ),
  },
  {
    title: "Purple Shades",
    contentClassName: SWATCH_ROW,
    swatches: shadeSwatches(
      [
        "bg-purple-100",
        "bg-purple-200",
        "bg-purple-300",
        "bg-purple-400",
        "bg-purple-500",
        "bg-purple-600",
        "bg-purple-700",
        "bg-purple-800",
        "bg-purple-900",
      ],
      "Purple",
    ),
  },
  {
    title: "Orange Shades",
    contentClassName: SWATCH_ROW,
    swatches: shadeSwatches(
      [
        "bg-orange-100",
        "bg-orange-200",
        "bg-orange-300",
        "bg-orange-400",
        "bg-orange-500",
        "bg-orange-600",
        "bg-orange-700",
        "bg-orange-800",
        "bg-orange-900",
      ],
      "Orange",
    ),
  },
  {
    title: "Indigo Shades",
    contentClassName: SWATCH_ROW,
    swatches: shadeSwatches(
      [
        "bg-indigo-100",
        "bg-indigo-200",
        "bg-indigo-300",
        "bg-indigo-400",
        "bg-indigo-500",
        "bg-indigo-600",
        "bg-indigo-700",
        "bg-indigo-800",
        "bg-indigo-900",
      ],
      "Indigo",
    ),
  },
  {
    title: "Cyan Shades",
    contentClassName: SWATCH_ROW,
    swatches: shadeSwatches(
      [
        "bg-cyan-100",
        "bg-cyan-200",
        "bg-cyan-300",
        "bg-cyan-400",
        "bg-cyan-500",
        "bg-cyan-600",
        "bg-cyan-700",
        "bg-cyan-800",
        "bg-cyan-900",
      ],
      "Cyan",
    ),
  },
  {
    title: "Teal Shades",
    contentClassName: SWATCH_ROW,
    swatches: shadeSwatches(
      [
        "bg-teal-100",
        "bg-teal-200",
        "bg-teal-300",
        "bg-teal-400",
        "bg-teal-500",
        "bg-teal-600",
        "bg-teal-700",
        "bg-teal-800",
        "bg-teal-900",
      ],
      "Teal",
    ),
  },
];

/*
   Built from the same `swatches` the card renders, so the listing cannot drift
   from the preview above it.
*/
const groupCode = (group: SwatchGroup) =>
  [
    `<div class="${group.contentClassName.replace("preview-content ", "")}">`,
    ...group.swatches.flatMap((swatch) => [
      "  <div>",
      `    <div class="w-21! h-10 ${swatch.className} rounded-full mb-2"></div>`,
      `    <p class="text-center text-xs text-dark dark:text-white font-medium">${swatch.label}</p>`,
      "  </div>",
    ]),
    "</div>",
  ].join("\n");

const UiColors = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Colors</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-1 gap-6">
        {COLOR_GROUPS.map((group) => (
          <PreviewCodeToggle
            key={group.title}
            title={group.title}
            contentClassName={group.contentClassName}
            code={groupCode(group)}
          >
            {group.swatches.map((swatch) => (
              <div key={swatch.label}>
                <div className={`w-21! h-10 ${swatch.className} rounded-full mb-2`} />
                <p className="text-center text-xs text-dark dark:text-white font-medium">
                  {swatch.label}
                </p>
              </div>
            ))}
          </PreviewCodeToggle>
        ))}
      </div>
      {/* End grid */}
    </div>
  );
};

export default UiColors;

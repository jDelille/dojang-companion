import { Fragment, type ReactNode } from "react";
import { ArrowRight, ChevronsRight, House } from "lucide-react";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

const LINK = "flex items-center  text-gray-600 hover:text-primary";
const CURRENT = "inline-flex items-center  font-medium text-dark dark:text-white";
const OL_BASE = "flex flex-wrap items-center whitespace-nowrap gap-2";

type SeparatorKind = "slash" | "chevrons" | "arrow";

const SEPARATORS: Record<SeparatorKind, ReactNode> = {
  slash: "/",
  chevrons: <ChevronsRight className="w-4 h-4" aria-hidden="true" />,
  arrow: <ArrowRight className="w-4 h-4" aria-hidden="true" />,
};

type Crumb = {
  label: string;
  /** The last crumb of a trail renders as plain text with aria-current. */
  current?: boolean;
  withHomeIcon?: boolean;
};

type TrailProps = {
  crumbs: Crumb[];
  separator: SeparatorKind;
  className?: string;
  /** Coloured bars invert every element, including the separators. */
  inverted?: boolean;
};

/* Separator markup for the listings, keyed the same as SEPARATORS above. */
const SEPARATOR_HTML: Record<SeparatorKind, string> = {
  slash: "/",
  chevrons: '<i data-lucide="chevrons-right" class="w-4 h-4"></i>',
  arrow: '<i data-lucide="arrow-right" class="w-4 h-4"></i>',
};

/*
   Built from the same crumbs and props the card renders with, so the listing
   cannot drift from the preview above it.
*/
const trailCode = ({ crumbs, separator, className = "", inverted = false }: TrailProps) => {
  const lines: string[] = [`<ol class="${OL_BASE}${className ? ` ${className}` : ""}">`];

  crumbs.forEach((crumb, index) => {
    if (index > 0) {
      lines.push(`  <li class="inline-flex items-center${inverted ? " text-white" : ""}">`);
      lines.push(`    ${SEPARATOR_HTML[separator]}`);
      lines.push("  </li>");
    }

    if (crumb.current) {
      const cls = inverted ? "inline-flex items-center  font-medium text-white" : CURRENT;
      lines.push(`  <li class="${cls}" aria-current="page">`);
      lines.push(`    ${crumb.label}`);
      lines.push("  </li>");
      return;
    }

    const icon = crumb.withHomeIcon ? '<i data-lucide="house" class="w-4 h-4 me-2"></i> ' : "";
    lines.push('  <li class="inline-flex items-center">');
    lines.push(`    <a class="${inverted ? "flex items-center  text-white" : LINK}" href="#">`);
    lines.push(`      ${icon}${crumb.label}`);
    lines.push("    </a>");
    lines.push("  </li>");
  });

  lines.push("</ol>");
  return lines.join("\n");
};

const Trail = ({ crumbs, separator, className = "", inverted = false }: TrailProps) => (
  <ol className={`${OL_BASE}${className ? ` ${className}` : ""}`}>
    {crumbs.map((crumb, index) => (
      <Fragment key={crumb.label}>
        {index > 0 && (
          <li className={`inline-flex items-center${inverted ? " text-white" : ""}`}>
            {SEPARATORS[separator]}
          </li>
        )}
        {crumb.current ? (
          <li
            className={inverted ? "inline-flex items-center  font-medium text-white" : CURRENT}
            aria-current="page"
          >
            {crumb.label}
          </li>
        ) : (
          <li className="inline-flex items-center">
            <a className={inverted ? "flex items-center  text-white" : LINK} href="#">
              {crumb.withHomeIcon && <House className="w-4 h-4 me-2" aria-hidden="true" />}
              {crumb.withHomeIcon ? ` ${crumb.label}` : crumb.label}
            </a>
          </li>
        )}
      </Fragment>
    ))}
  </ol>
);

/* The first four cards show the same three trails, varying only the separator. */
const SAMPLE_TRAILS: Crumb[][] = [
  [{ label: "Home" }],
  [{ label: "Home" }, { label: "Library", current: true }],
  [{ label: "Home" }, { label: "Library" }, { label: "Data", current: true }],
];

const APP_TRAIL: Crumb[] = [
  { label: "Home", withHomeIcon: true },
  { label: "App Center " },
  { label: "Application", current: true },
];

const COLORED_BARS = [
  "bg-primary",
  "bg-info",
  "bg-dark",
  "bg-warning",
  "bg-success",
  "bg-danger",
] as const;

const GHOST_BARS = [
  "border border-primary bg-primary-transparent",
  "border border-info bg-info-transparent",
  "border border-dark bg-gray-transparent",
  "border border-warning bg-warning-transparent",
  "border border-success bg-success-transparent",
  "border border-danger bg-danger-transparent",
] as const;

/* The first four cards share these three trails; only the separator differs. */
const sampleTrailProps = (separator: SeparatorKind, withHomeIcon: boolean): TrailProps[] =>
  SAMPLE_TRAILS.map((crumbs, index) => ({
    crumbs: withHomeIcon
      ? crumbs.map((crumb, i) => (i === 0 ? { ...crumb, withHomeIcon: true } : crumb))
      : crumbs,
    separator,
    className: index < SAMPLE_TRAILS.length - 1 ? "mb-3" : "",
  }));

const sampleTrailsCode = (separator: SeparatorKind, withHomeIcon = false) =>
  sampleTrailProps(separator, withHomeIcon).map(trailCode).join("\n");

const coloredBarProps = (): TrailProps[] =>
  COLORED_BARS.map((background, index) => ({
    crumbs: APP_TRAIL,
    separator: "slash" as const,
    inverted: true,
    className: `${background} p-3 rounded-lg${index < COLORED_BARS.length - 1 ? " mb-4" : ""}`,
  }));

const ghostBarProps = (): TrailProps[] =>
  GHOST_BARS.map((background, index) => ({
    crumbs: APP_TRAIL,
    separator: "arrow" as const,
    className: `${background} p-3 rounded-lg${index < GHOST_BARS.length - 1 ? " mb-4" : ""}`,
  }));

const COLORED_CODE = coloredBarProps().map(trailCode).join("\n");
const GHOST_CODE = ghostBarProps().map(trailCode).join("\n");

const SampleTrails = ({
  separator,
  withHomeIcon = false,
}: {
  separator: SeparatorKind;
  withHomeIcon?: boolean;
}) => (
  <>
    {sampleTrailProps(separator, withHomeIcon).map((props) => (
      <Trail key={props.crumbs.map((crumb) => crumb.label).join()} {...props} />
    ))}
  </>
);

const UiBreadcrumb = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Breadcrumb</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-baseline">
        <PreviewCodeToggle title="Default Breadcrumb" code={sampleTrailsCode("slash")}>
          <SampleTrails separator="slash" />
        </PreviewCodeToggle>

        <PreviewCodeToggle title="Arrow Style" code={sampleTrailsCode("chevrons")}>
          <SampleTrails separator="chevrons" />
        </PreviewCodeToggle>

        <PreviewCodeToggle title="Pipe Style" code={sampleTrailsCode("arrow")}>
          <SampleTrails separator="arrow" />
        </PreviewCodeToggle>

        <PreviewCodeToggle title="Breadcrumb with Icon" code={sampleTrailsCode("arrow", true)}>
          <SampleTrails separator="arrow" withHomeIcon />
        </PreviewCodeToggle>

        <PreviewCodeToggle title="Colored Breadcrumb" code={COLORED_CODE}>
          {coloredBarProps().map((props) => (
            <Trail key={props.className} {...props} />
          ))}
        </PreviewCodeToggle>

        <PreviewCodeToggle title="Ghost Breadcrumb" code={GHOST_CODE}>
          {ghostBarProps().map((props) => (
            <Trail key={props.className} {...props} />
          ))}
        </PreviewCodeToggle>
      </div>
      {/* End grid */}
    </div>
  );
};

export default UiBreadcrumb;

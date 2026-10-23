import { Check, X } from "lucide-react";
import ImageWithBasePath from "../../../components/image-with-base-path";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

const CARD_LAST = "preview-card bg-[var(--card)] rounded-xl border border-[var(--border)] p-5";
const CARD = `${CARD_LAST} mb-6`;
const ROW = "preview-content flex items-start flex-wrap gap-4";
const AVATAR = "assets/img/avatars/avatar-01.jpg";

type BadgeVariant = {
  label: string;
  /** Colour classes only; shape and size are applied per card. */
  className: string;
  /** Dot colour for the "with Dot" ghost cards. */
  ghostDotClassName: string;
};

/* Every card on the page renders these same six variants. */
const SOLID: BadgeVariant[] = [
  { label: "Primary", className: "bg-primary text-white", ghostDotClassName: "bg-primary" },
  { label: "Dark", className: "bg-dark text-white", ghostDotClassName: "bg-dark" },
  { label: "Success", className: "bg-success text-white", ghostDotClassName: "bg-success" },
  { label: "Warning", className: "bg-warning text-white", ghostDotClassName: "bg-warning" },
  { label: "Info", className: "bg-info text-white", ghostDotClassName: "bg-info" },
  { label: "Error", className: "bg-danger text-white", ghostDotClassName: "bg-danger" },
];

const GHOST: BadgeVariant[] = [
  {
    label: "Primary",
    className: "bg-primary-transparent c-gold border border-primary",
    ghostDotClassName: "bg-primary",
  },
  {
    label: "Dark",
    className: "bg-gray-transparent text-dark dark:text-white border border-[var(--border)]",
    ghostDotClassName: "bg-dark dark:bg-[var(--surface)]-white!",
  },
  {
    label: "Success",
    className: "bg-success-transparent c-green border border-success",
    ghostDotClassName: "bg-success",
  },
  {
    label: "Warning",
    className: "bg-warning-transparent c-orange border border-warning",
    ghostDotClassName: "bg-warning",
  },
  {
    label: "Info",
    className: "bg-info-transparent c-cyan border border-info",
    ghostDotClassName: "bg-info",
  },
  {
    label: "Error",
    className: "bg-danger-transparent c-red border border-danger",
    ghostDotClassName: "bg-danger",
  },
];

const SOLID_DOT = "bg-[var(--card)] w-1.5 h-1.5 block rounded-full me-1 dark:bg-[var(--surface)]-white";

type Decoration = "none" | "leftIcon" | "rightIcon" | "solidDot" | "ghostDot" | "image" | "imageIcon";

type BadgeRowProps = {
  variants: BadgeVariant[];
  /** Shape utility, e.g. "rounded-md" / "rounded-full". */
  shape: string;
  size?: "badge" | "badge-small";
  /** Rounding of the leading avatar, when one is shown. */
  imageShape?: string;
  decoration?: Decoration;
};

/*
   Built from the same props the card renders with, so the listing cannot drift
   from the preview above it.
*/
const badgesCode = ({
  variants,
  shape,
  size = "badge",
  imageShape = "rounded-xs",
  decoration = "none",
}: BadgeRowProps) =>
  [
    '<div class="flex items-start flex-wrap gap-4">',
    ...variants.map((variant) => {
      const parts: string[] = [];
      if (decoration === "leftIcon") parts.push('<i data-lucide="check" class="w-4 h-4 me-1"></i>');
      if (decoration === "solidDot") parts.push(`<span class="${SOLID_DOT}"></span>`);
      if (decoration === "ghostDot") {
        parts.push(
          `<span class="${variant.ghostDotClassName} w-1.5 h-1.5 block rounded-full me-1"></span>`,
        );
      }
      if (decoration === "image" || decoration === "imageIcon") {
        parts.push(`<ImageWithBasePath src="${AVATAR}" class="w-3 h-3 me-1 ${imageShape}" alt="avatar">`);
      }
      parts.push(
        decoration === "leftIcon" || decoration === "solidDot" || decoration === "ghostDot"
          ? ` ${variant.label}`
          : variant.label,
      );
      if (decoration === "rightIcon" || decoration === "imageIcon") {
        parts.push(' <i data-lucide="x" class="w-4 h-4 ms-1"></i>');
      }
      return `  <span class="${badgeClassName(variant, shape, size, decoration)}">${parts.join(
        "",
      )}</span>`;
    }),
    "</div>",
  ].join("\n");

/* Shared by the preview and the code listing so the two cannot disagree. */
const badgeClassName = (
  variant: BadgeVariant,
  shape: string,
  size: string,
  decoration: Decoration,
) =>
  `${decoration !== "none" ? "inline-flex items-center " : ""}${size} ${shape} text-xs font-medium ${
    variant.className
  }`;

const BadgeRow = ({
  variants,
  shape,
  size = "badge",
  imageShape = "rounded-xs",
  decoration = "none",
}: BadgeRowProps) => (
  <>
    {variants.map((variant) => {
      const hasImage = decoration === "image" || decoration === "imageIcon";

      return (
        <span
          key={variant.label}
          className={badgeClassName(variant, shape, size, decoration)}
        >
          {decoration === "leftIcon" && <Check className="w-4 h-4 me-1" aria-hidden="true" />}
          {decoration === "solidDot" && <span className={SOLID_DOT} />}
          {decoration === "ghostDot" && (
            <span className={`${variant.ghostDotClassName} w-1.5 h-1.5 block rounded-full me-1`} />
          )}
          {hasImage && (
            <ImageWithBasePath
              src={AVATAR}
              className={`w-3 h-3 me-1 ${imageShape}`}
              alt="avatar"
            />
          )}
          {decoration === "leftIcon" || decoration === "solidDot" || decoration === "ghostDot"
            ? ` ${variant.label}`
            : variant.label}
          {(decoration === "rightIcon" || decoration === "imageIcon") && (
            <X className="w-4 h-4 ms-1" aria-hidden="true" />
          )}
        </span>
      );
    })}
  </>
);

type BadgeCardConfig = {
  title: string;
  row: BadgeRowProps;
  /** The two "Sizes" cards stack a small row above the default-size row. */
  smallRow?: BadgeRowProps;
  /** The last two cards drop the bottom margin. */
  last?: boolean;
};

const BADGE_CARDS: BadgeCardConfig[] = [
  { title: "Default Badge", row: { variants: SOLID, shape: "rounded-md" } },
  { title: "Rounded Badge", row: { variants: SOLID, shape: "rounded-full" } },
  { title: "Ghost Badge Flat", row: { variants: GHOST, shape: "rounded-lg" } },
  { title: "Ghost Badge Rounded", row: { variants: GHOST, shape: "rounded-full" } },
  {
    title: "Default Badge Sizes",
    smallRow: { variants: SOLID, shape: "rounded-md", size: "badge-small" },
    row: { variants: SOLID, shape: "rounded-md" },
  },
  {
    title: "Ghost Badge Sizes",
    smallRow: { variants: GHOST, shape: "rounded-md", size: "badge-small" },
    row: { variants: GHOST, shape: "rounded-lg" },
  },
  {
    title: "Default Badge with Left Icon",
    row: { variants: SOLID, shape: "rounded-md", decoration: "leftIcon" },
  },
  {
    title: "Rounded Badge with Left Icon",
    row: { variants: SOLID, shape: "rounded-full", decoration: "leftIcon" },
  },
  {
    title: "Ghost Badge Flat with Left Icon",
    row: { variants: GHOST, shape: "rounded-lg", decoration: "leftIcon" },
  },
  {
    title: "Ghost Badge Rounded with Left Icon",
    row: { variants: GHOST, shape: "rounded-full", decoration: "leftIcon" },
  },
  {
    title: "Default Badge with Right Icon",
    row: { variants: SOLID, shape: "rounded-md", decoration: "rightIcon" },
  },
  {
    title: "Rounded Badge with Right Icon",
    row: { variants: SOLID, shape: "rounded-full", decoration: "rightIcon" },
  },
  {
    title: "Ghost Badge Flat with Right Icon",
    row: { variants: GHOST, shape: "rounded-lg", decoration: "rightIcon" },
  },
  {
    title: "Ghost Badge Rounded with Right Icon",
    row: { variants: GHOST, shape: "rounded-full", decoration: "rightIcon" },
  },
  {
    title: "Default Badge with Dot",
    row: { variants: SOLID, shape: "rounded-md", decoration: "solidDot" },
  },
  {
    title: "Rounded Badge with Dot",
    row: { variants: SOLID, shape: "rounded-full", decoration: "solidDot" },
  },
  {
    title: "Ghost Badge Flat with Dot",
    row: { variants: GHOST, shape: "rounded-lg", decoration: "ghostDot" },
  },
  {
    title: "Ghost Badge Rounded with Dot",
    row: { variants: GHOST, shape: "rounded-full", decoration: "ghostDot" },
  },
  {
    title: "Default Badge with Image",
    row: { variants: SOLID, shape: "rounded-md", decoration: "image" },
  },
  {
    title: "Rounded Badge with Image",
    row: {
      variants: SOLID,
      shape: "rounded-full",
      decoration: "image",
      imageShape: "rounded-full",
    },
  },
  {
    title: "Ghost Badge Flat with Image",
    row: { variants: GHOST, shape: "rounded-lg", decoration: "image" },
  },
  {
    title: "Ghost Badge Rounded with Image",
    row: {
      variants: GHOST,
      shape: "rounded-full",
      decoration: "image",
      imageShape: "rounded-full",
    },
  },
  {
    title: "Default Badge with Image & Icon",
    row: { variants: SOLID, shape: "rounded-md", decoration: "imageIcon" },
  },
  {
    title: "Rounded Badge with Image & Icon",
    row: {
      variants: SOLID,
      shape: "rounded-full",
      decoration: "imageIcon",
      imageShape: "rounded-full",
    },
  },
  {
    title: "Ghost Badge Flat with Image & Icon",
    row: { variants: GHOST, shape: "rounded-lg", decoration: "imageIcon" },
    last: true,
  },
  {
    title: "Ghost Badge Rounded with Image & Icon",
    row: {
      variants: GHOST,
      shape: "rounded-full",
      decoration: "imageIcon",
      imageShape: "rounded-full",
    },
    last: true,
  },
];

const UiBadges = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Badge</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6">
        {BADGE_CARDS.map((card) => (
          <PreviewCodeToggle
            key={card.title}
            title={card.title}
            cardShellClassName={card.last ? CARD_LAST : CARD}
            contentClassName={card.smallRow ? "preview-content" : ROW}
            code={
              card.smallRow
                ? `${badgesCode(card.smallRow)}
${badgesCode(card.row)}`
                : badgesCode(card.row)
            }
          >
            {card.smallRow ? (
              <>
                <div className="flex items-start flex-wrap justify-between mb-5">
                  <BadgeRow {...card.smallRow} />
                </div>
                <div className="flex items-start flex-wrap gap-4">
                  <BadgeRow {...card.row} />
                </div>
              </>
            ) : (
              <BadgeRow {...card.row} />
            )}
          </PreviewCodeToggle>
        ))}
      </div>
      {/* End grid */}
    </div>
  );
};

export default UiBadges;

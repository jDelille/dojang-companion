import { User } from "lucide-react";
import ImageWithBasePath from "../../../components/image-with-base-path";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

const DASHED_BOX = "border-dashed border-primary border px-4.5 py-5 rounded-md";
const IMAGE_ROW = `flex flex-wrap items-end justify-start lg:justify-between! gap-3 ${DASHED_BOX}`;
const PLACEHOLDER_ROW_TOP =
  "flex flex-wrap items-end lg:justify-between justify-start gap-3 lg:mb-12 mb-5";
const PLACEHOLDER_ROW = "flex flex-wrap items-end lg:justify-between justify-start gap-3";
const SURFACE = "bg-[var(--surface)] border border-[var(--border)]";
const STACKED_ITEM =
  "inline-flex items-center justify-center font-medium hover:-translate-y-[0.188rem] hover:z-1  transition-transform duration-150 ease-in-out -me-3.5 align-middle border border-[var(--border)]";

const avatarSrc = (n: string) => `assets/img/avatars/avatar-${n}.jpg`;

/* size + rounding pairs, listed literally so Tailwind's scanner sees them. */
type Sized = { size: string; rounding: string };

const CIRCLE_IMAGES: Sized[] = [
  { size: "w-3 h-3", rounding: "rounded-full" },
  { size: "w-4 h-4", rounding: "rounded-full" },
  { size: "w-5 h-5", rounding: "rounded-full" },
  { size: "w-6 h-6", rounding: "rounded-full" },
  { size: "w-8 h-8", rounding: "rounded-full" },
  { size: "w-10 h-10", rounding: "rounded-full" },
];

const SQUARE_IMAGES: Sized[] = [
  { size: "w-3 h-3", rounding: "rounded-xs" },
  { size: "w-4 h-4", rounding: "rounded-xs" },
  { size: "w-5 h-5", rounding: "rounded-sm" },
  { size: "w-6 h-6", rounding: "rounded-md" },
  { size: "w-8 h-8", rounding: "rounded-lg" },
  { size: "w-10 h-10", rounding: "rounded-lg" },
];

/* Placeholder sizes carry a text size because the glyph scales with the box. */
type Placeholder = Sized & { text: string };

const CIRCLE_PLACEHOLDERS: Placeholder[] = [
  { size: "w-4 h-4", rounding: "rounded-full", text: "text-xs" },
  { size: "w-5 h-5", rounding: "rounded-full", text: "text-xs" },
  { size: "w-6 h-6", rounding: "rounded-full", text: "text-xs" },
  { size: "w-8 h-8", rounding: "rounded-full", text: "text-[13px]" },
  { size: "w-10 h-10", rounding: "rounded-full", text: "" },
  { size: "w-11 h-11", rounding: "rounded-full", text: "" },
];

const SQUARE_PLACEHOLDERS: Placeholder[] = [
  { size: "w-4 h-4", rounding: "rounded-xs", text: "text-xs" },
  { size: "w-5 h-5", rounding: "rounded-sm", text: "text-xs" },
  { size: "w-6 h-6", rounding: "rounded-md", text: "text-xs" },
  { size: "w-8 h-8", rounding: "rounded-lg", text: "text-[13px]" },
  { size: "w-10 h-10", rounding: "rounded-lg", text: "" },
  { size: "w-11 h-11", rounding: "rounded-xl", text: "" },
];

/* Dot avatars nudge the status dot per size, so offsets are part of the data. */
type DotAvatar = Sized & { dot: string };

const CIRCLE_ICON_DOTS: DotAvatar[] = [
  { size: "w-4 h-4", rounding: "rounded-full", dot: "-bottom-0.5 -end-0.5 size-1.5" },
  { size: "w-5 h-5", rounding: "rounded-full", dot: "bottom-0 end-0 size-1.5" },
  { size: "w-6 h-6", rounding: "rounded-full", dot: "bottom-0 end-0 size-1.5" },
  { size: "w-8 h-8", rounding: "rounded-full", dot: "bottom-0 end-0 size-2" },
  { size: "w-10 h-10", rounding: "rounded-full", dot: "bottom-0.5 end-0.5 size-2" },
  { size: "w-11 h-11", rounding: "rounded-full", dot: "bottom-0 end-1.5 size-2" },
];

const SQUARE_ICON_DOTS: DotAvatar[] = [
  { size: "w-4 h-4", rounding: "rounded-xs", dot: "bottom-0 end-0 size-1.5" },
  { size: "w-5 h-5", rounding: "rounded-sm", dot: "bottom-0 end-0 size-1.5" },
  { size: "w-6 h-6", rounding: "rounded-md", dot: "bottom-0 end-0 size-1.5" },
  { size: "w-8 h-8", rounding: "rounded-lg", dot: "bottom-0 end-0 size-2" },
  { size: "w-10 h-10", rounding: "rounded-lg", dot: "bottom-0 end-0 size-2" },
  { size: "w-11 h-11", rounding: "rounded-xl", dot: "bottom-0 end-0 size-2" },
];

type ImageDot = DotAvatar & { src: string };

const CIRCLE_IMAGE_DOTS: ImageDot[] = [
  { size: "w-4 h-4", rounding: "rounded-full", dot: "bottom-0 -end-0.5 size-1.5", src: "15" },
  { size: "w-5 h-5", rounding: "rounded-full", dot: "bottom-0 end-0 size-1.5", src: "16" },
  { size: "w-6 h-6", rounding: "rounded-full", dot: "bottom-0 end-0.5 size-1.5", src: "17" },
  { size: "w-8 h-8", rounding: "rounded-full", dot: "bottom-0 end-0.5 size-2", src: "18" },
  { size: "w-10 h-10", rounding: "rounded-full", dot: "bottom-0 end-1.5 size-2", src: "19" },
  { size: "w-12 h-12", rounding: "rounded-full", dot: "bottom-0 end-1.75 size-2", src: "20" },
];

const SQUARE_IMAGE_DOTS: ImageDot[] = [
  { size: "w-4 h-4", rounding: "rounded-xs", dot: "bottom-0 end-0 size-1.5", src: "21" },
  { size: "w-5 h-5", rounding: "rounded-sm", dot: "bottom-0 end-0 size-1.5", src: "22" },
  { size: "w-6 h-6", rounding: "rounded-md", dot: "bottom-0 end-0 size-1.5", src: "23" },
  { size: "w-8 h-8", rounding: "rounded-lg", dot: "bottom-0 end-0 size-2", src: "24" },
  { size: "w-10 h-10", rounding: "rounded-lg", dot: "bottom-0 end-0 size-2", src: "25" },
  { size: "w-12 h-12", rounding: "rounded-xl", dot: "bottom-0 end-0 size-2", src: "26" },
];

type StackedGroup = {
  size: string;
  rounding: string;
  text: string;
  wrapperClassName: string;
  images: string[];
};

const CIRCLE_STACKS: StackedGroup[] = [
  {
    size: "w-6 h-6",
    rounding: "rounded-full",
    text: "text-[12px]",
    wrapperClassName: "avatar-list-stacked",
    images: ["27", "28", "29"],
  },
  {
    size: "w-8 h-8",
    rounding: "rounded-full",
    text: "text-[13px]",
    wrapperClassName: "avatar-list-stacked",
    images: ["01", "02", "03"],
  },
  {
    size: "w-10 h-10",
    rounding: "rounded-full",
    text: "text-[14px]",
    wrapperClassName: "avatar-list-stacked pr-4.5",
    images: ["04", "05", "06"],
  },
];

const SQUARE_STACKS: StackedGroup[] = [
  {
    size: "w-6 h-6",
    rounding: "rounded-md",
    text: "text-[12px]",
    wrapperClassName: "avatar-list-stacked",
    images: ["06", "07", "08"],
  },
  {
    size: "w-8 h-8",
    rounding: "rounded-lg",
    text: "text-[13px]",
    wrapperClassName: "avatar-list-stacked",
    images: ["09", "10", "11"],
  },
  {
    size: "w-10 h-10",
    rounding: "rounded-lg",
    text: "text-[14px]",
    wrapperClassName: "avatar-list-stacked pr-4.5",
    images: ["12", "13", "14"],
  },
];

/*
   All listings below are built from the same arrays the previews map over, so
   they cannot drift from what is rendered.
*/
const imageRowCode = (items: Sized[], srcs: string[]) =>
  [
    `<div class="${IMAGE_ROW}">`,
    ...items.map(
      (item, index) =>
        `  <ImageWithBasePath class="${item.size} border border-[var(--border)] ${item.rounding}" src="${avatarSrc(srcs[index])}" alt="avatar">`,
    ),
    "</div>",
  ].join("\n");

const placeholderRowCode = (items: Placeholder[], variant: "primary" | "surface") =>
  items
    .map((item) => {
      const bg = variant === "primary" ? "bg-primary" : SURFACE;
      const fg = variant === "primary" ? "text-white" : "text-dark dark:text-white";
      return `  <span class="${item.size} ${bg} ${item.rounding} ${item.text} ${fg} flex justify-center items-center font-semibold">AI</span>`;
    })
    .join("\n");

const iconRowCode = (items: Sized[], variant: "primary" | "surface") =>
  items
    .map((item) => {
      const bg = variant === "primary" ? "bg-primary" : SURFACE;
      const fg = variant === "primary" ? "text-white" : "text-dark dark:text-white";
      return `  <span class="${item.size} ${bg} ${item.rounding} ${fg} flex justify-center items-center"><i data-lucide="user" class="w-4 h-4"></i> </span>`;
    })
    .join("\n");

/* Both rows of a placeholder/icon card, wrapped in their flex containers. */
const twoRowCode = (top: string, bottom: string) =>
  [
    `<div class="${PLACEHOLDER_ROW_TOP}">`,
    top,
    "</div>",
    `<div class="${PLACEHOLDER_ROW}">`,
    bottom,
    "</div>",
  ].join("\n");

const stackedRowCode = (groups: StackedGroup[]) =>
  [
    `<div class="flex flex-wrap lg:justify-between! justify-center gap-10 items-end ${DASHED_BOX}">`,
    ...groups.flatMap((group) => [
      `  <div class="${group.wrapperClassName}">`,
      ...group.images.map(
        (image) =>
          `    <ImageWithBasePath class="${group.size} ${STACKED_ITEM} ${group.rounding}" src="${avatarSrc(image)}" alt="img">`,
      ),
      `    <a class="${group.size} ${STACKED_ITEM} ${group.rounding} ${group.text} bg-[var(--surface)] text-dark dark:text-white" href="javascript:void(0);"> +8 </a>`,
      "  </div>",
    ]),
    "</div>",
  ].join("\n");

const iconDotRowCode = (items: DotAvatar[]) =>
  items
    .map(
      (item) =>
        `  <span class="${item.size} relative ${SURFACE} ${item.rounding} text-dark dark:text-white flex justify-center items-center"><i data-lucide="user" class="w-4 h-4"></i><span class="${item.dot} absolute  bg-success border border-white rounded-full"></span></span>`,
    )
    .join("\n");

const imageDotRowCode = (items: ImageDot[]) =>
  items
    .map(
      (item) =>
        `  <span class="relative"><ImageWithBasePath class="${item.size} border border-[var(--border)] ${item.rounding}" src="${avatarSrc(item.src)}" alt="avatar"><span class="${item.dot} absolute  bg-success border border-white rounded-full"></span></span>`,
    )
    .join("\n");

const ImageRow = ({ items, srcs }: { items: Sized[]; srcs: string[] }) => (
  <div className={IMAGE_ROW}>
    {items.map((item, index) => (
      <ImageWithBasePath
        key={srcs[index]}
        className={`${item.size} border border-[var(--border)] ${item.rounding}`}
        src={avatarSrc(srcs[index])}
        alt="avatar"
      />
    ))}
  </div>
);

const PlaceholderRow = ({
  items,
  variant,
}: {
  items: Placeholder[];
  variant: "primary" | "surface";
}) => (
  <>
    {items.map((item) => (
      <span
        key={item.size + item.rounding}
        className={`${item.size} ${
          variant === "primary" ? "bg-primary" : SURFACE
        } ${item.rounding} ${item.text} ${
          variant === "primary" ? "text-white" : "text-dark dark:text-white"
        } flex justify-center items-center font-semibold`}
      >
        AI
      </span>
    ))}
  </>
);

const IconRow = ({ items, variant }: { items: Sized[]; variant: "primary" | "surface" }) => (
  <>
    {items.map((item) => (
      <span
        key={item.size + item.rounding}
        className={`${item.size} ${
          variant === "primary" ? "bg-primary" : SURFACE
        } ${item.rounding} ${
          variant === "primary" ? "text-white" : "text-dark dark:text-white"
        } flex justify-center items-center`}
      >
        <User className="w-4 h-4" aria-hidden="true" />{" "}
      </span>
    ))}
  </>
);

const StackedRow = ({ groups }: { groups: StackedGroup[] }) => (
  <div
    className={`flex flex-wrap lg:justify-between! justify-center gap-10 items-end ${DASHED_BOX}`}
  >
    {groups.map((group) => (
      <div key={group.images.join()} className={group.wrapperClassName}>
        {group.images.map((image) => (
          <ImageWithBasePath
            key={image}
            className={`${group.size} ${STACKED_ITEM} ${group.rounding}`}
            src={avatarSrc(image)}
            alt="img"
          />
        ))}
        <a
          className={`${group.size} ${STACKED_ITEM} ${group.rounding} ${group.text} bg-[var(--surface)] text-dark dark:text-white`}
          href="#"
        >
          {" "}
          +8{" "}
        </a>
      </div>
    ))}
  </div>
);

const UiAvatar = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Avatar</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PreviewCodeToggle
          title="Circular Avatars"
          contentClassName="preview-content"
          code={imageRowCode(CIRCLE_IMAGES, ["01", "02", "03", "04", "05", "06"])}
        >
          <ImageRow items={CIRCLE_IMAGES} srcs={["01", "02", "03", "04", "05", "06"]} />
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Square Avatars"
          contentClassName="preview-content"
          code={imageRowCode(SQUARE_IMAGES, ["14", "15", "16", "17", "18", "19"])}
        >
          <ImageRow items={SQUARE_IMAGES} srcs={["14", "15", "16", "17", "18", "19"]} />
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Circular Avatars with Placeholder"
          contentClassName={`preview-content ${DASHED_BOX}`}
          code={twoRowCode(
            placeholderRowCode(CIRCLE_PLACEHOLDERS, "primary"),
            placeholderRowCode(CIRCLE_PLACEHOLDERS, "surface"),
          )}
        >
          <div className={PLACEHOLDER_ROW_TOP}>
            <PlaceholderRow items={CIRCLE_PLACEHOLDERS} variant="primary" />
          </div>
          <div className={PLACEHOLDER_ROW}>
            <PlaceholderRow items={CIRCLE_PLACEHOLDERS} variant="surface" />
          </div>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Square Avatars with Placeholder"
          contentClassName={`preview-content ${DASHED_BOX}`}
          code={twoRowCode(
            placeholderRowCode(SQUARE_PLACEHOLDERS, "primary"),
            placeholderRowCode(SQUARE_PLACEHOLDERS, "surface"),
          )}
        >
          <div className={PLACEHOLDER_ROW_TOP}>
            <PlaceholderRow items={SQUARE_PLACEHOLDERS} variant="primary" />
          </div>
          <div className={PLACEHOLDER_ROW}>
            <PlaceholderRow items={SQUARE_PLACEHOLDERS} variant="surface" />
          </div>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Circular Avatars with Placeholder Icons"
          contentClassName={`preview-content ${DASHED_BOX}`}
          code={twoRowCode(
            iconRowCode(CIRCLE_PLACEHOLDERS, "primary"),
            iconRowCode(CIRCLE_PLACEHOLDERS, "surface"),
          )}
        >
          <div className={PLACEHOLDER_ROW_TOP}>
            <IconRow items={CIRCLE_PLACEHOLDERS} variant="primary" />
          </div>
          <div className={PLACEHOLDER_ROW}>
            <IconRow items={CIRCLE_PLACEHOLDERS} variant="surface" />
          </div>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Square Avatars with Placeholder Icons"
          contentClassName={`preview-content ${DASHED_BOX}`}
          code={twoRowCode(
            iconRowCode(SQUARE_PLACEHOLDERS, "primary"),
            iconRowCode(SQUARE_PLACEHOLDERS, "surface"),
          )}
        >
          <div className={PLACEHOLDER_ROW_TOP}>
            <IconRow items={SQUARE_PLACEHOLDERS} variant="primary" />
          </div>
          <div className={PLACEHOLDER_ROW}>
            <IconRow items={SQUARE_PLACEHOLDERS} variant="surface" />
          </div>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Circular Avatar Group"
          contentClassName="preview-content"
          code={stackedRowCode(CIRCLE_STACKS)}
        >
          <StackedRow groups={CIRCLE_STACKS} />
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Square Avatar Group"
          contentClassName="preview-content"
          code={stackedRowCode(SQUARE_STACKS)}
        >
          <StackedRow groups={SQUARE_STACKS} />
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Circular Avatars with Dot"
          contentClassName={`preview-content ${DASHED_BOX}`}
          code={twoRowCode(iconDotRowCode(CIRCLE_ICON_DOTS), imageDotRowCode(CIRCLE_IMAGE_DOTS))}
        >
          <div className={PLACEHOLDER_ROW_TOP}>
            {CIRCLE_ICON_DOTS.map((item) => (
              <span
                key={item.size}
                className={`${item.size} relative ${SURFACE} ${item.rounding} text-dark dark:text-white flex justify-center items-center`}
              >
                <User className="w-4 h-4" aria-hidden="true" />
                <span
                  className={`${item.dot} absolute  bg-success border border-white rounded-full`}
                />
              </span>
            ))}
          </div>
          <div className={PLACEHOLDER_ROW}>
            {CIRCLE_IMAGE_DOTS.map((item) => (
              <span key={item.src} className="relative">
                <ImageWithBasePath
                  className={`${item.size} border border-[var(--border)] ${item.rounding}`}
                  src={avatarSrc(item.src)}
                  alt="avatar"
                />
                <span
                  className={`${item.dot} absolute  bg-success border border-white rounded-full`}
                />
              </span>
            ))}
          </div>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Square Avatars with Dot"
          contentClassName={`preview-content ${DASHED_BOX}`}
          code={twoRowCode(iconDotRowCode(SQUARE_ICON_DOTS), imageDotRowCode(SQUARE_IMAGE_DOTS))}
        >
          <div className={PLACEHOLDER_ROW_TOP}>
            {SQUARE_ICON_DOTS.map((item) => (
              <span
                key={item.size}
                className={`${item.size} relative ${SURFACE} ${item.rounding} text-dark dark:text-white flex justify-center items-center`}
              >
                <User className="w-4 h-4" aria-hidden="true" />
                <span
                  className={`${item.dot} absolute  bg-success border border-white rounded-full`}
                />
              </span>
            ))}
          </div>
          <div className={PLACEHOLDER_ROW}>
            {SQUARE_IMAGE_DOTS.map((item) => (
              <span key={item.src} className="relative">
                <ImageWithBasePath
                  className={`${item.size} border border-[var(--border)] ${item.rounding}`}
                  src={avatarSrc(item.src)}
                  alt="avatar"
                />
                <span
                  className={`${item.dot} absolute  bg-success border border-white rounded-full`}
                />
              </span>
            ))}
          </div>
        </PreviewCodeToggle>
      </div>
      {/* End grid */}
    </div>
  );
};

export default UiAvatar;

import { ChevronRight, ShoppingBag } from "lucide-react";
import ImageWithBasePath from "../../../components/image-with-base-path";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

const CARD = "preview-card bg-[var(--card)] rounded-md border border-[var(--border)] p-5";
const THIRD = `${CARD} xl:col-span-4 sm:col-span-6 col-span-12`;
const HALF = `${CARD} xl:col-span-6 col-span-12`;
const HALF_SM = `${CARD} xl:col-span-6 sm:col-span-6 col-span-12`;
const FULL = `${CARD} col-span-12`;

const BOXED = "preview-content p-5 border border-[var(--border)] rounded-lg";
const CARD_IMAGE = "assets/img/card/card-01.jpg";

const SHORT_TEXT = "Lush green terraces cascade along misty hills ";
const LEAD_TEXT = "Lush green terraces cascade along misty hills, creating a peaceful place landscape";
const PLACE_TEXT = "Lush green terraces cascade along misty hills, creating a peaceful Place.";
const LONG_TEXT =
  "Lush green terraces cascade along misty hills, forming gentle layers that follow the curves of the land and create a calm and quite place.";

const TITLE = "text-lg font-bold c-text mb-0";
const CART_BUTTON =
  "btn-sm flex items-center justify-center gap-1.5 cursor-pointer bg-[var(--card)] border border-[var(--border)] text-dark dark:text-white  hover:bg-primary hover:text-white";
const VIEW_MORE_LIGHT = "underline text-dark dark:text-white hover:c-gold";

/* The horizontal cards differ only in image side and whether padding is inset. */
type HorizontalCardProps = {
  imageFirst: boolean;
  /** Inset variants pad the wrapper; flush variants pad only the text column. */
  inset: boolean;
};

const HorizontalCard = ({ imageFirst, inset }: HorizontalCardProps) => {
  const image = (
    <div className="md:max-w-[180px]">
      <ImageWithBasePath
        className={inset ? "size-full rounded-lg" : "size-full"}
        src={CARD_IMAGE}
        alt="card"
      />
    </div>
  );
  const body = (
    <div className={inset ? undefined : "p-5"}>
      <h5 className="mb-1">Card Title</h5>
      <p className="mb-4">Card Sub Title</p>
      <p className="mb-4">Lush green terraces cascade along misty hills</p>
      <p>Updated 2 days ago</p>
    </div>
  );

  return (
    <div
      className={`${
        inset ? "p-5 " : ""
      }border border-[var(--border)] rounded-lg md:flex block${
        imageFirst ? "" : " md:justify-between"
      } gap-4${inset ? "" : " overflow-hidden"}`}
    >
      {imageFirst ? image : body}
      {imageFirst ? body : image}
    </div>
  );
};

/* The four "<side> Border" cards share a body and vary one border utility. */
const BORDER_SIDES = [
  { title: "Left Border", className: "border-s-3 border-s-primary" },
  { title: "Right Border", className: "border-e-3 border-e-primary" },
  { title: "Bottom Border", className: "border-b-3 border-b-primary" },
  { title: "Top Border", className: "border-t-3 border-t-primary" },
] as const;

/*
   Listings for the regular, data-driven cards. Each is built from the same
   constants the matching preview renders, so the two cannot drift. The bespoke
   layouts (subtitle/button/link cards, horizontal cards, header & footer,
   glassmorphism, tabs, overlay, stretched link) deliberately pass no `code`,
   so those cards show no toggle rather than an inaccurate snippet.
*/
const borderSideCode = (sideClassName: string) =>
  [
    `<div class="p-5 border border-[var(--border)] ${sideClassName} rounded-lg overflow-hidden">`,
    `  <p class="mb-4">${PLACE_TEXT}</p>`,
    `  <button type="button" class="${CART_BUTTON}">`,
    '    <i data-lucide="shopping-bag" class="w-4 h-4"></i>Add to cart',
    "  </button>",
    "</div>",
  ].join("\n");

const colorCardCode = (
  wrapperClassName: string,
  textClassName: string,
  linkClassName: string,
) =>
  [
    `<div class="${wrapperClassName}">`,
    `  <p class="mb-4${textClassName ? ` ${textClassName}` : ""}">${PLACE_TEXT}</p>`,
    `  <a class="${linkClassName}" href="#">View More</a>`,
    "</div>",
  ].join("\n");

const GROUP_WITH_IMAGE_CODE = [
  '<div class="md:flex items-center block">',
  ...["one", "two", "three"].flatMap(() => [
    '  <div class="p-5 border border-[var(--border)] first:rounded-s-lg last:rounded-e-lg rounded-none">',
    '    <div class="mb-4">',
    '      <h5 class="mb-1">Card Title</h5>',
    "      <p>Card Sub Title</p>",
    "    </div>",
    '    <div class="mb-4">',
    `      <ImageWithBasePath class="rounded-lg" src="${CARD_IMAGE}" alt="card">`,
    "    </div>",
    `    <p>${LEAD_TEXT}</p>`,
    "  </div>",
  ]),
  "</div>",
].join("\n");

const GROUP_WITHOUT_IMAGE_CODE = [
  '<div class="md:flex items-center block">',
  ...["one", "two", "three"].flatMap(() => [
    '  <div class="p-5 bg-[var(--card)] border border-[var(--border)] first:rounded-s-lg last:rounded-e-lg rounded-none overflow-hidden">',
    '    <h5 class="mb-1">Card Title</h5>',
    `    <p class="mb-4">${PLACE_TEXT}</p>`,
    '    <a class="underline c-cyan hover:c-gold" href="#">View More</a>',
    "  </div>",
  ]),
  "</div>",
].join("\n");

const UiCards = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Cards</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-12 gap-6">
        <PreviewCodeToggle title="With Subtitle" cardClassName={THIRD} contentClassName={BOXED}>
          <div className="mb-4">
            <h3 className="text-lg font-bold c-text mb-1">Card Title</h3>
            <p>Card Sub Title</p>
          </div>
          <div className="mb-4">
            <ImageWithBasePath className="rounded-lg" src={CARD_IMAGE} alt="card" />
          </div>
          <p>{LEAD_TEXT}</p>
        </PreviewCodeToggle>

        <PreviewCodeToggle title="With Button " cardClassName={THIRD} contentClassName={BOXED}>
          <div className="mb-4">
            <h5 className={TITLE}>Card Title</h5>
          </div>
          <div className="mb-4">
            <ImageWithBasePath
              className="rounded-lg"
              src="assets/img/card/card-02.jpg"
              alt="card"
            />
          </div>
          <p className="mb-4">{SHORT_TEXT}</p>
          <a
            href="#"
            className="btn-sm flex items-center justify-center gap-1.5 cursor-pointer inline-flex bg-[var(--surface)] border border-[var(--border)] text-dark dark:text-white text-center hover:bg-[var(--card2)] hover:text-white"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            Add to cart
          </a>
        </PreviewCodeToggle>

        <PreviewCodeToggle title="With Links" cardClassName={THIRD} contentClassName={BOXED}>
          <div className="mb-4">
            <h5 className={TITLE}>Card Title</h5>
          </div>
          <div className="mb-4">
            <ImageWithBasePath
              className="rounded-lg"
              src="assets/img/card/card-03.jpg"
              alt="card"
            />
          </div>
          <p className="mb-4">{SHORT_TEXT}</p>
          <a href="#" className="inline-fle c-cyan underline text-center hover:c-gold">
            View More
          </a>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Horizontal Right Align Content"
          cardClassName={HALF}
          contentClassName="preview-content"
        >
          <HorizontalCard imageFirst inset />
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Horizontal Left Align Content"
          cardClassName={HALF}
          contentClassName="preview-content"
        >
          <HorizontalCard imageFirst={false} inset />
        </PreviewCodeToggle>

        <PreviewCodeToggle title="Left Align" cardClassName={THIRD} contentClassName={BOXED}>
          <div className="mb-4">
            <h5 className="mb-1">Card Title</h5>
          </div>
          <div className="mb-4">
            <ImageWithBasePath className="rounded-lg" src={CARD_IMAGE} alt="card" />
          </div>
          <p>{SHORT_TEXT}</p>
        </PreviewCodeToggle>

        <PreviewCodeToggle title="Centre Align" cardClassName={THIRD} contentClassName={BOXED}>
          <div className="mb-4 text-center">
            <h5 className={TITLE}>Card Title</h5>
          </div>
          <div className="mb-4 flex justify-center items-center">
            <ImageWithBasePath className="rounded-lg" src={CARD_IMAGE} alt="card" />
          </div>
          <p className="text-center">{SHORT_TEXT}</p>
        </PreviewCodeToggle>

        <PreviewCodeToggle title="Right Align" cardClassName={THIRD} contentClassName={BOXED}>
          <div className="mb-4 text-end">
            <h5 className={TITLE}>Card Title</h5>
          </div>
          <div className="mb-4 flex justify-end items-end">
            <ImageWithBasePath className="rounded-lg" src={CARD_IMAGE} alt="card" />
          </div>
          <p className="text-end">{SHORT_TEXT}</p>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Horizontal Right Align Content"
          cardClassName={HALF}
          contentClassName="preview-content"
        >
          <HorizontalCard imageFirst inset={false} />
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Horizontal Left Align Content"
          cardClassName={HALF}
          contentClassName="preview-content"
        >
          <HorizontalCard imageFirst={false} inset={false} />
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="With Header"
          cardClassName={THIRD}
          contentClassName="preview-content border border-[var(--border)] rounded-lg overflow-hidden"
        >
          <div className="px-5 py-4 bg-[var(--surface)] border-b border-[var(--border)]">
            <h5 className={TITLE}>Card Title</h5>
          </div>
          <div className="p-5">
            <p>{LONG_TEXT}</p>
          </div>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="With Footer"
          cardClassName={THIRD}
          contentClassName="preview-content border border-[var(--border)] rounded-lg overflow-hidden"
        >
          <div className="p-5">
            <p>{LONG_TEXT}</p>
          </div>
          <div className="px-5 py-4 bg-[var(--surface)] border-t border-[var(--border)]">
            <h5 className={TITLE}>Card Title</h5>
          </div>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Header & Footer"
          cardClassName={THIRD}
          contentClassName="preview-content border border-[var(--border)] rounded-lg overflow-hidden"
        >
          <div className="px-5 py-4 bg-[var(--surface)] border-b border-[var(--border)]">
            <h5 className={TITLE}>Card Title</h5>
          </div>
          <div className="p-5">
            <p>Lush green terraces cascade along misty hills. </p>
          </div>
          <div className="px-5 py-4 bg-[var(--surface)] border-t border-[var(--border)]">
            <h5 className={TITLE}>Card Title</h5>
          </div>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Primary Color"
          cardClassName={THIRD}
          contentClassName="preview-content p-5 bg-primary border border-[var(--border)] rounded-lg overflow-hidden"
          code={colorCardCode(
            "p-5 bg-primary border border-[var(--border)] rounded-lg overflow-hidden",
            "text-white",
            "underline text-white",
          )}
        >
          <p className="mb-4 text-white">{PLACE_TEXT}</p>
          <a className="underline text-white" href="#">
            View More
          </a>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Light Color"
          cardClassName={THIRD}
          contentClassName="preview-content p-5 bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden"
          code={colorCardCode(
            "p-5 bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden",
            "",
            VIEW_MORE_LIGHT,
          )}
        >
          <p className="mb-4">{PLACE_TEXT}</p>
          <a className={VIEW_MORE_LIGHT} href="#">
            View More
          </a>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Dark Color"
          cardClassName={THIRD}
          contentClassName="preview-content p-5 bg-dark border border-[var(--border)] rounded-lg overflow-hidden"
          code={colorCardCode(
            "p-5 bg-dark border border-[var(--border)] rounded-lg overflow-hidden",
            "text-white ",
            "underline text-white hover:c-gold",
          )}
        >
          <p className="mb-4 text-white ">{PLACE_TEXT}</p>
          <a className="underline text-white hover:c-gold" href="#">
            View More
          </a>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Border"
          cardClassName={THIRD}
          contentClassName="preview-content p-5 bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden"
          code={colorCardCode(
            "p-5 bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden",
            "",
            VIEW_MORE_LIGHT,
          )}
        >
          <p className="mb-4">{PLACE_TEXT}</p>
          <a className={VIEW_MORE_LIGHT} href="#">
            View More
          </a>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Dotted Border"
          cardClassName={THIRD}
          contentClassName="preview-content p-5 border border-dashed border-[var(--border)] rounded-lg overflow-hidden"
          code={colorCardCode(
            "p-5 border border-dashed border-[var(--border)] rounded-lg overflow-hidden",
            "",
            VIEW_MORE_LIGHT,
          )}
        >
          <p className="mb-4">{PLACE_TEXT}</p>
          <a className={VIEW_MORE_LIGHT} href="#">
            View More
          </a>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Color Border"
          cardClassName={THIRD}
          contentClassName="preview-content p-5 border border-primary rounded-lg overflow-hidden"
          code={colorCardCode(
            "p-5 border border-primary rounded-lg overflow-hidden",
            "",
            VIEW_MORE_LIGHT,
          )}
        >
          <p className="mb-4">{PLACE_TEXT}</p>
          <a className={VIEW_MORE_LIGHT} href="#">
            View More
          </a>
        </PreviewCodeToggle>

        {BORDER_SIDES.map((side) => (
          <PreviewCodeToggle
            key={side.title}
            title={side.title}
            cardClassName={HALF_SM}
            contentClassName={`preview-content p-5 border border-[var(--border)] ${side.className} rounded-lg overflow-hidden`}
            code={borderSideCode(side.className)}
          >
            <p className="mb-4">{PLACE_TEXT}</p>
            <button type="button" className={CART_BUTTON}>
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              Add to cart
            </button>
          </PreviewCodeToggle>
        ))}

        <PreviewCodeToggle
          title="Glassmorphism"
          cardClassName={THIRD}
          contentClassName="preview-content rounded-lg relative overflow-hidden"
        >
          <ImageWithBasePath className="rounded-lg" src={CARD_IMAGE} alt="card" />
          <div className="absolute bottom-0 px-5 py-4 w-full backdrop-blur-[10px]">
            <p className="text-white">{LEAD_TEXT}</p>
          </div>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Tabs"
          cardClassName={THIRD}
          contentClassName="preview-content border border-[var(--border)] rounded-lg overflow-hidden"
        >
          <div className="flex items-center gap-2 px-5 py-4 bg-[var(--surface)] border-b border-[var(--border)]">
            <a className="c-gold font-medium" href="#">
              Active
            </a>
            <a className="text-dark dark:text-white font-medium" href="#">
              Link
            </a>
            <a className="font-medium" href="#">
              Disabled
            </a>
          </div>
          <div className="p-5">
            <p className="text-dark dark:text-white font-semibold mb-1">Card Title</p>
            <p className="text-[13px]">{LONG_TEXT}</p>
          </div>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Image Overlay"
          cardClassName={THIRD}
          contentClassName="preview-content rounded-lg relative"
        >
          <ImageWithBasePath className="rounded-lg" src={CARD_IMAGE} alt="card" />
          <div className="absolute bottom-0 px-5 py-4 w-full">
            <p className="text-white">{LEAD_TEXT}</p>
          </div>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Card Group with Image"
          cardClassName={FULL}
          contentClassName="preview-content"
          code={GROUP_WITH_IMAGE_CODE}
        >
          <div className="md:flex items-center block">
            {["one", "two", "three"].map((key) => (
              <div
                key={key}
                className="p-5 border border-[var(--border)] first:rounded-s-lg last:rounded-e-lg rounded-none"
              >
                <div className="mb-4">
                  <h5 className="mb-1">Card Title</h5>
                  <p>Card Sub Title</p>
                </div>
                <div className="mb-4">
                  <ImageWithBasePath className="rounded-lg" src={CARD_IMAGE} alt="card" />
                </div>
                <p>{LEAD_TEXT}</p>
              </div>
            ))}
          </div>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Card Group without  Image"
          cardClassName={FULL}
          contentClassName="preview-content"
          code={GROUP_WITHOUT_IMAGE_CODE}
        >
          <div className="md:flex items-center block">
            {["one", "two", "three"].map((key) => (
              <div
                key={key}
                className="p-5 bg-[var(--card)] border border-[var(--border)] first:rounded-s-lg last:rounded-e-lg rounded-none overflow-hidden"
              >
                <h5 className="mb-1">Card Title</h5>
                <p className="mb-4">{PLACE_TEXT}</p>
                <a className="underline c-cyan hover:c-gold" href="#">
                  View More
                </a>
              </div>
            ))}
          </div>
        </PreviewCodeToggle>

        <PreviewCodeToggle
          title="Streched Link"
          cardClassName={FULL}
          contentClassName="preview-content"
        >
          <div className="md:flex block gap-6">
            <div className="preview-content border border-[var(--border)] rounded-lg overflow-hidden">
              <ImageWithBasePath src={CARD_IMAGE} alt="card" />
              <div className="p-5">
                <h5 className="mb-1">Card Title</h5>
                <p>{LEAD_TEXT}</p>
              </div>
            </div>
            <div className="preview-content border border-[var(--border)] rounded-lg overflow-hidden">
              <ImageWithBasePath src={CARD_IMAGE} alt="card" />
              <div className="p-5">
                <p className="mb-2.5">{LEAD_TEXT}</p>
                <button
                  type="button"
                  className="btn-sm flex items-center justify-center gap-1.5 cursor-pointer bg-[var(--surface)] font-semibold border border-[var(--border)] text-dark dark:text-white text-center hover:bg-primary-hover hover:text-white dark:hover:text-white!"
                >
                  Go Somewhere <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="preview-content border border-[var(--border)] rounded-lg overflow-hidden">
              <ImageWithBasePath src={CARD_IMAGE} alt="card" />
              <div className="p-5">
                <p className="mb-2.5">{LEAD_TEXT}</p>
                <a className="underline c-cyan hover:c-gold" href="#">
                  View More
                </a>
              </div>
            </div>
          </div>
        </PreviewCodeToggle>
      </div>
      {/* End grid */}
    </div>
  );
};

export default UiCards;

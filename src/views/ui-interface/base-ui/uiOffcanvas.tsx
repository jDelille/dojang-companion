import { X } from "lucide-react";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

/* Preline `hs-overlay` markup carries over verbatim — Preline is initialised
   globally, so the panels are driven by data-hs-overlay, not React state. */

type OffcanvasTrigger = {
  id: string;
  label: string;
  asLink?: boolean;
};

type OffcanvasPanel = {
  id: string;
  title: string;
  panelClassName: string;
  titleClassName: string;
  bodyClassName: string;
  /** The dark panel repeats the placeholder paragraph twice. */
  paragraphs: number;
  headingTag: "h4" | "h5";
};

const CLOSE_BTN_CLASS =
  "size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-[var(--border)] bg-[var(--card)] hover:bg-danger c-red hover:text-white focus:outline-hidden focus:bg-gray-200 dark:hover:text-white";

const TRIGGER_CLASS = "btn-sm text-white bg-primary inline-flex items-center";

const PLACEHOLDER =
  "Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.";

const defaultTriggers: OffcanvasTrigger[] = [
  { id: "offcanvas-link", label: "Link with href", asLink: true },
  { id: "offcanvas-button", label: "Button with Offcanvas" },
  { id: "offcanvas-dark", label: "Dark Offcanvas" },
];

const positionTriggers: OffcanvasTrigger[] = [
  { id: "offcanvas-right", label: "Toggle right offcanvas" },
  { id: "offcanvas-left", label: "Toggle left offcanvas" },
  { id: "offcanvas-top", label: "Toggle top offcanvas" },
  { id: "offcanvas-bottom", label: "Toggle bottom offcanvas" },
];

const panels: OffcanvasPanel[] = [
  {
    id: "offcanvas-link",
    title: "Link With Offcanvas",
    panelClassName:
      "hs-overlay hs-overlay-open:translate-x-0 hidden translate-x-full fixed top-0 end-0 transition-all duration-300 transform h-full max-w-xs w-full z-80 bg-[var(--card)]",
    titleClassName: "font-bold text-dark dark:text-white",
    bodyClassName: "p-4",
    paragraphs: 1,
    headingTag: "h5",
  },
  {
    id: "offcanvas-button",
    title: "Button Offcanvas",
    panelClassName:
      "hs-overlay hs-overlay-open:translate-x-0 hidden -translate-x-full fixed top-0 start-0 transition-all duration-300 transform h-full max-w-xs w-full z-80 bg-[var(--card)] border-s border-[var(--border)]",
    titleClassName: "font-bold text-dark dark:text-white",
    bodyClassName: "p-4",
    paragraphs: 1,
    headingTag: "h5",
  },
  {
    id: "offcanvas-dark",
    title: "Dark Offcanvas",
    panelClassName:
      "hs-overlay bg-dark hs-overlay-open:translate-x-0 hidden -translate-x-full fixed top-0 start-0 transition-all duration-300 transform h-full max-w-xs w-full z-80 border-s border-dark",
    titleClassName: "font-bold text-white",
    bodyClassName: "p-4 text-white",
    paragraphs: 2,
    headingTag: "h4",
  },
  {
    id: "offcanvas-top",
    title: "Top Offcanvas",
    panelClassName:
      "hs-overlay hs-overlay-open:translate-y-0 -translate-y-full fixed top-0 inset-x-0 transition-all duration-300 transform z-80 bg-[var(--card)] border-b border-[var(--border)] hidden",
    titleClassName: "font-bold text-dark dark:text-white",
    bodyClassName: "p-4",
    paragraphs: 2,
    headingTag: "h5",
  },
  {
    id: "offcanvas-left",
    title: "Left Offcanvas",
    panelClassName:
      "hs-overlay hs-overlay-open:translate-x-0 hidden -translate-x-full fixed top-0 start-0 transition-all duration-300 transform h-full max-w-xs w-full z-80 bg-[var(--card)] border-s border-[var(--border)]",
    titleClassName: "font-bold text-dark dark:text-white",
    bodyClassName: "p-4",
    paragraphs: 1,
    headingTag: "h4",
  },
  {
    id: "offcanvas-bottom",
    title: "Bottom Offcanvas",
    panelClassName:
      "hs-overlay hs-overlay-open:translate-y-0 translate-y-full fixed bottom-0 inset-x-0 transition-all duration-300 transform z-80 bg-[var(--card)] hidden",
    titleClassName: "font-bold text-dark dark:text-white",
    bodyClassName: "p-4",
    paragraphs: 1,
    headingTag: "h5",
  },
  {
    id: "offcanvas-right",
    title: "Right Offcanvas",
    panelClassName:
      "hs-overlay hs-overlay-open:translate-x-0 hidden translate-x-full fixed top-0 end-0 transition-all duration-300 transform h-full max-w-xs w-full z-80 bg-[var(--card)]",
    titleClassName: "font-bold text-dark dark:text-white",
    bodyClassName: "p-4",
    paragraphs: 1,
    headingTag: "h5",
  },
];

const OffcanvasTriggers = ({ triggers }: { triggers: OffcanvasTrigger[] }) => (
  <>
    {triggers.map((trigger) =>
      trigger.asLink ? (
        <a
          key={trigger.id}
          href="#"
          className={TRIGGER_CLASS}
          aria-haspopup="dialog"
          aria-expanded="false"
          aria-controls={trigger.id}
          data-hs-overlay={`#${trigger.id}`}
        >
          {trigger.label}
        </a>
      ) : (
        <button
          key={trigger.id}
          type="button"
          className={TRIGGER_CLASS}
          aria-haspopup="dialog"
          aria-expanded="false"
          aria-controls={trigger.id}
          data-hs-overlay={`#${trigger.id}`}
        >
          {trigger.label}
        </button>
      )
    )}
  </>
);

const OffcanvasPanels = () => (
  <>
    {panels.map((panel) => {
      const Heading = panel.headingTag;
      const labelId = `hs-${panel.id}-label`;

      return (
        <div
          key={panel.id}
          id={panel.id}
          className={panel.panelClassName}
          role="dialog"
          tabIndex={-1}
          aria-labelledby={labelId}
        >
          <div className="flex justify-between items-center py-3 px-4 border-b border-[var(--border)]">
            <h4 id={labelId} className={panel.titleClassName}>
              {panel.title}
            </h4>
            <button
              type="button"
              className={CLOSE_BTN_CLASS}
              aria-label="Close"
              data-hs-overlay={`#${panel.id}`}
            >
              <span className="sr-only">Close</span>
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className={panel.bodyClassName}>
            <Heading className="text-lg max-lg:text-[16px] mb-1">Title</Heading>
            {Array.from({ length: panel.paragraphs }, (_, index) => (
              <p key={index}>{PLACEHOLDER}</p>
            ))}
          </div>
        </div>
      );
    })}
  </>
);

const UiOffcanvas = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Offcanvas</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-1 gap-6">
        <PreviewCodeToggle
          title="Default Offcanvas"
          contentClassName="flex flex-wrap items-center gap-6"
          codeMaxHeightClassName="max-h-[350px]"
          code={`<div class="flex items-center gap-6">
	<a href="#" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="offcanvas-link" data-hs-overlay="#offcanvas-link">
		Link with href
	</a>
	<button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="offcanvas-button" data-hs-overlay="#offcanvas-button">
		Button with Offcanvas
	</button>
	<button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="offcanvas-dark" data-hs-overlay="#offcanvas-dark">
		Dark Offcanvas
	</button>
</div>

<!-- Link with Offcanvas start -->
<div id="offcanvas-link" class="hs-overlay hs-overlay-open:translate-x-0 hidden translate-x-full fixed top-0 end-0 transition-all duration-300 transform h-full max-w-xs w-full z-80 bg-[var(--card)]" role="dialog" tabindex="-1">
	<div class="flex justify-between items-center py-3 px-4 border-b border-[var(--border)]">
		<h3 class="font-semibold text-dark dark:text-white">
			Link With Offcanvas
		</h3>
		<button type="button" class="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-[var(--border)] bg-[var(--card)] hover:bg-danger c-red hover:text-white focus:outline-hidden focus:bg-gray-200" aria-label="Close" data-hs-overlay="#offcanvas-link">
			<span class="sr-only">Close</span>
			<i class="icon-x"></i>
		</button>
	</div>
	<div class="p-4">
		<h5 class="mb-1">Title</h5>
		<p>
			Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.
		</p>
	</div>
</div>
<!-- Link with Offcanvas end -->

<!-- Button Offcanvas start -->
<div id="offcanvas-button" class="hs-overlay hs-overlay-open:translate-x-0 hidden -translate-x-full fixed top-0 start-0 transition-all duration-300 transform h-full max-w-xs w-full z-80 bg-[var(--card)] border-s border-[var(--border)]" role="dialog" tabindex="-1">
	<div class="flex justify-between items-center py-3 px-4 border-b border-[var(--border)]">
		<h3 class="font-bold text-dark dark:text-white">
			Button Offcanvas
		</h3>
		<button type="button" class="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-[var(--border)] bg-[var(--card)] hover:bg-danger c-red hover:text-white focus:outline-hidden focus:bg-gray-200" aria-label="Close" data-hs-overlay="#offcanvas-button">
			<span class="sr-only">Close</span>
			<i class="icon-x"></i>
		</button>
	</div>
	<div class="p-4">
		<h5 class="mb-1">Title</h5>
		<p>
			Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.
		</p>
	</div>
</div>
<!-- Button Offcanvas end -->

<!-- Dark Offcanvas start -->
<div id="offcanvas-dark" class="hs-overlay bg-dark hs-overlay-open:translate-x-0 hidden -translate-x-full fixed top-0 start-0 transition-all duration-300 transform h-full max-w-xs w-full z-80 border-s border-dark" role="dialog" tabindex="-1" aria-labelledby="hs-offcanvas-dark-label">
	<div class="flex justify-between items-center py-3 px-4 border-b border-dark">
		<h3 id="hs-offcanvas-dark-label" class="font-semibold text-white">
			Dark Offcanvas
		</h3>
		<button type="button" class="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-[var(--border)] bg-[var(--card)] hover:bg-danger c-red hover:text-white focus:outline-hidden focus:bg-gray-200" aria-label="Close" data-hs-overlay="#offcanvas-dark">
			<span class="sr-only">Close</span>
			<i class="icon-x"></i>
		</button>
	</div>
	<div class="p-4 text-white">
		<h5 class="mb-1">Title</h5>
		<p>
			Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.
		</p>
		<p>
			Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.
		</p>
	</div>
</div>
<!-- Dark Offcanvas end -->`}
        >
          <OffcanvasTriggers triggers={defaultTriggers} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Positions Offcanvas"
          contentClassName="flex flex-wrap items-center gap-6"
          codeMaxHeightClassName="max-h-[350px]"
          code={`<div class="flex items-center gap-6">
	<button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="offcanvas-right" data-hs-overlay="#offcanvas-right">
		Toggle right offcanvas
	</button>
	<button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="offcanvas-left" data-hs-overlay="#offcanvas-left">
		Toggle left offcanvas
	</button>
	<button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="offcanvas-top" data-hs-overlay="#offcanvas-top">
		Toggle top offcanvas
	</button>
	<button type="button" class="btn-sm text-white bg-primary inline-flex items-center" aria-haspopup="dialog" aria-expanded="false" aria-controls="offcanvas-bottom" data-hs-overlay="#offcanvas-bottom">
		Toggle bottom offcanvas
	</button>
</div>

<!-- Top Offcanvas start -->
<div id="offcanvas-top" class="hs-overlay hs-overlay-open:translate-y-0 -translate-y-full fixed top-0 inset-x-0 transition-all duration-300 transform z-80 bg-[var(--card)] border-b border-[var(--border)] hidden" role="dialog" tabindex="-1" aria-labelledby="hs-offcanvas-top-label">
	<div class="flex justify-between items-center py-3 px-4 border-b border-[var(--border)]">
		<h3 id="hs-offcanvas-top-label" class="font-semibold text-dark dark:text-white">
			Top Offcanvas
		</h3>
		<button type="button" class="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-[var(--border)] bg-[var(--card)] hover:bg-danger c-red hover:text-white focus:outline-hidden focus:bg-gray-200" aria-label="Close" data-hs-overlay="#offcanvas-top">
			<span class="sr-only">Close</span>
			<i class="icon-x"></i>
		</button>
	</div>
	<div class="p-4">
		<h5 class="mb-1">Title</h5>
		<p>
			Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.
		</p>
		<p>
			Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.
		</p>
	</div>
</div>
<!-- Top Offcanvas end -->

<!-- Left Offcanvas start -->
<div id="offcanvas-left" class="hs-overlay hs-overlay-open:translate-x-0 hidden -translate-x-full fixed top-0 start-0 transition-all duration-300 transform h-full max-w-xs w-full z-80 bg-[var(--card)] border-s border-[var(--border)]" role="dialog" tabindex="-1">
	<div class="flex justify-between items-center py-3 px-4 border-b border-[var(--border)]">
		<h3 class="font-bold text-dark dark:text-white">
			Left Offcanvas
		</h3>
		<button type="button" class="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-[var(--border)] bg-[var(--card)] hover:bg-danger c-red hover:text-white focus:outline-hidden focus:bg-gray-200" aria-label="Close" data-hs-overlay="#offcanvas-left">
			<span class="sr-only">Close</span>
			<i class="icon-x"></i>
		</button>
	</div>
	<div class="p-4">
		<h5 class="mb-1">Title</h5>
		<p>
			Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.
		</p>
	</div>
</div>
<!-- Left Offcanvas end -->

<!-- Bottom Offcanvas start -->
<div id="offcanvas-bottom" class="hs-overlay hs-overlay-open:translate-y-0 translate-y-full fixed bottom-0 inset-x-0 transition-all duration-300 transform z-80 bg-[var(--card)] hidden" role="dialog" tabindex="-1" aria-labelledby="hs-offcanvas-bottom-label">
	<div class="flex justify-between items-center py-3 px-4 border-b border-[var(--border)]">
		<h3 id="hs-offcanvas-bottom-label" class="font-semibold text-dark dark:text-white">
			Bottom Offcanvas
		</h3>
		<button type="button" class="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-[var(--border)] bg-[var(--card)] hover:bg-danger c-red hover:text-white focus:outline-hidden focus:bg-gray-200" aria-label="Close" data-hs-overlay="#offcanvas-bottom">
			<span class="sr-only">Close</span>
			<i class="icon-x"></i>
		</button>
	</div>
	<div class="p-4">
		<h5 class="mb-1">Title</h5>
		<p>
			Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.
		</p>
	</div>
</div>
<!-- Bottom Offcanvas end -->

<!-- Right Offcanvas start -->
<div id="offcanvas-right" class="hs-overlay hs-overlay-open:translate-x-0 hidden translate-x-full fixed top-0 end-0 transition-all duration-300 transform h-full max-w-xs w-full z-80 bg-[var(--card)]" role="dialog" tabindex="-1">
	<div class="flex justify-between items-center py-3 px-4 border-b border-[var(--border)]">
		<h3 class="font-semibold text-dark dark:text-white">
			Right Offcanvas
		</h3>
		<button type="button" class="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-[var(--border)] bg-[var(--card)] hover:bg-danger c-red hover:text-white focus:outline-hidden focus:bg-gray-200" aria-label="Close" data-hs-overlay="#offcanvas-right">
			<span class="sr-only">Close</span>
			<i class="icon-x"></i>
		</button>
	</div>
	<div class="p-4">
		<h5 class="mb-1">Title</h5>
		<p>
			Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.
		</p>
	</div>
</div>
<!-- Right Offcanvas end -->`}
        >
          <OffcanvasTriggers triggers={positionTriggers} />
        </PreviewCodeToggle>
        {/* end card */}
      </div>
      {/* End grid */}

      <OffcanvasPanels />
    </div>
  );
};

export default UiOffcanvas;

import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

/* Preline `hs-tooltip` markup carries over verbatim — it is initialised globally. */

type Popover = {
  label: string;
  title: string;
  body: string;
  /** e.g. "[--trigger:focus] [--placement:top]" */
  wrapperClassName: string;
  buttonClassName: string;
  contentClassName: string;
  headerClassName: string;
  titleClassName: string;
  hasArrow?: boolean;
  disabled?: boolean;
};

const DEFAULT_CONTENT =
  "hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible absolute z-10 invisible inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm opacity-0";

const DEFAULT_HEADER =
  "px-3 py-2 bg-[var(--card)] border-b border-[var(--border)] rounded-t-lg";

const OUTLINE_BTN =
  "btn hs-tooltip-toggle bg-transparent border border-primary c-gold text-center hover:bg-primary-100 focus:bg-primary-100";

const AMAZING_CONTENT = "And here's some amazing content. It's very engaging. Right?";

const directionPopovers: Popover[] = [
  {
    label: "Popover Top",
    title: "Popover Top",
    body: AMAZING_CONTENT,
    wrapperClassName: "hs-tooltip [--trigger:focus] [--placement:top]",
    buttonClassName: OUTLINE_BTN,
    contentClassName: DEFAULT_CONTENT,
    headerClassName: DEFAULT_HEADER,
    titleClassName: "font-semibold c-text",
  },
  {
    label: "Popover Bottom",
    title: "Popover Bottom",
    body: AMAZING_CONTENT,
    wrapperClassName: "hs-tooltip [--trigger:focus] [--placement:bottom]",
    buttonClassName: OUTLINE_BTN,
    contentClassName: DEFAULT_CONTENT,
    headerClassName: DEFAULT_HEADER,
    titleClassName: "font-semibold c-text",
    hasArrow: true,
  },
  {
    label: "Popover Right",
    title: "Popover Right",
    body: AMAZING_CONTENT,
    wrapperClassName: "hs-tooltip [--trigger:focus] [--placement:right]",
    buttonClassName: OUTLINE_BTN,
    contentClassName: DEFAULT_CONTENT,
    headerClassName: DEFAULT_HEADER,
    titleClassName: "font-semibold c-text",
    hasArrow: true,
  },
  {
    label: "Popover Left",
    title: "Popover Left",
    body: AMAZING_CONTENT,
    wrapperClassName: "hs-tooltip [--trigger:focus] [--placement:left]",
    buttonClassName: OUTLINE_BTN,
    contentClassName: DEFAULT_CONTENT,
    headerClassName: DEFAULT_HEADER,
    titleClassName: "font-semibold c-text",
    hasArrow: true,
  },
];

const togglePopovers: Popover[] = [
  {
    label: "Click to toggle popover",
    title: "Popover Title",
    body: AMAZING_CONTENT,
    wrapperClassName: "hs-tooltip [--trigger:focus]",
    buttonClassName:
      "btn hs-tooltip-toggle bg-primary border border-primary text-white text-center hover:bg-primary-900 hover:text-white focus:bg-primary-900",
    contentClassName: DEFAULT_CONTENT,
    headerClassName: DEFAULT_HEADER,
    titleClassName: "font-semibold c-text",
  },
  {
    label: "On Hover Tooltip",
    title: "Popover Title",
    body: AMAZING_CONTENT,
    wrapperClassName: "hs-tooltip [--trigger:hover]",
    buttonClassName:
      "btn hs-tooltip-toggle bg-primary border border-primary text-white text-center hover:bg-primary-900 hover:text-white",
    contentClassName: DEFAULT_CONTENT,
    headerClassName: DEFAULT_HEADER,
    titleClassName: "font-semibold c-text",
  },
];

const coloredVariants: { name: string; label: string }[] = [
  { name: "primary", label: "Primary" },
  { name: "info", label: "Info" },
  { name: "warning", label: "Warning" },
  { name: "success", label: "Success" },
  { name: "danger", label: "Danger" },
];

/* Full class strings per variant — Tailwind only emits classes it can find
   literally, so `bg-${name}` would not be generated. */
const coloredClasses: Record<string, { button: string; content: string; header: string }> = {
  primary: {
    button: "btn hs-tooltip-toggle bg-primary text-white text-center hover:bg-primary-900 hover:text-white",
    content:
      "hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible absolute z-10 invisible inline-block w-64 text-sm text-white transition-opacity duration-300 bg-primary border border-primary rounded-lg shadow-sm opacity-0",
    header: "px-3 py-2 bg-primary border-b border-white dark:border-dark rounded-t-lg",
  },
  info: {
    button: "btn hs-tooltip-toggle bg-info text-white text-center hover:bg-info-900 hover:text-white",
    content:
      "hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible absolute z-10 invisible inline-block w-64 text-sm text-white transition-opacity duration-300 bg-info border border-info rounded-lg shadow-sm opacity-0",
    header: "px-3 py-2 bg-info border-b border-white dark:border-dark rounded-t-lg",
  },
  warning: {
    button: "btn hs-tooltip-toggle bg-warning text-white text-center hover:bg-warning-900 hover:text-white",
    content:
      "hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible absolute z-10 invisible inline-block w-64 text-sm text-white transition-opacity duration-300 bg-warning border border-warning rounded-lg shadow-sm opacity-0",
    header: "px-3 py-2 bg-warning border-b border-white dark:border-dark rounded-t-lg",
  },
  success: {
    button: "btn hs-tooltip-toggle bg-success text-white text-center hover:bg-success-900 hover:text-white",
    content:
      "hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible absolute z-10 invisible inline-block w-64 text-sm text-white transition-opacity duration-300 bg-success border border-success rounded-lg shadow-sm opacity-0",
    header: "px-3 py-2 bg-success border-b border-white dark:border-dark rounded-t-lg",
  },
  danger: {
    button: "btn hs-tooltip-toggle bg-danger text-white text-center hover:bg-danger-900 hover:text-white",
    content:
      "hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible absolute z-10 invisible inline-block w-64 text-sm text-white transition-opacity duration-300 bg-danger border border-danger rounded-lg shadow-sm opacity-0",
    header: "px-3 py-2 bg-danger border-b border-white dark:border-dark rounded-t-lg",
  },
};

const coloredPopovers: Popover[] = coloredVariants.map(({ name, label }) => ({
  label,
  title: `${label} Background`,
  body: `Popover with ${name} background.`,
  wrapperClassName: "hs-tooltip [--trigger:focus]",
  buttonClassName: coloredClasses[name].button,
  contentClassName: coloredClasses[name].content,
  headerClassName: coloredClasses[name].header,
  titleClassName: "font-semibold text-white",
}));

const disabledPopovers: Popover[] = [
  {
    label: "Disabled Button",
    title: "Disabled Popover",
    body: "This popover button is disabled.",
    wrapperClassName: "hs-tooltip [--trigger:focus]",
    buttonClassName:
      "btn hs-tooltip-toggle bg-primary border border-primary text-white text-center hover:bg-primary-900 hover:text-white cursor-not-allowed",
    contentClassName:
      "hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible absolute z-10 invisible inline-block w-64 text-sm text-white transition-opacity duration-300 bg-primary border border-primary rounded-lg shadow-sm opacity-0",
    headerClassName: "px-3 py-2 bg-primary border-b border-[var(--border)] rounded-t-lg",
    titleClassName: "font-semibold text-white",
    disabled: true,
  },
];

const PopoverList = ({ popovers }: { popovers: Popover[] }) => (
  <>
    {popovers.map((popover) => (
      <div key={popover.label} className={popover.wrapperClassName}>
        <button type="button" className={popover.buttonClassName} disabled={popover.disabled}>
          {popover.label}
        </button>
        <div className={popover.contentClassName}>
          <div className={popover.headerClassName}>
            <h5 className={popover.titleClassName}>{popover.title}</h5>
          </div>
          <div className="px-3 py-2">
            <p>{popover.body}</p>
          </div>
          {popover.hasArrow && <div data-popper-arrow />}
        </div>
      </div>
    ))}
  </>
);

const UiPopovers = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Popovers</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-12 gap-6">
        <PreviewCodeToggle
          title="Four Directions"
          cardClassName="md:col-span-6 col-span-12"
          contentClassName="flex flex-wrap justify-center sm:justify-start gap-2"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="flex flex-wrap justify-center sm:justify-start gap-2">

<div class="hs-tooltip [--trigger:focus] [--placement:top]">
	<button type="button"
	class="btn hs-tooltip-toggle bg-transparent border border-primary c-gold hover:bg-primary-100 focus:bg-primary-100">
	Popover Top
	</button>

	<div class="hs-tooltip-content absolute z-10 invisible opacity-0 inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm hs-tooltip-shown:visible hs-tooltip-shown:opacity-100">
	<div class="px-3 py-2 border-b border-[var(--border)] rounded-t-lg">
		<h5 class="font-semibold c-text">Popover Top</h5>
	</div>
	<div class="px-3 py-2">
		<p>And here's some amazing content. It's very engaging. Right?</p>
	</div>
	</div>
</div>

<div class="hs-tooltip [--trigger:focus] [--placement:bottom]">
	<button type="button"
	class="btn hs-tooltip-toggle bg-transparent border border-primary c-gold hover:bg-primary-100 focus:bg-primary-100">
	Popover Bottom
	</button>

	<div class="hs-tooltip-content absolute z-10 invisible opacity-0 inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm hs-tooltip-shown:visible hs-tooltip-shown:opacity-100">
	<div class="px-3 py-2 border-b border-[var(--border)] rounded-t-lg">
		<h5 class="font-semibold c-text">Popover Bottom</h5>
	</div>
	<div class="px-3 py-2">
		<p>And here's some amazing content. It's very engaging. Right?</p>
	</div>
	<div data-popper-arrow></div>
	</div>
</div>

</div>`}
        >
          <PopoverList popovers={directionPopovers} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Hover and Click Toggle"
          cardClassName="md:col-span-6 col-span-12"
          contentClassName="flex flex-wrap justify-center sm:justify-start gap-2"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="flex flex-wrap justify-center sm:justify-start gap-2">

	<div class="hs-tooltip [--trigger:focus]">
		<button type="button" class="btn hs-tooltip-toggle bg-primary border border-primary text-white hover:bg-primary-900 focus:bg-primary-900">
		Click to toggle popover
		</button>
		<div class="hs-tooltip-content absolute z-10 invisible opacity-0 inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm hs-tooltip-shown:visible hs-tooltip-shown:opacity-100">
			<div class="px-3 py-2 border-b border-[var(--border)] rounded-t-lg">
				<h5 class="font-semibold c-text">Popover Title</h5>
			</div>
			<div class="px-3 py-2">
				<p>And here's some amazing content. It's very engaging. Right?</p>
			</div>
		</div>
	</div>

	<div class="hs-tooltip [--trigger:hover]">
		<button type="button" class="btn hs-tooltip-toggle bg-primary border border-primary text-white hover:bg-primary-900">
		On Hover Tooltip
		</button>
		<div class="hs-tooltip-content absolute z-10 invisible opacity-0 inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm hs-tooltip-shown:visible hs-tooltip-shown:opacity-100">
			<div class="px-3 py-2 border-b border-[var(--border)] rounded-t-lg">
				<h5 class="font-semibold c-text">Popover Title</h5>
			</div>
			<div class="px-3 py-2">
				<p>And here's some amazing content. It's very engaging. Right?</p>
			</div>
		</div>
	</div>
</div>`}
        >
          <PopoverList popovers={togglePopovers} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Colored Popovers"
          cardClassName="md:col-span-6 col-span-12"
          contentClassName="flex flex-wrap sm:flex-row flex-col items-center justify-center sm:justify-start gap-2"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="flex flex-wrap sm:flex-row flex-col items-center justify-center sm:justify-start gap-2">

	<div class="hs-tooltip [--trigger:focus]">
		<button type="button" class="btn hs-tooltip-toggle bg-primary text-white hover:bg-primary-900">Primary</button>
		<div class="hs-tooltip-content absolute z-10 invisible opacity-0 inline-block w-64 text-sm text-white transition-opacity duration-300 bg-primary border border-primary rounded-lg shadow-sm hs-tooltip-shown:visible hs-tooltip-shown:opacity-100">
			<div class="px-3 py-2 border-b border-white dark:border-dark rounded-t-lg">
				<h5 class="font-semibold text-white">Primary Background</h5>
			</div>
			<div class="px-3 py-2">
				<p>Popover with primary background.</p>
			</div>
		</div>
	</div>

	<div class="hs-tooltip [--trigger:focus]">
		<button type="button" class="btn hs-tooltip-toggle bg-info text-white hover:bg-info-900">Info</button>
		<div class="hs-tooltip-content absolute z-10 invisible opacity-0 inline-block w-64 text-sm text-white transition-opacity duration-300 bg-info border border-info rounded-lg shadow-sm hs-tooltip-shown:visible hs-tooltip-shown:opacity-100">
			<div class="px-3 py-2 border-b border-white dark:border-dark rounded-t-lg">
				<h5 class="font-semibold text-white">Info Background</h5>
			</div>
			<div class="px-3 py-2">
				<p>Popover with info background.</p>
			</div>
		</div>
	</div>

	<div class="hs-tooltip [--trigger:focus]">
		<button type="button" class="btn hs-tooltip-toggle bg-warning text-white hover:bg-warning-900">Warning</button>
		<div class="hs-tooltip-content absolute z-10 invisible opacity-0 inline-block w-64 text-sm text-white transition-opacity duration-300 bg-warning border border-warning rounded-lg shadow-sm hs-tooltip-shown:visible hs-tooltip-shown:opacity-100">
			<div class="px-3 py-2 border-b border-white dark:border-dark rounded-t-lg">
				<h5 class="font-semibold text-white">Warning Background</h5>
			</div>
			<div class="px-3 py-2">
				<p>Popover with warning background.</p>
			</div>
		</div>
	</div>

	<div class="hs-tooltip [--trigger:focus]">
		<button type="button" class="btn hs-tooltip-toggle bg-success text-white hover:bg-success-900">Success</button>
		<div class="hs-tooltip-content absolute z-10 invisible opacity-0 inline-block w-64 text-sm text-white transition-opacity duration-300 bg-success border border-success rounded-lg shadow-sm hs-tooltip-shown:visible hs-tooltip-shown:opacity-100">
			<div class="px-3 py-2 border-b border-white dark:border-dark rounded-t-lg">
				<h5 class="font-semibold text-white">Success Background</h5>
			</div>
			<div class="px-3 py-2">
				<p>Popover with success background.</p>
			</div>
		</div>
	</div>

	<div class="hs-tooltip [--trigger:focus]">
		<button type="button" class="btn hs-tooltip-toggle bg-danger text-white hover:bg-danger-900">Danger</button>
		<div class="hs-tooltip-content absolute z-10 invisible opacity-0 inline-block w-64 text-sm text-white transition-opacity duration-300 bg-danger border border-danger rounded-lg shadow-sm hs-tooltip-shown:visible hs-tooltip-shown:opacity-100">
			<div class="px-3 py-2 border-b border-white dark:border-dark rounded-t-lg">
				<h5 class="font-semibold text-white">Danger Background</h5>
			</div>
			<div class="px-3 py-2">
				<p>Popover with danger background.</p>
			</div>
		</div>
	</div>
</div>`}
        >
          <PopoverList popovers={coloredPopovers} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Disabled Elements"
          cardClassName="md:col-span-6 col-span-12"
          contentClassName="flex flex-wrap justify-center sm:justify-start gap-2"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="flex flex-wrap justify-center sm:justify-start gap-2">
	<div class="hs-tooltip [--trigger:focus]">
		<button type="button" class="btn hs-tooltip-toggle bg-primary border border-primary text-white hover:bg-primary-900 cursor-not-allowed" disabled>Disabled Button</button>
		<div class="hs-tooltip-content absolute z-10 invisible opacity-0 inline-block w-64 text-sm text-white transition-opacity duration-300 bg-primary border border-primary rounded-lg shadow-sm hs-tooltip-shown:visible hs-tooltip-shown:opacity-100">
			<div class="px-3 py-2 border-b border-[var(--border)] rounded-t-lg">
				<h5 class="font-semibold text-white">Disabled Popover</h5>
			</div>
			<div class="px-3 py-2">
				<p>This popover button is disabled.</p>
			</div>
		</div>
	</div>
</div>`}
        >
          <PopoverList popovers={disabledPopovers} />
        </PreviewCodeToggle>
        {/* end card */}
      </div>
      {/* end grid */}
    </div>
  );
};

export default UiPopovers;

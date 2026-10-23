import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

/* Every demo is the same "Pre / 01..04 / Next" strip; only the link classes and
   the icon slots differ, so one component renders them all from typed data. */

type PageIcon = "prev" | "next" | "first" | "last";

type PageItem = {
  key: string;
  label?: string;
  className: string;
  /** Icon rendered before the label. */
  leadingIcon?: PageIcon;
  /** Icon rendered after the label. */
  trailingIcon?: PageIcon;
  iconClassName?: string;
};

const ICONS: Record<PageIcon, typeof ChevronLeft> = {
  prev: ChevronLeft,
  next: ChevronRight,
  first: ChevronsLeft,
  last: ChevronsRight,
};

const SQUARE =
  "px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white";

const SQUARE_ACTIVE =
  "px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-primary text-white hover:bg-primary hover:text-white";

const SQUARE_ICON =
  "px-2 py-1.5 inline-flex items-center justify-center text-xs font-semibold first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white";

const SQUARE_ICON_NEXT =
  "px-2 py-1.5 inline-flex items-center justify-center text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white";

const GHOST =
  "px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary";

const GHOST_ACTIVE =
  "px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-primary hover:border-primary bg-primary text-white hover:bg-primary text-white hover:text-primary";

const PILL =
  "px-2 py-1.5 inline-flex text-xs font-medium rounded-lg border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white";

const PILL_ACTIVE =
  "px-2 py-1.5 inline-flex text-xs font-medium rounded-lg border border-[var(--border)] bg-primary text-white hover:bg-primary hover:text-white";

const SOFT =
  "px-2 py-1.5 inline-flex text-xs font-medium rounded-lg border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary";

const SOFT_ACTIVE =
  "px-2 py-1.5 inline-flex text-xs font-medium rounded-lg border border-primary hover:border-primary bg-primary text-white hover:bg-primary text-white hover:text-primary";

const ROUND_EDGE =
  "px-2 py-1.5 inline-flex text-xs font-medium rounded-full border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white";

const ROUND =
  "w-7.5 h-7.5 items-center justify-center inline-flex text-xs font-medium rounded-full border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white";

const ROUND_ACTIVE =
  "w-7.5 h-7.5 items-center justify-center inline-flex text-xs font-medium rounded-full border border-[var(--border)] bg-primary text-white hover:bg-primary hover:text-white";

const CIRCLE =
  "w-7.5 h-7.5 inline-flex items-center justify-center text-xs font-medium rounded-full border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary";

const CIRCLE_ACTIVE =
  "w-7.5 h-7.5 inline-flex items-center justify-center text-xs font-medium rounded-full border border-primary hover:border-primary bg-primary text-white hover:bg-primary text-white hover:text-primary";

const UNDERLINE =
  "px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] hover:border-b-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary";

const UNDERLINE_ACTIVE =
  "px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] border-b-primary hover:border-b-primary bg-primary text-white hover:bg-primary text-white hover:text-primary";

const EDGE_ROUND =
  "px-2 py-1.5 inline-flex text-xs font-medium rounded-full border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary";

const JOINED_FIRST =
  "px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-full last:rounded-e-full rounded-none border border-e-0 border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:text-primary";

const JOINED_MID =
  "px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-full last:rounded-e-full rounded-none border border-e-0 border-s-0 border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:text-primary";

const JOINED_MID_ACTIVE =
  "px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-full last:rounded-e-full rounded-none border border-e-0 border-s-0 border-[var(--border)] bg-[var(--surface)] c-gold hover:text-primary";

const JOINED_LAST =
  "px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-full last:rounded-e-full rounded-none border border-s-0 border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:text-primary";

const PAGES = ["01", "02", "03"];

const defaultItems: PageItem[] = [
  { key: "pre", label: "Pre", className: SQUARE },
  ...PAGES.map((p) => ({ key: p, label: p, className: SQUARE })),
  { key: "next", label: "Next", className: SQUARE },
];

const iconItems: PageItem[] = [
  { key: "pre", className: SQUARE_ICON, leadingIcon: "prev" },
  ...PAGES.map((p) => ({ key: p, label: p, className: SQUARE })),
  { key: "next", className: SQUARE_ICON_NEXT, leadingIcon: "next" },
];

const activeItems: PageItem[] = [
  { key: "pre", label: "Pre", className: SQUARE },
  ...PAGES.map((p) => ({ key: p, label: p, className: p === "01" ? SQUARE_ACTIVE : SQUARE })),
  { key: "next", label: "Next", className: SQUARE },
];

const ghostItems: PageItem[] = [
  { key: "pre", label: "Pre", className: GHOST },
  ...PAGES.map((p) => ({ key: p, label: p, className: p === "01" ? GHOST_ACTIVE : GHOST })),
  { key: "next", label: "Next", className: GHOST },
];

const customItems: PageItem[] = [
  { key: "pre", label: "Pre", className: PILL, leadingIcon: "prev", iconClassName: "w-4 h-4 me-1" },
  { key: "01", label: "01", className: PILL_ACTIVE },
  { key: "02", label: "02", className: PILL },
  { key: "03", label: "03", className: PILL },
  { key: "ellipsis", label: "...", className: PILL },
  { key: "10", label: "10", className: PILL },
  { key: "next", label: "Next", className: PILL, trailingIcon: "next", iconClassName: "w-4 h-4 ms-1" },
];

const softItems: PageItem[] = [
  { key: "pre", className: SOFT, leadingIcon: "prev" },
  { key: "01", label: "01", className: SOFT_ACTIVE },
  { key: "02", label: "02", className: SOFT },
  { key: "03", label: "03", className: SOFT },
  { key: "ellipsis", label: "...", className: SOFT },
  { key: "10", label: "10", className: SOFT },
  { key: "next", className: SOFT, leadingIcon: "next" },
];

const roundedItems: PageItem[] = [
  { key: "pre", label: "Pre", className: ROUND_EDGE, leadingIcon: "prev", iconClassName: "w-4 h-4 me-1" },
  { key: "01", label: "01", className: ROUND_ACTIVE },
  { key: "02", label: "02", className: ROUND },
  { key: "03", label: "03", className: ROUND },
  { key: "ellipsis", label: "...", className: ROUND },
  { key: "10", label: "10", className: ROUND },
  { key: "next", label: "Next", className: ROUND_EDGE, trailingIcon: "next", iconClassName: "w-4 h-4 ms-1" },
];

const circleItems: PageItem[] = [
  { key: "pre", className: CIRCLE, leadingIcon: "prev" },
  { key: "01", label: "01", className: CIRCLE_ACTIVE },
  { key: "02", label: "02", className: CIRCLE },
  { key: "03", label: "03", className: CIRCLE },
  { key: "ellipsis", label: "...", className: CIRCLE },
  { key: "10", label: "10", className: CIRCLE },
  { key: "next", className: CIRCLE, leadingIcon: "next" },
];

const underlineItems: PageItem[] = [
  { key: "pre", label: "Pre", className: UNDERLINE },
  ...PAGES.map((p) => ({ key: p, label: p, className: p === "01" ? UNDERLINE_ACTIVE : UNDERLINE })),
  { key: "next", label: "Next", className: UNDERLINE },
];

/* "Pagination 4" splits its strip into three groups. */
const firstLastLeadItems: PageItem[] = [
  { key: "first", className: EDGE_ROUND, leadingIcon: "first" },
  { key: "pre", className: EDGE_ROUND, leadingIcon: "prev" },
];

const firstLastPageItems: PageItem[] = [
  { key: "01", label: "01", className: JOINED_FIRST },
  { key: "02", label: "02", className: JOINED_MID_ACTIVE },
  { key: "03", label: "03", className: JOINED_MID },
  { key: "04", label: "04", className: JOINED_LAST },
];

const firstLastTrailItems: PageItem[] = [
  { key: "next", className: EDGE_ROUND, leadingIcon: "next" },
  { key: "last", className: EDGE_ROUND, leadingIcon: "last" },
];

const PaginationLinks = ({ items }: { items: PageItem[] }) => (
  <>
    {items.map((item) => {
      const Leading = item.leadingIcon ? ICONS[item.leadingIcon] : null;
      const Trailing = item.trailingIcon ? ICONS[item.trailingIcon] : null;
      const iconClass = item.iconClassName ?? "w-4 h-4";

      return (
        <a key={item.key} href="#" className={item.className}>
          {Leading && <Leading className={iconClass} aria-hidden="true" />}
          {item.label}
          {Trailing && <Trailing className={iconClass} aria-hidden="true" />}
        </a>
      );
    })}
  </>
);

const UiPagination = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Pagination</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-12 gap-6 items-baseline">
        <PreviewCodeToggle
          title="Default"
          cardClassName="sm:col-span-6 col-span-12"
          contentClassName="inline-flex"
          codeMaxHeightClassName="max-h-[250px]"
          code={`
<div class="inline-flex">
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		Pre
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		01
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		02
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		03
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		Next
	</a>
</div>`}
        >
          <PaginationLinks items={defaultItems} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Default With Icons"
          cardClassName="sm:col-span-6 col-span-12"
          contentClassName="inline-flex"
          codeMaxHeightClassName="max-h-[250px]"
          code={`
<div class="inline-flex">
	<a href="#" class="px-2 py-1.5 inline-flex items-center justify-center text-xs font-semibold first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		<i data-lucide="chevron-left" class="w-4 h-4"></i>
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		01
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		02
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		03
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex items-center justify-center text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		<i data-lucide="chevron-right" class="w-4 h-4"></i>
	</a>
</div>`}
        >
          <PaginationLinks items={iconItems} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Default with Active"
          cardClassName="sm:col-span-6 col-span-12"
          contentClassName="inline-flex"
          codeMaxHeightClassName="max-h-[250px]"
          code={`
<div class="inline-flex">
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		Pre
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-primary text-white hover:bg-primary hover:text-white">
		01
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		02
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		03
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		Next
	</a>
</div>`}
        >
          <PaginationLinks items={activeItems} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Default with Active Ghost"
          cardClassName="sm:col-span-6 col-span-12"
          contentClassName="inline-flex"
          codeMaxHeightClassName="max-h-[250px]"
          code={`
<div class="inline-flex">
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		Pre
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-primary hover:border-primary bg-primary text-white hover:bg-primary text-white hover:text-primary">
		01
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		02
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		03
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		Next
	</a>
</div>`}
        >
          <PaginationLinks items={ghostItems} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Left Align"
          cardClassName="sm:col-span-4 col-span-12"
          contentClassName="inline-flex"
          codeMaxHeightClassName="max-h-[250px]"
          code={`
<div class="inline-flex">
	<a href="#" class="px-2 py-1.5 inline-flex items-center justify-center text-xs font-semibold first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		<i data-lucide="chevron-left" class="w-4 h-4"></i>
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		01
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		02
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		03
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex items-center justify-center text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		<i data-lucide="chevron-right" class="w-4 h-4"></i>
	</a>
</div>`}
        >
          <PaginationLinks items={iconItems} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Centre Align"
          cardClassName="sm:col-span-4 col-span-12"
          contentClassName="flex justify-center items-center"
          codeMaxHeightClassName="max-h-[250px]"
          code={`
<div class="flex justify-center items-center">
	<div class="inline-flex">
		<a href="#" class="px-2 py-1.5 inline-flex items-center justify-center text-xs font-semibold first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
			<i data-lucide="chevron-left" class="w-4 h-4"></i>
		</a>
		<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
			01
		</a>
		<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
			02
		</a>
		<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
			03
		</a>
		<a href="#" class="px-2 py-1.5 inline-flex items-center justify-center text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
			<i data-lucide="chevron-right" class="w-4 h-4"></i>
		</a>
	</div>
</div>`}
        >
          <div className="inline-flex">
            <PaginationLinks items={iconItems} />
          </div>
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Right Align"
          cardClassName="sm:col-span-4 col-span-12"
          contentClassName="flex justify-end items-end"
          codeMaxHeightClassName="max-h-[250px]"
          code={`
<div class="flex justify-end items-end">
	<div class="inline-flex">
		<a href="#" class="px-2 py-1.5 inline-flex items-center justify-center text-xs font-semibold first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
			02
		</a>
		<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
			03
		</a>
		<a href="#" class="px-2 py-1.5 inline-flex items-center justify-center text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
			<i data-lucide="chevron-right" class="w-4 h-4"></i>
		</a>
	</div>
</div>`}
        >
          <div className="inline-flex">
            <PaginationLinks items={iconItems} />
          </div>
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Custom Pagination"
          cardClassName="sm:col-span-6 col-span-12"
          contentClassName="inline-flex flex-wrap gap-1"
          codeMaxHeightClassName="max-h-[250px]"
          code={`
<div class="inline-flex gap-1">
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-lg border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		<i data-lucide="chevron-left" class="w-4 h-4 me-1"></i> Pre
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-lg border border-[var(--border)] bg-primary text-white hover:bg-primary hover:text-white">
		01
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-lg border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		02
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-lg border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		03
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-lg border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		...
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-lg border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		10
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-lg border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		Next <i data-lucide="chevron-right" class="w-4 h-4 ms-1"></i>
	</a>
</div>`}
        >
          <PaginationLinks items={customItems} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Soft Pagination"
          cardClassName="sm:col-span-6 col-span-12"
          contentClassName="inline-flex gap-1"
          codeMaxHeightClassName="max-h-[250px]"
          code={`
<div class="inline-flex gap-1">
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-lg border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		<i data-lucide="chevron-left" class="w-4 h-4"></i>
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-lg border border-primary hover:border-primary bg-primary text-white hover:bg-primary text-white hover:text-primary">
		01
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-lg border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		02
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-lg border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		03
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-lg border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		...
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-lg border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		10
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-lg border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		<i data-lucide="chevron-right" class="w-4 h-4"></i>
	</a>
</div>`}
        >
          <PaginationLinks items={softItems} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Pagination 1"
          cardClassName="sm:col-span-6 col-span-12"
          contentClassName="inline-flex flex-wrap gap-1"
          codeMaxHeightClassName="max-h-[250px]"
          code={`
<div class="inline-flex gap-1">
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-full border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		<i data-lucide="chevron-left" class="w-4 h-4 me-1"></i> Pre
	</a>
	<a href="#" class="w-7.5 h-7.5 items-center justify-center inline-flex text-xs font-medium rounded-full border border-[var(--border)] bg-primary text-white hover:bg-primary hover:text-white">
		01
	</a>
	<a href="#" class="w-7.5 h-7.5 items-center justify-center inline-flex text-xs font-medium rounded-full border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		02
	</a>
	<a href="#" class="w-7.5 h-7.5 items-center justify-center inline-flex text-xs font-medium rounded-full border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		03
	</a>
	<a href="#" class="w-7.5 h-7.5 items-center justify-center inline-flex text-xs font-medium rounded-full border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		...
	</a>
	<a href="#" class="w-7.5 h-7.5 items-center justify-center inline-flex text-xs font-medium rounded-full border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		10
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-full border border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:bg-primary hover:text-white">
		Next <i data-lucide="chevron-right" class="w-4 h-4 ms-1"></i>
	</a>
</div>`}
        >
          <PaginationLinks items={roundedItems} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Pagination 2"
          cardClassName="sm:col-span-6 col-span-12"
          contentClassName="inline-flex gap-1"
          codeMaxHeightClassName="max-h-[250px]"
          code={`
<div class="inline-flex gap-1">
	<a href="#" class="w-7.5 h-7.5 inline-flex items-center justify-center text-xs font-medium rounded-full border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		<i data-lucide="chevron-left" class="w-4 h-4"></i>
	</a>
	<a href="#" class="w-7.5 h-7.5 inline-flex items-center justify-center text-xs font-medium rounded-full border border-primary hover:border-primary bg-primary text-white hover:bg-primary text-white hover:text-primary">
		01
	</a>
	<a href="#" class="w-7.5 h-7.5 inline-flex items-center justify-center text-xs font-medium rounded-full border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		02
	</a>
	<a href="#" class="w-7.5 h-7.5 inline-flex items-center justify-center text-xs font-medium rounded-full border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		03
	</a>
	<a href="#" class="w-7.5 h-7.5 inline-flex items-center justify-center text-xs font-medium rounded-full border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		...
	</a>
	<a href="#" class="w-7.5 h-7.5 inline-flex items-center justify-center text-xs font-medium rounded-full border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		10
	</a>
	<a href="#" class="w-7.5 h-7.5 inline-flex items-center justify-center text-xs font-medium rounded-full border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		<i data-lucide="chevron-right" class="w-4 h-4"></i>
	</a>
</div>`}
        >
          <PaginationLinks items={circleItems} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Pagination 3"
          cardClassName="sm:col-span-6 col-span-12"
          contentClassName="inline-flex"
          codeMaxHeightClassName="max-h-[250px]"
          code={`
<div class="inline-flex">
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] hover:border-b-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		Pre
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] border-b-primary hover:border-b-primary bg-primary text-white hover:bg-primary text-white hover:text-primary">
		01
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] hover:border-b-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		02
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] hover:border-b-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		03
	</a>
	<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-lg last:rounded-e-lg rounded-none border border-[var(--border)] hover:border-b-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
		Next
	</a>
</div>`}
        >
          <PaginationLinks items={underlineItems} />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Pagination 4"
          cardClassName="sm:col-span-6 col-span-12"
          contentClassName="inline-flex flex-wrap gap-1"
          codeMaxHeightClassName="max-h-[250px]"
          code={`
<div class="inline-flex gap-1">
	<div>
		<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-full border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
			<i data-lucide="chevrons-left" class="w-4 h-4"></i>
		</a>
		<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-full border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
			<i data-lucide="chevron-left" class="w-4 h-4"></i>
		</a>
	</div>
	<div class="flex">
		<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-full last:rounded-e-full rounded-none border border-e-0 border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:text-primary">
			01
		</a>
		<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-full last:rounded-e-full rounded-none border border-e-0 border-s-0 border-[var(--border)] bg-[var(--surface)] c-gold hover:text-primary">
			02
		</a>
		<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-full last:rounded-e-full rounded-none border border-e-0 border-s-0 border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:text-primary">
			03
		</a>
		<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium first:rounded-s-full last:rounded-e-full rounded-none border border-s-0 border-[var(--border)] bg-[var(--surface)] text-dark dark:text-white hover:text-primary">
			04
		</a>
	</div>
	<div>
		<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-full border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
			<i data-lucide="chevron-right" class="w-4 h-4"></i>
		</a>
		<a href="#" class="px-2 py-1.5 inline-flex text-xs font-medium rounded-full border border-[var(--border)] hover:border-primary bg-[var(--surface)] text-dark dark:text-white hover:bg-primary text-white hover:text-primary">
			<i data-lucide="chevrons-right" class="w-4 h-4"></i>
		</a>
	</div>
</div>`}
        >
          <div>
            <PaginationLinks items={firstLastLeadItems} />
          </div>
          <div className="flex">
            <PaginationLinks items={firstLastPageItems} />
          </div>
          <div>
            <PaginationLinks items={firstLastTrailItems} />
          </div>
        </PreviewCodeToggle>
        {/* end card */}
      </div>
      {/* End grid */}
    </div>
  );
};

export default UiPagination;

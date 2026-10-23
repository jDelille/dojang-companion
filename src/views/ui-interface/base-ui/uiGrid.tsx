import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

const firstGridCells: string[] = ["1 of 2", "2 of 2", "1 of 3", "2 of 3", "3 of 3"];

const firstGridSpans: string[] = [
  "md:col-span-6",
  "md:col-span-6",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-4",
];

/* Full class strings, not `md:col-span-${n}` — Tailwind only emits classes it
   can find literally in the source. */
const secondGridCells: { span: number; className: string }[] = [
  { span: 1, className: "md:col-span-1" },
  { span: 2, className: "md:col-span-2" },
  { span: 2, className: "md:col-span-2" },
  { span: 3, className: "md:col-span-3" },
  { span: 4, className: "md:col-span-4" },
  { span: 5, className: "md:col-span-5" },
  { span: 7, className: "md:col-span-7" },
  { span: 6, className: "md:col-span-6" },
  { span: 6, className: "md:col-span-6" },
  { span: 8, className: "md:col-span-8" },
  { span: 4, className: "md:col-span-4" },
  { span: 9, className: "md:col-span-9" },
  { span: 10, className: "md:col-span-10" },
  { span: 2, className: "md:col-span-2" },
  { span: 12, className: "md:col-span-12" },
];

const UiGrid = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Grid</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-1 gap-6 items-baseline">
        <PreviewCodeToggle
          title="Grid Example"
          contentClassName="grid grid-cols-1 md:grid-cols-12 gap-6"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="grid w-full grid-cols-12 gap-6">
	<div class="col-span-6 p-3 text-white bg-primary rounded-lg dark:text-title-dark mb-4">1 of 2</div>
	<div class="col-span-6 p-3 text-white bg-primary rounded-lg dark:text-title-dark mb-4">2 of 2</div>
	<div class="col-span-4 p-3 text-white bg-primary rounded-lg dark:text-title-dark mb-4">1 of 3</div>
	<div class="col-span-4 p-3 text-white bg-primary rounded-lg dark:text-title-dark mb-4">2 of 3</div>
	<div class="col-span-4 p-3 text-white bg-primary rounded-lg dark:text-title-dark mb-4">3 of 3</div>
</div>`}
        >
          {firstGridCells.map((label, index) => (
            <div
              key={label}
              className={`${firstGridSpans[index]} p-3 text-white bg-primary rounded-lg dark:text-title-dark`}
            >
              {label}
            </div>
          ))}
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Grid Example 2"
          contentClassName="grid grid-cols-1 md:grid-cols-12 gap-6"
          codeMaxHeightClassName="max-h-[450px]"
          code={`<div class="grid md:grid-cols-12 gap-6">
	<div class="col-span-1 text-center bg-primary text-white p-2 rounded-lg"><span>col-span-1</span></div>
	<div class="col-span-2 text-center bg-primary text-white p-2 rounded-lg"><span>col-span-2</span></div>
	<div class="col-span-2 text-center bg-primary text-white p-2 rounded-lg"><span>col-span-2</span></div>
	<div class="col-span-3 text-center bg-primary text-white p-2 rounded-lg"><span>col-span-3</span></div>
	<div class="col-span-4 text-center bg-primary text-white p-2 rounded-lg"><span>col-span-4</span></div>
	<div class="col-span-5 text-center bg-primary text-white p-2 rounded-lg"><span>col-span-5</span></div>
	<div class="col-span-7 text-center bg-primary text-white p-2 rounded-lg"><span>col-span-7</span></div>
	<div class="col-span-6 text-center bg-primary text-white p-2 rounded-lg"><span>col-span-6</span></div>
	<div class="col-span-6 text-center bg-primary text-white p-2 rounded-lg"><span>col-span-6</span></div>
	<div class="col-span-8 text-center bg-primary text-white p-2 rounded-lg"><span>col-span-8</span></div>
	<div class="col-span-4 text-center bg-primary text-white p-2 rounded-lg"><span>col-span-4</span></div>
	<div class="col-span-9 text-center bg-primary text-white p-2 rounded-lg"><span>col-span-9</span></div>
	<div class="col-span-10 text-center bg-primary text-white p-2 rounded-lg"><span>col-span-10</span></div>
	<div class="col-span-2 text-center bg-primary text-white p-2 rounded-lg"><span>col-span-2</span></div>
	<div class="col-span-12 text-center bg-primary text-white p-2 rounded-lg"><span>col-span-12</span></div>
</div>`}
        >
          {secondGridCells.map((cell, index) => (
            <div
              key={`${cell.span}-${index}`}
              className={`${cell.className} text-center bg-primary text-white p-2 rounded-lg`}
            >
              <span>col-span-{cell.span}</span>
            </div>
          ))}
        </PreviewCodeToggle>
        {/* end card */}
      </div>
      {/* End grid */}
    </div>
  );
};

export default UiGrid;

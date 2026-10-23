import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

/* The template writes the track as `bg-border-color`, which has no definition in
   this project's stylesheet; `bg-[var(--border)]` is the same colour token. */
const TRACK = "bg-[var(--border)] w-full rounded-lg";

const STRIPE_BG =
  "bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]";

type Bar = {
  color: string;
  width: string;
};

type SizedBar = Bar & {
  /** Track and bar height, e.g. "h-1". */
  height: string;
};

const basicBars: Bar[] = [
  { color: "bg-primary", width: "0%" },
  { color: "bg-primary", width: "25%" },
  { color: "bg-primary", width: "50%" },
  { color: "bg-primary", width: "75%" },
  { color: "bg-primary", width: "100%" },
];

const coloredBars: Bar[] = [
  { color: "bg-primary", width: "10%" },
  { color: "bg-success", width: "25%" },
  { color: "bg-info", width: "50%" },
  { color: "bg-[var(--surface)]", width: "75%" },
  { color: "bg-danger", width: "100%" },
];

const stripedBars: Bar[] = [
  { color: "bg-success", width: "10%" },
  { color: "bg-[var(--surface)]", width: "25%" },
  { color: "bg-danger", width: "50%" },
  { color: "bg-primary", width: "75%" },
  { color: "bg-info", width: "100%" },
];

const heightBars: SizedBar[] = [
  { color: "bg-primary", width: "10%", height: "h-1" },
  { color: "bg-primary", width: "25%", height: "h-2" },
  { color: "bg-primary", width: "50%", height: "h-3" },
  { color: "bg-primary", width: "75%", height: "h-4" },
  { color: "bg-primary", width: "100%", height: "h-5" },
];

const labelBars: Bar[] = [
  { color: "bg-primary", width: "10%" },
  { color: "bg-success", width: "25%" },
  { color: "bg-info", width: "50%" },
  { color: "bg-[var(--surface)]", width: "75%" },
  { color: "bg-danger", width: "100%" },
];

const multiBarRows: { height: string; bars: Bar[] }[] = [
  {
    height: "h-1",
    bars: [
      { color: "bg-primary", width: "5%" },
      { color: "bg-success", width: "10%" },
      { color: "bg-[var(--surface)]", width: "15%" },
    ],
  },
  {
    height: "h-2",
    bars: [
      { color: "bg-info", width: "10%" },
      { color: "bg-danger", width: "15%" },
      { color: "bg-primary", width: "20%" },
    ],
  },
  {
    height: "h-3",
    bars: [
      { color: "bg-[var(--surface)]", width: "15%" },
      { color: "bg-warning", width: "20%" },
      { color: "bg-info", width: "25%" },
    ],
  },
  {
    height: "h-4",
    bars: [
      { color: "bg-success", width: "20%" },
      { color: "bg-warning", width: "25%" },
      { color: "bg-[var(--surface)]", width: "30%" },
    ],
  },
  {
    height: "h-5",
    bars: [
      { color: "bg-danger", width: "25%" },
      { color: "bg-info", width: "30%" },
      { color: "bg-primary", width: "35%" },
    ],
  },
];

const animatedBars: Bar[] = [
  { color: "bg-success", width: "10%" },
  { color: "bg-[var(--surface)]", width: "25%" },
  { color: "bg-danger", width: "50%" },
  { color: "bg-primary", width: "75%" },
  { color: "bg-info", width: "100%" },
];

const gradientBars: Bar[] = [
  { color: "bg-primary-gradient", width: "10%" },
  { color: "bg-success-gradient", width: "25%" },
  { color: "bg-info-gradient", width: "50%" },
  { color: "bg-[var(--surface)]-gradient", width: "75%" },
  { color: "bg-danger-gradient", width: "100%" },
];

/** A single-bar track. `barExtraClassName` adds the stripe pattern or label layout. */
const ProgressRow = ({
  bar,
  height = "h-3",
  barExtraClassName = "",
  trackExtraClassName = "",
  showLabel = false,
}: {
  bar: Bar;
  height?: string;
  barExtraClassName?: string;
  trackExtraClassName?: string;
  showLabel?: boolean;
}) => (
  <div className={`${TRACK} ${height}${trackExtraClassName ? ` ${trackExtraClassName}` : ""}`}>
    <div
      className={`rounded-lg ${height} ${bar.color}${barExtraClassName ? ` ${barExtraClassName}` : ""}`}
      style={{ width: bar.width }}
    >
      {showLabel ? bar.width : null}
    </div>
  </div>
);

const UiProgress = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Progress</h1>
      </div>

      {/* start grid */}
      <div className="grid grid-cols-12 gap-6">
        <PreviewCodeToggle
          title="Basic Progress"
          cardClassName="lg:col-span-6 col-span-12"
          contentClassName="flex flex-col gap-4"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="flex flex-col gap-4">
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-primary" style="width: 0%"></div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-primary" style="width: 25%"></div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-primary" style="width: 50%"></div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-primary" style="width: 75%"></div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-primary" style="width: 100%"></div>
	</div>
</div>`}
        >
          {basicBars.map((bar) => (
            <ProgressRow key={bar.width} bar={bar} />
          ))}
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Colored Progress"
          cardClassName="lg:col-span-6 col-span-12"
          contentClassName="flex flex-col gap-4"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="flex flex-col gap-4">
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-primary" style="width: 10%"></div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-success" style="width: 25%"></div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-info" style="width: 50%"></div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-[var(--surface)]" style="width: 75%"></div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-danger" style="width: 100%"></div>
	</div>
</div>`}
        >
          {coloredBars.map((bar) => (
            <ProgressRow key={bar.width} bar={bar} />
          ))}
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Striped Progress"
          cardClassName="lg:col-span-6 col-span-12"
          contentClassName="flex flex-col gap-4"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="flex flex-col gap-4">
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-success bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]" style="width: 10%"></div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-[var(--surface)] bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]" style="width: 25%"></div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-danger bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]" style="width: 50%"></div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-primary bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]" style="width: 75%"></div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-info bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]" style="width: 100%"></div>
	</div>
</div>`}
        >
          {stripedBars.map((bar) => (
            <ProgressRow key={bar.width} bar={bar} barExtraClassName={STRIPE_BG} />
          ))}
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Progress Height"
          cardClassName="lg:col-span-6 col-span-12"
          contentClassName="flex flex-col gap-4"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="flex flex-col gap-4">
	<div class="bg-border-color w-full h-1 rounded-lg">
		<div class="rounded-lg h-1 bg-primary" style="width: 10%"></div>
	</div>
	<div class="bg-border-color w-full h-2 rounded-lg">
		<div class="rounded-lg h-2 bg-primary" style="width: 25%"></div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-primary" style="width: 50%"></div>
	</div>
	<div class="bg-border-color w-full h-4 rounded-lg">
		<div class="rounded-lg h-4 bg-primary" style="width: 75%"></div>
	</div>
	<div class="bg-border-color w-full h-5 rounded-lg">
		<div class="rounded-lg h-5 bg-primary" style="width: 100%"></div>
	</div>
</div>`}
        >
          {heightBars.map((bar) => (
            <ProgressRow key={bar.height} bar={bar} height={bar.height} />
          ))}
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Progress With Labels"
          cardClassName="lg:col-span-6 col-span-12"
          contentClassName="flex flex-col gap-4"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="flex flex-col gap-4">
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-primary text-white text-center p-0.5 text-xs leading-none flex flex-col justify-center overflow-hidden" style="width: 10%">10%</div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-success text-white text-center p-0.5 text-xs leading-none flex flex-col justify-center overflow-hidden" style="width: 25%">25%</div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-info text-white text-center p-0.5 text-xs leading-none flex flex-col justify-center overflow-hidden" style="width: 50%">50%</div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-[var(--surface)] text-white text-center p-0.5 text-xs leading-none flex flex-col justify-center overflow-hidden" style="width: 75%">75%</div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-danger text-white text-center p-0.5 text-xs leading-none flex flex-col justify-center overflow-hidden" style="width: 100%">100%</div>
	</div>
</div>`}
        >
          {labelBars.map((bar) => (
            <ProgressRow
              key={bar.width}
              bar={bar}
              showLabel
              barExtraClassName="text-white text-center p-0.5 text-xs leading-none flex flex-col justify-center overflow-hidden"
            />
          ))}
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Multiple bars With Sizes"
          cardClassName="lg:col-span-6 col-span-12"
          contentClassName="flex flex-col gap-4"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="flex flex-col gap-4">
	<div class="flex bg-border-color w-full h-1 rounded-lg">
		<div class="rounded-lg h-1 bg-primary" style="width: 5%"></div>
		<div class="rounded-lg h-1 bg-success" style="width: 10%"></div>
		<div class="rounded-lg h-1 bg-[var(--surface)]" style="width: 15%"></div>
	</div>
	<div class="flex bg-border-color w-full h-2 rounded-lg">
		<div class="rounded-lg h-2 bg-info" style="width: 10%"></div>
		<div class="rounded-lg h-2 bg-danger" style="width: 15%"></div>
		<div class="rounded-lg h-2 bg-primary" style="width: 20%"></div>
	</div>
	<div class="flex bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-[var(--surface)]" style="width: 15%"></div>
		<div class="rounded-lg h-3 bg-warning" style="width: 20%"></div>
		<div class="rounded-lg h-3 bg-info" style="width: 25%"></div>
	</div>
	<div class="flex bg-border-color w-full h-4 rounded-lg">
		<div class="rounded-lg h-4 bg-success" style="width: 20%"></div>
		<div class="rounded-lg h-4 bg-warning" style="width: 25%"></div>
		<div class="rounded-lg h-4 bg-[var(--surface)]" style="width: 30%"></div>
	</div>
	<div class="flex bg-border-color w-full h-5 rounded-lg">
		<div class="rounded-lg h-5 bg-danger" style="width: 25%"></div>
		<div class="rounded-lg h-5 bg-info" style="width: 30%"></div>
		<div class="rounded-lg h-5 bg-primary" style="width: 35%"></div>
	</div>
</div>`}
        >
          {multiBarRows.map((row) => (
            <div key={row.height} className={`flex ${TRACK} ${row.height}`}>
              {row.bars.map((bar) => (
                <div
                  key={bar.color}
                  className={`rounded-lg ${row.height} ${bar.color}`}
                  style={{ width: bar.width }}
                />
              ))}
            </div>
          ))}
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Animated Stripped Progress"
          cardClassName="lg:col-span-6 col-span-12"
          contentClassName="flex flex-col gap-4"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="flex flex-col gap-4">
	<div class="bg-border-color w-full h-3 rounded-lg overflow-hidden">
		<div class="striped-progress bg-success" style="width:10%"></div>
	</div>

	<div class="bg-border-color w-full h-3 rounded-lg overflow-hidden">
		<div class="striped-progress bg-[var(--surface)]" style="width:25%"></div>
	</div>

	<div class="bg-border-color w-full h-3 rounded-lg overflow-hidden">
		<div class="striped-progress bg-danger" style="width:50%"></div>
	</div>

	<div class="bg-border-color w-full h-3 rounded-lg overflow-hidden">
		<div class="striped-progress bg-primary" style="width:75%"></div>
	</div>

	<div class="bg-border-color w-full h-3 rounded-lg overflow-hidden">
		<div class="striped-progress bg-info" style="width:100%"></div>
	</div>
</div>`}
        >
          {animatedBars.map((bar) => (
            <div key={bar.width} className={`${TRACK} h-3 overflow-hidden`}>
              <div className={`striped-progress ${bar.color}`} style={{ width: bar.width }} />
            </div>
          ))}
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Gradient Progress"
          cardClassName="lg:col-span-6 col-span-12"
          contentClassName="flex flex-col gap-4"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="flex flex-col gap-4">
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-primary-gradient" style="width: 10%"></div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-success-gradient" style="width: 25%"></div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-info-gradient" style="width: 50%"></div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-[var(--surface)]-gradient" style="width: 75%"></div>
	</div>
	<div class="bg-border-color w-full h-3 rounded-lg">
		<div class="rounded-lg h-3 bg-danger-gradient" style="width: 100%"></div>
	</div>
</div>`}
        >
          {gradientBars.map((bar) => (
            <ProgressRow key={bar.width} bar={bar} />
          ))}
        </PreviewCodeToggle>
        {/* end card */}
      </div>
      {/* end grid */}
    </div>
  );
};

export default UiProgress;

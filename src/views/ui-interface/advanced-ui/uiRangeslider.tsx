import { useEffect, useRef, useState, type ReactNode } from "react";
import noUiSlider, { PipsMode, type API, type target } from "nouislider";
import "nouislider/dist/nouislider.css";
import CommonRangeSlider from "../../../components/common-range-slider/commonRangeSlider";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

// The repo's CommonRangeSlider wraps PrimeReact's Slider, which cannot express
// the vertical / pips / non-linear / merged-tooltip configurations these demos
// need, so nouislider (already a dependency, and themed in style.css) is
// driven directly here, mirroring the template's ui-rangeslider.js.

/** nouislider attaches its API to the element it initialises. */
const sliderOf = (el: HTMLElement) => (el as target).noUiSlider;

const PreviewCard = ({
  title,
  className = "col-span-12",
  children,
  code,
}: {
  title: ReactNode;
  className?: string;
  children: ReactNode;
  code: string;
}) => (
  <PreviewCodeToggle
    title={title}
    code={code}
    cardShellClassName={`preview-card ${className} bg-[var(--card)] rounded-md border border-[var(--border)] p-5`}
  >
    {children}
  </PreviewCodeToggle>
);

/*
   Colour-scheme variants only — these are styled via `.primary-range
   .noUi-connect` etc. in style.css, which target noUiSlider's own DOM, so they
   cannot use the shared PrimeReact-based CommonRangeSlider.
*/
const BasicSlider = ({ className }: { className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || sliderOf(el)) return;
    const slider = noUiSlider.create(el, {
      start: 127,
      connect: "lower",
      range: { min: 0, max: 255 },
    });
    return () => slider.destroy();
  }, []);

  return (
    <div
      ref={ref}
      className={className ? `rangeslider_basic ${className}` : "rangeslider_basic"}
    />
  );
};

const NonLinearSlider = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const lowerRef = useRef<HTMLDivElement>(null);
  const upperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el || sliderOf(el)) return;
    const slider = noUiSlider.create(el, {
      connect: true,
      behaviour: "tap",
      start: [500, 4000],
      range: { min: [0], "10%": [500, 500], "50%": [4000, 1000], max: [10000] },
    });
    slider.on("update", (values, handle, _unencoded, _tap, positions) => {
      const node = handle === 0 ? lowerRef.current : upperRef.current;
      if (node) {
        node.textContent = `${values[handle]}, ${positions[handle].toFixed(2)}%`;
      }
    });
    return () => slider.destroy();
  }, []);

  return (
    <>
      <div ref={sliderRef} id="nonlinear" />
      <div className="flex justify-between mt-3">
        <div className="example-val" id="lower-value" ref={lowerRef} />
        <div className="example-val" id="upper-value" ref={upperRef} />
      </div>
    </>
  );
};

/** Two sliders that can be locked so they move together, preserving offset. */
const LockingSliders = () => {
  const slider1Ref = useRef<HTMLDivElement>(null);
  const slider2Ref = useRef<HTMLDivElement>(null);
  const value1Ref = useRef<HTMLSpanElement>(null);
  const value2Ref = useRef<HTMLSpanElement>(null);
  const lockedRef = useRef(false);
  const lockedValues = useRef<[number, number]>([60, 80]);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const el1 = slider1Ref.current;
    const el2 = slider2Ref.current;
    if (!el1 || !el2 || sliderOf(el1) || sliderOf(el2)) return;

    const s1 = noUiSlider.create(el1, {
      start: 60,
      animate: false,
      range: { min: 50, max: 100 },
    });
    const s2 = noUiSlider.create(el2, {
      start: 80,
      animate: false,
      range: { min: 50, max: 100 },
    });

    const crossUpdate = (value: string, isFirstSource: boolean) => {
      if (!lockedRef.current) return;
      const targetApi: API = isFirstSource ? s2 : s1;
      const i = isFirstSource ? 0 : 1;
      const next =
        Number(value) -
        (lockedValues.current[i ? 0 : 1] - lockedValues.current[i]);
      targetApi.set(next);
    };

    const setLockedValues = () => {
      lockedValues.current = [Number(s1.get()), Number(s2.get())];
    };

    s1.on("update", (values, handle) => {
      if (value1Ref.current) value1Ref.current.textContent = String(values[handle]);
    });
    s2.on("update", (values, handle) => {
      if (value2Ref.current) value2Ref.current.textContent = String(values[handle]);
    });
    s1.on("change", setLockedValues);
    s2.on("change", setLockedValues);
    s1.on("slide", (values, handle) => crossUpdate(String(values[handle]), true));
    s2.on("slide", (values, handle) => crossUpdate(String(values[handle]), false));

    return () => {
      s1.destroy();
      s2.destroy();
    };
  }, []);

  return (
    <>
      <div className="slider" id="slider1" ref={slider1Ref} />
      <span className="example-val mt-1" id="slider1-span" ref={value1Ref} />
      <div className="slider" id="slider2" ref={slider2Ref} />
      <span className="example-val mt-1" id="slider2-span" ref={value2Ref} />
      <button
        type="button"
        id="lockbutton"
        className="btn bg-primary border border-primary text-white text-center hover:bg-primary-900 hover:text-white mt-4"
        onClick={() => {
          lockedRef.current = !lockedRef.current;
          setLocked(lockedRef.current);
        }}
      >
        {locked ? "Unlock" : "Lock"}
      </button>
    </>
  );
};

/** Collapses overlapping tooltips into a single merged label. */
const mergeTooltips = (el: HTMLElement, threshold: number, separator: string) => {
  const api = sliderOf(el);
  if (!api) return;
  const isRtlDoc = getComputedStyle(el).direction === "rtl";
  const isRtlSlider = api.options.direction === "rtl";
  const isVertical = api.options.orientation === "vertical";
  const tooltips = api.getTooltips() ?? [];
  const origins = api.getOrigins();

  tooltips.forEach((tooltip, index) => {
    if (tooltip) origins[index].appendChild(tooltip as HTMLElement);
  });

  api.on("update", (values, _handle, _unencoded, _tap, positions) => {
    const pools: number[][] = [[]];
    const poolPositions: number[][] = [[]];
    const poolValues: string[][] = [[]];
    let atPool = 0;

    if (tooltips[0]) {
      pools[0][0] = 0;
      poolPositions[0][0] = positions[0];
      poolValues[0][0] = String(values[0]);
    }

    for (let i = 1; i < positions.length; i += 1) {
      if (!tooltips[i] || positions[i] - positions[i - 1] > threshold) {
        atPool += 1;
        pools[atPool] = [];
        poolValues[atPool] = [];
        poolPositions[atPool] = [];
      }
      if (tooltips[i]) {
        pools[atPool].push(i);
        poolValues[atPool].push(String(values[i]));
        poolPositions[atPool].push(positions[i]);
      }
    }

    pools.forEach((pool, poolIndex) => {
      const handlesInPool = pool.length;
      for (let j = 0; j < handlesInPool; j += 1) {
        const handleNumber = pool[j];
        const tooltip = tooltips[handleNumber] as HTMLElement | false;
        if (!tooltip) continue;

        if (j === handlesInPool - 1) {
          let offset = 0;
          poolPositions[poolIndex].forEach((v) => {
            offset += 1000 - v;
          });
          const direction = isVertical ? "bottom" : "right";
          const last =
            1000 - poolPositions[poolIndex][isRtlSlider ? 0 : handlesInPool - 1];
          offset =
            (isRtlDoc && !isVertical ? 100 : 0) + offset / handlesInPool - last;

          tooltip.innerHTML = poolValues[poolIndex].join(separator);
          tooltip.style.display = "block";
          tooltip.style[direction] = `${offset}%`;
        } else {
          tooltip.style.display = "none";
        }
      }
    });
  });
};

const MergingTooltipSlider = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || sliderOf(el)) return;
    const slider = noUiSlider.create(el, {
      start: [20, 75],
      connect: true,
      tooltips: [true, true],
      range: { min: 0, max: 100 },
    });
    mergeTooltips(el, 5, " - ");
    return () => slider.destroy();
  }, []);

  return <div className="slider mt-13" id="slider-merging-tooltips" ref={ref} />;
};

/** Slider whose handle snaps back inside a 20-80 "soft" window. */
const SoftLimitSlider = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || sliderOf(el)) return;
    const slider = noUiSlider.create(el, {
      start: 50,
      range: { min: 0, max: 100 },
      pips: { mode: PipsMode.Values, values: [20, 80], density: 4 },
    });
    slider.on("change", (values, handle) => {
      const value = Number(values[handle]);
      if (value < 20) slider.set(20);
      else if (value > 80) slider.set(80);
    });
    return () => slider.destroy();
  }, []);

  return <div className="slider mb-2" id="soft" ref={ref} />;
};

/** RGB colour picker built from three vertical sliders feeding one swatch. */
const ColorPicker = () => {
  const redRef = useRef<HTMLDivElement>(null);
  const greenRef = useRef<HTMLDivElement>(null);
  const blueRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = [redRef.current, greenRef.current, blueRef.current];
    const result = resultRef.current;
    if (!result || elements.some((el) => !el)) return;

    const colors = [0, 0, 0];
    // wNumb is not bundled, so a plain integer formatter is used instead.
    const intFormat = {
      to: (v: number) => String(Math.round(v)),
      from: (v: string) => Number(v),
    };

    const instances = elements.map((el, i) => {
      const node = el as HTMLDivElement;
      if (sliderOf(node)) return null;
      const slider = noUiSlider.create(node, {
        start: 127,
        connect: [true, false],
        orientation: "vertical",
        range: { min: 0, max: 255 },
        format: intFormat,
      });
      slider.on("update", () => {
        colors[i] = Number(slider.get());
        const rgb = `rgb(${colors.join(",")})`;
        result.style.background = rgb;
        result.style.color = rgb;
      });
      return slider;
    });

    return () => instances.forEach((slider) => slider?.destroy());
  }, []);

  return (
    <>
      <div>
        <div className="sliders" id="red" ref={redRef} />
        <div className="sliders" id="green" ref={greenRef} />
        <div className="sliders" id="blue" ref={blueRef} />
      </div>
      <div id="result" ref={resultRef} />
    </>
  );
};

type VerticalSliderProps = {
  id: string;
  start: number | number[];
  connect?: boolean | "upper" | "lower";
  tooltips?: boolean;
};

const VerticalSlider = ({ id, start, connect, tooltips }: VerticalSliderProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || sliderOf(el)) return;
    el.style.height = "200px";
    const slider = noUiSlider.create(el, {
      start,
      orientation: "vertical",
      behaviour: "drag",
      range: { min: 0, max: 100 },
      ...(connect !== undefined ? { connect } : {}),
      ...(tooltips ? { tooltips: true } : {}),
    });
    return () => slider.destroy();
  }, [start, connect, tooltips]);

  return <div id={id} className="mx-auto" ref={ref} />;
};

const colorRanges: readonly { label: string; className: string }[] = [
  { label: "Primary", className: "primary-range" },
  { label: "Success", className: "success-range" },
  { label: "Info", className: "info-range" },
  { label: "Warning", className: "warning-range" },
  { label: "Danger", className: "danger-range" },
];

const UiRangeslider = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Range Slider</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-12 gap-6 items-baseline">
        <PreviewCard
          title={
            <h2 className="text-lg font-bold c-text mb-0">Basic Range Slider</h2>
          }
          code={`<div class="rangeslider_basic" id="rangeslider_basic"></div>
<script>
	noUiSlider.create(document.getElementById("rangeslider_basic"), {
		start: 127, connect: "lower", range: { min: 0, max: 255 }
	});
</script>`}
        >
          <CommonRangeSlider
            defaultValue={127}
            min={0}
            max={255}
            ariaLabel="Basic range slider"
          />
        </PreviewCard>
        {/* end card */}

        <PreviewCard
          title={
            <h3 className="text-lg font-bold c-text mb-0">Multi Elements Range</h3>
          }
          code={`<div class="rangeslider_multi" id="rangeslider_multi"></div>
<script>
	noUiSlider.create(document.getElementById("rangeslider_multi"), {
		start: [20, 80], connect: true, range: { min: 0, max: 100 }
	});
</script>`}
        >
          <CommonRangeSlider
            defaultValue={[20, 80]}
            min={0}
            max={100}
            ariaLabel="Multi element range slider"
          />
        </PreviewCard>
        {/* end card */}

        <PreviewCard
          title={
            <h4 className="text-lg font-bold c-text mb-0">Value Range Slider</h4>
          }
          code={`<div id="nonlinear"></div>
<div class="flex justify-between mt-3">
	<div class="example-val" id="lower-value"></div>
	<div class="example-val" id="upper-value"></div>
</div>
<script>
	noUiSlider.create(document.getElementById("nonlinear"), {
		connect: true, behaviour: "tap", start: [500, 4000],
		range: { min: [0], "10%": [500, 500], "50%": [4000, 1000], max: [10000] }
	});
</script>`}
        >
          <NonLinearSlider />
        </PreviewCard>
        {/* end card */}

        <PreviewCard
          title={<h5 className="text-lg font-bold c-text mb-0">Color Scheme</h5>}
          code={`<div>
	<h6 class="mb-2 text-sm">Primary</h6>
	<div class="rangeslider_basic primary-range"></div>
</div>
<div class="mt-4">
	<h6 class="mb-2 text-sm">Success</h6>
	<div class="rangeslider_basic success-range"></div>
</div>
<!-- info, warning, danger ranges follow the same pattern -->`}
        >
          {colorRanges.map((range, index) => (
            <div
              key={range.className}
              className={index === colorRanges.length - 1 ? undefined : "mb-4"}
            >
              <h6 className="mb-2 text-sm">{range.label}</h6>
              <BasicSlider className={range.className} />
            </div>
          ))}
        </PreviewCard>
        {/* end card */}

        <PreviewCard
          title={
            <h5 className="text-lg font-bold c-text mb-0">
              Locking Sliders Together
            </h5>
          }
          code={`<div class="slider" id="slider1"></div>
<span class="example-val mt-1" id="slider1-span"></span>
<div class="slider" id="slider2"></div>
<span class="example-val mt-1" id="slider2-span"></span>
<button type="button" id="lockbutton" class="btn bg-primary border border-primary text-white text-center mt-4">Lock</button>`}
        >
          <LockingSliders />
        </PreviewCard>
        {/* end card */}

        <PreviewCard
          title={<h5 className="text-lg font-bold c-text mb-0">Tooltip</h5>}
          code={`<div class="slider mt-13" id="slider-merging-tooltips"></div>
<script>
	noUiSlider.create(document.getElementById("slider-merging-tooltips"), {
		start: [20, 75], connect: true, tooltips: [true, true], range: { min: 0, max: 100 }
	});
</script>`}
        >
          <MergingTooltipSlider />
        </PreviewCard>
        {/* end card */}

        <PreviewCodeToggle
          title={<h5 className="text-lg font-bold c-text mb-0">Soft Limits</h5>}
          code={`<div class="slider mb-2" id="soft"></div>
<script>
	noUiSlider.create(document.getElementById("soft"), {
		start: 50, range: { min: 0, max: 100 },
		pips: { mode: "values", values: [20, 80], density: 4 }
	});
</script>`}
          cardShellClassName="preview-card col-span-12 bg-[var(--card)] rounded-md border border-[var(--border)] p-5 pb-10 mb-6"
        >
          <SoftLimitSlider />
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCard
          className="lg:col-span-6 col-span-12"
          title={<h5 className="text-lg font-bold c-text mb-0">Color Picker</h5>}
          code={`<div class="flex items-center justify-center gap-8">
	<div class="sliders" id="red"></div>
	<div class="sliders" id="green"></div>
	<div class="sliders" id="blue"></div>
	<div id="result"></div>
</div>`}
        >
          <div className="flex items-center justify-center gap-8">
            <ColorPicker />
          </div>
        </PreviewCard>
        {/* end card */}

        <PreviewCard
          className="lg:col-span-6 col-span-12"
          title={<h5 className="text-lg font-bold c-text mb-0">Multi Range</h5>}
          code={`<div id="slider-vertical" class="mx-auto"></div>
<script>
	noUiSlider.create(document.getElementById("slider-vertical"), {
		start: [40, 60], orientation: "vertical", behaviour: "drag", connect: true, range: { min: 0, max: 100 }
	});
</script>`}
        >
          <VerticalSlider id="slider-vertical" start={[40, 60]} connect />
        </PreviewCard>
        {/* end card */}

        <PreviewCard
          className="lg:col-span-6 col-span-12"
          title={<h5 className="text-lg font-bold c-text mb-0">Vertical Range</h5>}
          code={`<div id="slider-connect-upper" class="mx-auto"></div>
<script>
	noUiSlider.create(document.getElementById("slider-connect-upper"), {
		start: 40, orientation: "vertical", behaviour: "drag", connect: "upper", range: { min: 0, max: 100 }
	});
</script>`}
        >
          <VerticalSlider id="slider-connect-upper" start={40} connect="upper" />
        </PreviewCard>
        {/* end card */}

        <PreviewCard
          className="lg:col-span-6 col-span-12"
          title={
            <h5 className="text-lg font-bold c-text mb-0">Vertical Tooltip</h5>
          }
          code={`<div id="slider-vertical-tooltip" class="mx-auto"></div>
<script>
	noUiSlider.create(document.getElementById("slider-vertical-tooltip"), {
		start: 10, orientation: "vertical", behaviour: "drag", tooltips: true, range: { min: 0, max: 100 }
	});
</script>`}
        >
          <VerticalSlider id="slider-vertical-tooltip" start={10} tooltips />
        </PreviewCard>
        {/* end card */}
      </div>
      {/* End grid */}
    </div>
  );
};

export default UiRangeslider;

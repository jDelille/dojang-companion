import React, { useCallback } from "react";
import { Slider } from "primereact/slider";
import { SLIDER_HANDLE, SLIDER_RANGE, SLIDER_ROOT } from "../common/tokens";
import { useControllableState } from "../../hooks/useControllableState";

type CommonRangeSliderProps = {
  value?: number | [number, number];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number | [number, number];
  onChange?: (value: number | [number, number]) => void;
  className?: string;
  ariaLabel?: string;
  showValue?: boolean;
  valuePrefix?: string;
};

const pt = {
  root: { className: SLIDER_ROOT },
  range: { className: SLIDER_RANGE },
  handle: { className: SLIDER_HANDLE },
};

const CommonRangeSlider: React.FC<CommonRangeSliderProps> = ({
  value: controlledValue,
  min = 0,
  max = 100,
  step = 1,
  defaultValue = 50,
  onChange,
  className = "",
  ariaLabel = "Range slider",
  showValue = true,
  valuePrefix = "",
}) => {
  const [value, setValue] = useControllableState<number | [number, number]>({
    value: controlledValue,
    defaultValue,
    onChange,
  });

  const handleChange = useCallback(
    (next: number | number[]) =>
      setValue(
        Array.isArray(next) ? ([next[0], next[1]] as [number, number]) : next,
      ),
    [setValue],
  );

  const readout = Array.isArray(value)
    ? `${valuePrefix}${value[0]} - ${valuePrefix}${value[1]}`
    : `${valuePrefix}${value}`;

  return (
    <div data-component="range-slider" className={className}>
      {showValue && (
        <div className="mb-2 text-[calc(12px*var(--fs))] font-semibold text-[var(--text)]">
          {readout}
        </div>
      )}
      <Slider
        unstyled
        pt={pt}
        value={value}
        onChange={(event) => handleChange(event.value)}
        min={min}
        max={max}
        step={step}
        range={Array.isArray(value)}
        aria-label={ariaLabel}
      />
    </div>
  );
};

export default React.memo(CommonRangeSlider);

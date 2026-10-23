import { useState } from "react";

type SegmentedButtonsProps = {
  label: string;
  options: string[];
  className: string;
  buttonClassName: string;
  onSelect?: (message: string) => void;
};

const SegmentedButtons = ({
  label,
  options,
  className,
  buttonClassName,
  onSelect,
}: SegmentedButtonsProps) => {
  const [selected, setSelected] = useState(0);

  return (
    <div className={className} role="group" aria-label={label}>
      {options.map((option, index) => (
        <button
          key={option}
          type="button"
          className={
            index === selected
              ? `cat-btn active ${buttonClassName}`
              : `cat-btn ${buttonClassName}`
          }
          aria-pressed={index === selected}
          onClick={() => {
            setSelected(index);
            onSelect?.(`${label}: ${option}`);
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default SegmentedButtons;

import React from "react";
import { MultiSelect } from "primereact/multiselect";
import { ChevronDown, X } from "lucide-react";

export type MultipleSelectOption = {
  label: string;
  value: string;
};

type MultipleSelectProps = {
  value?: string[];
  onChange?: (value: string[]) => void;
  options: MultipleSelectOption[];
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  filter?: boolean;
};

const pt = {
  root: { className: "ms-select" },
  labelContainer: { className: "ms-select-label-container" },
  label: { className: "ms-select-label" },
  trigger: { className: "ms-select-trigger" },
  panel: { className: "ms-select-panel" },
  filterInput: { className: "ms-select-filter" },
  list: { className: "ms-select-list" },
  item: { className: "ms-select-item" },
  emptyMessage: { className: "ms-select-empty" },
};

const MultipleSelect: React.FC<MultipleSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Please select",
  className = "",
  ariaLabel = "Multiple select",
  filter = false,
}) => (
  <div data-component="multi-select" className={className}>
    <MultiSelect
      unstyled
      pt={pt}
      value={value ?? []}
      options={options}
      optionLabel="label"
      optionValue="value"
      onChange={(event) => onChange?.(event.value as string[])}
      placeholder={placeholder}
      aria-label={ariaLabel}
      display="chip"
      filter={filter}
      showSelectAll={false}
      showClear
      dropdownIcon={
        <ChevronDown className="ms-select-trigger-icon" aria-hidden="true" />
      }
      removeIcon={<X className="ms-select-chip-remove" aria-hidden="true" />}
      selectedItemTemplate={(selected: string | null) => {
        if (!selected) return null;
        const option = options.find((item) => item.value === selected);
        return (
          <span className="ms-select-chip">{option?.label ?? selected}</span>
        );
      }}
      emptyMessage="No options"
    />
  </div>
);

export default MultipleSelect;

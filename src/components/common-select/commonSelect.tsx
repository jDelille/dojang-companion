import React, { useCallback } from "react";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { ChevronDown, X } from "lucide-react";
import { useControllableState } from "../../hooks/useControllableState";
import {
  CHECKBOX_BOX,
  CHIP,
  CHIP_REMOVE_ICON,
  FIELD,
  PANEL,
  PANEL_EMPTY,
  PANEL_ITEM,
  PANEL_LIST,
  TRIGGER_ICON,
} from "../common/tokens";

export type Option = {
  value: string;
  label: string;
};

export interface SelectProps {
  options: Option[];
  value?: string | null;
  defaultValue?: Option | string | null;
  className?: string;
  /** Extra classes merged onto the field itself (e.g. `py-2 text-sm` to match a toolbar-row sibling). */
  fieldClassName?: string;
  ariaLabel?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (option: Option | null) => void;
}

const toValue = (input: Option | string | null | undefined): string | null =>
  input == null ? null : typeof input === "string" ? input : input.value;

const CommonSelect: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue = null,
  className,
  fieldClassName,
  ariaLabel,
  placeholder = "Select",
  disabled,
  onChange,
}) => {
  const [selected, setSelected] = useControllableState<string | null>({
    value,
    defaultValue: toValue(defaultValue),
  });

  const handleChange = useCallback(
    (next: string | null) => {
      setSelected(next);
      onChange?.(options.find((option) => option.value === next) ?? null);
    },
    [onChange, options, setSelected],
  );

  const dropdownPt = {
    root: { className: fieldClassName ? `${FIELD} ${fieldClassName}` : FIELD },
    input: { className: "flex-1 truncate text-left" },
    trigger: { className: "flex items-center" },
    panel: { className: PANEL },
    list: { className: PANEL_LIST },
    item: { className: PANEL_ITEM },
    emptyMessage: { className: PANEL_EMPTY },
  };

  return (
    <div data-component="select" className={className}>
      <Dropdown
        unstyled
        pt={dropdownPt}
        value={selected}
        options={options}
        optionLabel="label"
        optionValue="value"
        onChange={(event) => handleChange(event.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        disabled={disabled}
        dropdownIcon={<ChevronDown className={TRIGGER_ICON} aria-hidden="true" />}
      />
    </div>
  );
};

export interface TagInputProps {
  options: Option[];
  value?: string[];
  defaultValue?: (Option | string)[];
  className?: string;
  ariaLabel?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (options: Option[]) => void;
}

const multiSelectPt = {
  root: { className: FIELD },
  labelContainer: { className: "flex-1 overflow-hidden" },
  label: { className: "flex flex-wrap items-center gap-1" },
  trigger: { className: "flex items-center" },
  panel: { className: PANEL },
  list: { className: PANEL_LIST },
  item: { className: `${PANEL_ITEM} flex items-center gap-2` },
  headerCheckbox: { box: { className: CHECKBOX_BOX } },
  checkbox: { box: { className: CHECKBOX_BOX } },
  emptyMessage: { className: PANEL_EMPTY },
};

const toValues = (input: (Option | string)[] | undefined): string[] =>
  input?.map((item) => (typeof item === "string" ? item : item.value)) ?? [];

export const CommonTagInput: React.FC<TagInputProps> = ({
  options,
  value,
  defaultValue,
  className,
  ariaLabel,
  placeholder = "Select",
  disabled,
  onChange,
}) => {
  const [selected, setSelected] = useControllableState<string[]>({
    value,
    defaultValue: toValues(defaultValue),
    compare: (values) => values.join(","),
  });

  const handleChange = useCallback(
    (next: string[]) => {
      setSelected(next);
      onChange?.(options.filter((option) => next.includes(option.value)));
    },
    [onChange, options, setSelected],
  );

  return (
    <div data-component="tag-select" className={className}>
      <MultiSelect
        unstyled
        pt={multiSelectPt}
        value={selected}
        options={options}
        optionLabel="label"
        optionValue="value"
        onChange={(event) => handleChange(event.value as string[])}
        placeholder={placeholder}
        aria-label={ariaLabel}
        disabled={disabled}
        display="chip"
        dropdownIcon={<ChevronDown className={TRIGGER_ICON} aria-hidden="true" />}
        removeIcon={<X className={CHIP_REMOVE_ICON} aria-hidden="true" />}
        selectedItemTemplate={(item: string | null) => {
          if (!item) return null;
          const option = options.find((entry) => entry.value === item);
          return <span className={CHIP}>{option?.label ?? item}</span>;
        }}
        emptyMessage="No options"
      />
    </div>
  );
};

export default React.memo(CommonSelect);

import React, { useCallback } from "react";
import { Chips } from "primereact/chips";
import { X } from "lucide-react";
import { CHIP, CHIP_REMOVE_ICON, FIELD } from "../common/tokens";
import { useControllableState } from "../../hooks/useControllableState";

interface TagInputProps {
  value?: string[];
  initialTags?: string[];
  onTagsChange?: (tags: string[]) => void;
  ariaLabel?: string;
  placeholder?: string;
  className?: string;
}

const pt = {
  root: { className: "w-full" },
  container: {
    className: `${FIELD} tag-input-container flex-wrap gap-1 h-auto min-h-[41px] cursor-text`,
  },
  token: { className: CHIP },
  label: { className: "leading-none" },
  inputToken: { className: "flex-1 min-w-[100px]" },
  input: {
    className:
      "w-full bg-transparent border-0 outline-none text-[calc(13px*var(--fs))] text-[var(--text)] placeholder:text-[var(--dim2)]",
  },
};

const CommonTagInputs: React.FC<TagInputProps> = ({
  value,
  initialTags = [],
  onTagsChange,
  ariaLabel = "Tag input",
  placeholder = "Add a tag",
  className = "",
}) => {
  const [tags, setTags] = useControllableState<string[]>({
    value,
    defaultValue: initialTags,
    onChange: onTagsChange,
    compare: (items) => items.join(","),
  });

  const handleChange = useCallback(
    (next: string[] | null) => setTags(next ?? []),
    [setTags],
  );

  return (
    <div data-component="tag-input" className={className}>
      <Chips
        unstyled
        pt={pt}
        value={tags}
        onChange={(event) => handleChange(event.value ?? [])}
        placeholder={placeholder}
        aria-label={ariaLabel}
        separator=","
        allowDuplicate={false}
        removeIcon={<X className={CHIP_REMOVE_ICON} aria-hidden="true" />}
      />
    </div>
  );
};

const MemoCommonTagInputs = React.memo(CommonTagInputs);
MemoCommonTagInputs.displayName = "CommonTagInputs";

export default MemoCommonTagInputs;

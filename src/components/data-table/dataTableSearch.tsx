import React, { useCallback, useEffect } from "react";
import { Search } from "lucide-react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useControllableState } from "../../hooks/useControllableState";
import { FIELD } from "../common/tokens";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = React.memo(
  ({
    value,
    onChange,
    placeholder = "Search",
    ariaLabel = "Search",
    className = "w-64",
  }) => {
    
    const [inputValue, setInputValue] = useControllableState<string>({
      defaultValue: value ?? "",
    });

    const debouncedValue = useDebouncedValue(inputValue, 300);

    useEffect(() => {
      onChange(debouncedValue);
    }, [debouncedValue, onChange]);

    const handleInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) =>
        setInputValue(event.target.value),
      [setInputValue],
    );

    return (
      <div data-component="table-search" className={`relative ${className}`}>
        <input
          type="search"
          className={`${FIELD} h-8 pe-9 text-[calc(12px*var(--fs))]`}
          placeholder={placeholder}
          aria-label={ariaLabel}
          value={inputValue}
          onChange={handleInputChange}
        />
        <Search
          className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dim2)] pointer-events-none"
          aria-hidden="true"
        />
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";

export default SearchInput;

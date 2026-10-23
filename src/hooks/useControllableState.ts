import { useCallback, useState } from "react";

export function useControllableState<T>(options: {
  value?: T;
  defaultValue: T;
  onChange?: (next: T) => void;
  compare?: (value: T) => string;
}): [T, (next: T) => void] {
  const { value, defaultValue, onChange, compare = String } = options;
  const isControlled = value !== undefined;

  const [internal, setInternal] = useState<T>(defaultValue);
  const [lastDefaultKey, setLastDefaultKey] = useState(() => compare(defaultValue));

  const defaultKey = compare(defaultValue);
  if (!isControlled && defaultKey !== lastDefaultKey) {
    setLastDefaultKey(defaultKey);
    setInternal(defaultValue);
  }

  const set = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [isControlled ? value : internal, set];
}

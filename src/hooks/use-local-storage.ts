import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  fallback: T,
  parse: (text: string | null) => T | null,
  stringify: (value: T) => string,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    if (localStorage !== undefined) {
      const newValue = localStorage.getItem(key);
      if (newValue === null) setValue(fallback);
      else setValue(parse(newValue) ?? fallback);
    }
  }, [fallback, key, parse]);

  const update = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (typeof value === "function") {
        setValue((prev) => {
          const newValue = (value as (prev: T) => T)(prev);
          localStorage.setItem(key, stringify(newValue));
          return newValue;
        });
      } else {
        setValue(value);
        localStorage.setItem(key, stringify(value));
      }
    },
    [key, stringify],
  );

  return [value, update];
}

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  fallback: T,
  parse: (text: string | null) => T | null,
  stringify: (value: T) => string,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      return parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, stringify(value));
    } catch {
      console.error("error writing to localStorage");
    }
  }, [key, value, stringify]);

  return [value, setValue];
}

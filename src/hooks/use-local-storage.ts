import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

export function useLocalStorage<T>(
  key: string,
  fallback: T,
  parse: (text: string | null) => T | null,
  stringify: (value: T) => string,
): [T, Dispatch<SetStateAction<T>>] {
  const firstRender = useRef(true);
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    if (localStorage !== undefined) {
      setValue(parse(localStorage.getItem(key)) ?? fallback);
    }
  }, [fallback, key, parse]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
    } else if (localStorage !== undefined) {
      localStorage.setItem(key, stringify(value));
    }
  }, [value, key, stringify]);

  return [value, setValue];
}

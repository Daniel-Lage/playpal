"use client";

import { useCallback, useEffect, useState } from "react";

export function useCookies<T>(
  key: string,
  fallback: T,
  parse: (text: string | null) => T | null,
  stringify: (value: T) => string,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => fallback);

  useEffect(() => {
    const storedValue = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(`${key}=`))
      ?.slice(key.length + 1);

    setValue(parse(storedValue ?? null) ?? fallback);
  }, [key, fallback, parse]);

  const setCookie = useCallback(
    (newValue: T) => {
      document.cookie = `${key}=${encodeURIComponent(stringify(newValue))}; path=/; max-age=31536000; samesite=lax`;
    },
    [key, stringify],
  );

  const update = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (typeof value === "function") {
        setValue((prev) => {
          const newValue = (value as (prev: T) => T)(prev);
          setCookie(newValue);
          return newValue;
        });
      } else {
        setValue(value);
        setCookie(value);
      }
    },
    [setCookie],
  );

  return [value, update];
}

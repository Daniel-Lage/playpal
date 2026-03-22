"use client";

import { Search } from "lucide-react";
import { type ChangeEvent, useRef } from "react";
import { cn } from "~/lib/utils";

export function SearchView({
  value,
  onChange,
  isPrimaryColor = false,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isPrimaryColor?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={cn(
        "flex grow cursor-text gap-2 rounded-full border-2 p-2 focus-within:border-black",
        isPrimaryColor ? "border-background" : "border-secondary-accent",
      )}
      onClick={() => inputRef.current?.focus()}
    >
      <Search />
      <input
        placeholder="Search"
        className={cn(
          "w-36 grow bg-transparent placeholder-zinc-600 outline-none md:w-48",
          isPrimaryColor ? "border-background" : "border-secondary-accent",
        )}
        type="text"
        value={value}
        onChange={onChange}
        ref={inputRef}
      />
    </div>
  );
}

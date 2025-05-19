"use client";

import { Search } from "lucide-react";
import { type ChangeEvent, useRef } from "react";

export function SearchView({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="flex grow cursor-text gap-2 rounded-full border-2 border-primary-accent p-2 focus-within:border-black"
      onClick={() => inputRef.current?.focus()}
    >
      <Search />
      <input
        placeholder="Search something!"
        className="w-36 grow border-primary-accent bg-transparent placeholder-zinc-600 outline-none md:w-48"
        type="text"
        value={value}
        onChange={onChange}
        ref={inputRef}
      />
    </div>
  );
}

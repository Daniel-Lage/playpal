import { Search } from "lucide-react";

export function SearchFormView({ q }: { q?: string }) {
  return (
    <>
      <div className="flex flex-col gap-2 overflow-hidden">
        <form
          action="/search"
          className="flex grow cursor-text gap-2 rounded-full border p-2 focus-within:border-primary"
        >
          <Search />
          <input
            placeholder="Search"
            aria-label="Search"
            name="q"
            defaultValue={q}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            className="w-36 grow bg-transparent placeholder-zinc-600 outline-none md:w-48"
            type="text"
          />
        </form>
      </div>
    </>
  );
}

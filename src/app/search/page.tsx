import { getSearchResults } from "~/server/get-search-results";
import { ResultsView } from "./results-view";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { Search } from "lucide-react";

export default async function SearchPage({
  searchParams: { q },
}: {
  searchParams: { q: string | undefined };
}) {
  if (!q) return <SearchViewForm q={q} />;

  const session = await getServerSession(authOptions);
  const { users, posts } = await getSearchResults(q);

  return (
    <>
      <SearchViewForm q={q} />
      <ResultsView
        users={users}
        posts={posts}
        sessionUserId={session?.user.id}
        lastQueried={new Date()}
        refresh={async (lastQueried: Date) => {
          "use server";
          return await getSearchResults(q, lastQueried);
        }}
      />
    </>
  );
}

async function SearchViewForm({ q }: { q: string | undefined }) {
  return (
    <div className="flex flex-col gap-2 overflow-hidden rounded-md bg-primary p-2">
      <h1 className="p-2 text-xl font-bold">Search</h1>
      <form
        action="/search"
        className="flex grow cursor-text gap-2 rounded-full border-2 border-primary-accent p-2 focus-within:border-black"
      >
        <Search />
        <input
          name="q"
          defaultValue={q}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className="w-36 grow border-primary-accent bg-transparent placeholder-zinc-600 outline-none md:w-48"
          type="text"
        />
      </form>
    </div>
  );
}

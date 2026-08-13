import { getSearchResults } from "~/server/get-search-results";
import { ResultsView } from "~/components/views/results-view";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { Search } from "lucide-react";

export default async function SearchMainPage({
  searchParams: { q },
}: {
  searchParams: { q: string | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!q) return <SearchViewForm />;

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

async function SearchViewForm({ q }: { q?: string }) {
  return (
    <>
      <div className="flex flex-col gap-2 overflow-hidden p-2">
        <form
          action="/search"
          className="flex grow cursor-text gap-2 rounded-full border p-2 focus-within:border-primary"
        >
          <Search />
          <input
            placeholder="Search"
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

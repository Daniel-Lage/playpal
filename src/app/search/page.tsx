import { getSearchResults } from "~/server/get-search-results";
import { ResultsView } from "./results-view";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";

export default async function SearchPage({
  searchParams: { q },
}: {
  searchParams: { q: string | undefined };
}) {
  if (!q)
    return (
      <form action="/search" className="flex gap-2 rounded-md bg-main-1 p-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search something!"
          className="grow select-text bg-transparent placeholder-zinc-600 caret-black outline-none"
          type="text"
        />
        <button type="submit" className="pl-2 font-bold">
          Search
        </button>
      </form>
    );

  const session = await getServerSession(authOptions);
  const { users, posts } = await getSearchResults(q);

  return (
    <>
      <form action="/search" className="flex gap-2 rounded-md bg-main-1 p-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search something!"
          className="grow select-text bg-transparent placeholder-zinc-600 caret-black outline-none"
          type="text"
        />
        <button type="submit" className="pl-2 font-bold">
          Search
        </button>
      </form>
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

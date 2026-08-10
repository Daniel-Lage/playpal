import { getSearchResults } from "~/server/get-search-results";
import { ResultsView } from "./results-view";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "~/lib/auth";
import { Search } from "lucide-react";
import { PageView } from "~/components/page-view";

function storageKeyToCookieName(key: string) {
  return `playpal.${key.replaceAll(":", ".")}`;
}

export default async function SearchPage({
  searchParams: { q },
}: {
  searchParams: { q: string | undefined };
}) {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();
  const initialCollapsed =
    cookieStore.get(
      storageKeyToCookieName(`${session?.user.id}:side_bar_collapsed`),
    )?.value === "true";

  if (!q)
    return (
      <PageView sessionUser={session?.user} initialCollapsed={initialCollapsed}>
        <SearchViewForm />
      </PageView>
    );

  const { users, posts } = await getSearchResults(q);

  return (
    <PageView sessionUser={session?.user} initialCollapsed={initialCollapsed}>
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
    </PageView>
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

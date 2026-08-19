import { getSearchResults } from "~/server/get-search-results";
import { ResultsView } from "~/components/views/results-view";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { SearchFormView } from "~/components/views/search-form-view";

export default async function SearchMainPage({
  searchParams: { q },
}: {
  searchParams: { q: string | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!q)
    return (
      <div className="p-2">
        <SearchFormView />
      </div>
    );

  const { users, posts } = await getSearchResults(q);

  return (
    <>
      <div className="p-2">
        <SearchFormView q={q} />
      </div>
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

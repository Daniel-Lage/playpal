import type { Metadata } from "next";
import { getSearchResults } from "~/server/get-search-results";
import { ResultsView } from "~/components/views/results-view";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { SearchFormView } from "~/components/views/search-form-view";

export async function generateMetadata({
  searchParams: { q },
}: {
  searchParams: { q?: string };
}): Promise<Metadata> {
  const query = q?.trim();

  if (!query) {
    return {
      title: "Playpal | Search",
      description: "Search on Playpal",
      openGraph: {
        type: "website",
        images: ["/favicon.ico"],
        url: `${process.env.NEXTAUTH_URL}/search`,
      },
    };
  }

  return {
    title: `Playpal | Search: ${query}`,
    description: `Search results for ${query} on Playpal`,
    openGraph: {
      type: "website",
      images: ["/favicon.ico"],
      url: `${process.env.NEXTAUTH_URL}/search?q=${encodeURIComponent(query)}`,
    },
  };
}

export default async function SearchPage({
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

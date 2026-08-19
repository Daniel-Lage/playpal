import { getServerSession } from "next-auth";
import { SearchFormView } from "~/components/views/search-form-view";
import { WhoToFollowCard } from "~/components/who-to-follow-card";
import { authOptions } from "~/lib/auth";
import { getUsers } from "~/server/get-users";

export default async function CatchAllSideBar() {
  const session = await getServerSession(authOptions);

  const users = (await getUsers())?.filter(
    (user) => user.id !== session?.user.id,
  );

  if (!users || users.length === 0) {
    return (
      <div className="absolute top-24 w-[16vw]">
        <SearchFormView />
      </div>
    );
  }

  return (
    <>
      <div className="absolute top-24 w-[16vw]">
        <SearchFormView />
      </div>
      <WhoToFollowCard users={users} sessionUserId={session?.user.id} />
    </>
  );
}

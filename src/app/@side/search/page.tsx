import { getServerSession } from "next-auth";
import { WhoToFollowCard } from "~/components/who-to-follow-card";
import { authOptions } from "~/lib/auth";
import { getUsers } from "~/server/get-users";

export default async function SearchSideBar() {
  const session = await getServerSession(authOptions);

  const users = (await getUsers())?.filter(
    (user) => user.id !== session?.user.id,
  );

  if (!users || users.length === 0) {
    return null;
  }

  return <WhoToFollowCard users={users} sessionUserId={session?.user.id} />;
}

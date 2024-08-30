import { getServerSession } from "next-auth";
import { UserView } from "../_components/userview";
import { authOptions } from "~/lib/auth";
import { Playlists } from "../_components/playlists";

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session?.user) return <UserView session={session} />;

  return (
    <>
      <UserView session={session} />
      <Playlists session={session} />
    </>
  );
}

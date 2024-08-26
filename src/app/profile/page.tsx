import { getServerSession } from "next-auth";
import { Playlists } from "../_components/playlists";
import { UserView } from "../_components/userview";

export default async function Profile() {
  const session = await getServerSession();

  if (!session?.user)
    return (
      <>
        <div className="text-white">Error 302: Unauthorized</div>
      </>
    );

  return (
    <>
      <UserView session={session}></UserView>
      <Playlists />
    </>
  );
}

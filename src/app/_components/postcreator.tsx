import { type Session } from "next-auth";
import { UserView } from "./userview";

export function PostCreator({ session }: { session: Session }) {
  return (
    <UserView session={session}>
      <input
        type="text"
        className="grow bg-transparent placeholder-slate-400 outline-none"
        placeholder="Write Something!"
      />
    </UserView>
  );
}

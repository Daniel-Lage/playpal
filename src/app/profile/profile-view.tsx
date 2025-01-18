"use client";

import { SignInButton } from "~/app/_components/signin-button";
import {
  ProfileTab,
  ProfileTabOptions,
  type UserObject,
} from "~/models/user.model";
import useLocalStorage from "~/hooks/use-local-storage";
import SimpleUserView from "../_components/simple-user-view";
import ProfileFeed from "./profile-feed";

export function ProfileView({
  sessionUserId,
  user,
}: {
  sessionUserId: string | undefined;
  user: UserObject;
}) {
  const [profileTab, setProfileTab] = useLocalStorage<ProfileTab>(
    `${sessionUserId}:profile_tab`,
    ProfileTab.Posts,
    (text) => {
      if (ProfileTabOptions.some((pto) => pto === text))
        return text as ProfileTab;
      return null;
    },
    (pt) => pt, // already is text so no conversion is needed
  );

  if (!user?.image || !user?.name) return <SignInButton />;

  return (
    <div>
      <div className="flex flex-col gap-2 overflow-hidden bg-main md:rounded-t-xl">
        <SimpleUserView sessionUserId={sessionUserId} user={user} />

        <div className="flex flex-col bg-main2">
          <div className="flex font-bold">
            {ProfileTabOptions.map((ProfileTabOption) => (
              <button
                key={ProfileTabOption}
                className={`flex w-1/2 justify-center ${profileTab === ProfileTabOption ? "bg-main" : "bg-main2"} p-1 text-xs md:text-base`}
                onClick={() => setProfileTab(ProfileTabOption)}
              >
                {ProfileTabOption}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ProfileFeed
        sessionUserId={sessionUserId}
        user={user}
        profileTab={profileTab}
      />
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { redirect } from "next/navigation";
import { SetUpView } from "./setup-view";
import { utapi } from "~/server/uploadthing";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  return (
    <SetUpView
      user={session?.user}
      deleteImage={async (image: string) => {
        "use server";
        // image is in url form, we need to extract the key
        const previousImageKey = image.split("/").pop();
        void utapi.deleteFiles(previousImageKey!);
      }}
    />
  );
}

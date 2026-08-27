import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { redirect } from "next/navigation";
import { SetUpView } from "~/components/views/setup-view";
import { utapi } from "~/server/uploadthing";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Playpal | Set up your profile",
    description: "Finish setting up your Playpal profile",
    openGraph: {
      type: "website",
      images: ["/favicon.ico"],
      url: `${process.env.NEXTAUTH_URL}/setup`,
    },
  };
}

export default async function SetUpPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  return (
    <SetUpView
      user={session?.user}
      deleteImage={async (image: string) => {
        "use server";
        const previousImageKey = image.split("/").pop();
        void utapi.deleteFiles(previousImageKey!);
      }}
    />
  );
}

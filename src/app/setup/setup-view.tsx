"use client";

import { useRef, useState } from "react";
import type { User } from "next-auth";
import { Button } from "~/components/ui/button";
import { ArrowBigRight, Check, Edit, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { updateName } from "~/server/update-name";
import { updateImage } from "~/server/update-image";

import { UserImage } from "~/components/user-image";
import { Input } from "~/components/ui/input";
import { uploadFiles } from "~/helpers/uploadthing";
import { ActionStatus } from "~/models/status.model";

export function SetUpView({
  user,
  deleteImage,
}: {
  user: User;
  deleteImage: (image: string) => Promise<void>;
}) {
  const router = useRouter();
  const [name, setName] = useState<string | undefined>();
  const [image, setImage] = useState<string | undefined>();
  const [imageStatus, setImageStatus] = useState<ActionStatus>(
    ActionStatus.Inactive,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="grid h-screen w-full place-items-center">
        <div className="flex w-96 flex-col gap-4 rounded-md bg-primary p-8">
          <h1 className="p-2 text-xl font-bold">
            {user.name ? "Edit Profile" : "Finish Setting Up"}
          </h1>

          <div className="flex w-full justify-center">
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImageStatus(ActionStatus.Active);
                uploadFiles("imageUploader", { files: [file] })
                  .then((res) => {
                    setImageStatus(ActionStatus.Success);

                    setTimeout(() => {
                      setImageStatus(ActionStatus.Inactive);
                    }, 4000);
                    if (image) void deleteImage(image);
                    setImage(res[0]?.ufsUrl);
                  })
                  .catch(() => {
                    setImageStatus(ActionStatus.Failure);

                    setTimeout(() => {
                      setImageStatus(ActionStatus.Inactive);
                    }, 4000);
                  });
              }}
              accept="image/*"
            />
            <div className="relative w-40">
              {imageStatus === ActionStatus.Active && (
                <div className="absolute flex h-40 w-40 items-center justify-center rounded-full backdrop-brightness-50">
                  <div className="h-16 w-16 animate-spin rounded-full border-8 border-primary border-b-transparent"></div>
                </div>
              )}
              <UserImage
                size={160}
                image={image ?? user.image}
                name={user.name}
              />

              <div className="absolute bottom-0 right-0">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="icon"
                  className="bg-secondary"
                >
                  <Edit />
                </Button>
              </div>
            </div>
          </div>

          <Input
            type="text"
            placeholder="User Name"
            value={name ?? user.name ?? ""}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />

          <Button
            size="nav"
            variant="login"
            onClick={() => {
              const updates = [];
              if (image) updates.push(updateImage(user.id, image, user?.image));

              if (name && name !== user.name)
                updates.push(updateName(user.id, name));

              if (updates.length > 0)
                Promise.all(updates)
                  .then(() => {
                    router.push("/");
                  })
                  .catch(console.error);
            }}
          >
            <ArrowBigRight />
            <div className="text-lg font-bold">Continue</div>
          </Button>
        </div>
      </div>
      {imageStatus !== ActionStatus.Active &&
        imageStatus !== ActionStatus.Inactive && (
          <StatusMessage status={imageStatus} />
        )}
    </>
  );
}

function StatusMessage({ status }: { status: ActionStatus }) {
  if (status === ActionStatus.Success)
    return (
      <div className="margin-auto popup fixed bottom-20 flex w-full flex-col self-center md:bottom-6">
        <div className="relative flex h-8 w-[90%] items-center justify-center gap-4 self-center rounded-md bg-green-500 px-4 py-8 md:w-fit">
          <Check size={40} />
          Image Uploaded Sucessfully
        </div>
      </div>
    );

  return (
    <div className="margin-auto popup fixed bottom-20 flex w-full flex-col self-center md:bottom-6">
      <div className="relative flex h-8 w-[90%] items-center justify-center gap-4 self-center rounded-md bg-red-500 px-4 py-8 md:w-fit">
        <X size={40} />
        Internal Server Error
      </div>
    </div>
  );
}

import { cn } from "~/lib/utils";

export enum PopupType {
  Success,
  ServerError,
  UserError,
}

export function PopupView({
  type,
  children,
}: {
  type: PopupType;
  children: React.ReactNode;
}) {
  return (
    <div className="margin-auto popup fixed bottom-20 flex w-full flex-col self-center md:bottom-6">
      <div
        className={cn(
          "relative flex h-8 w-[90%] items-center justify-center gap-4 self-center rounded-md px-4 py-8 md:w-fit",
          type === PopupType.Success
            ? "bg-green-500"
            : type === PopupType.ServerError
              ? "bg-red-500"
              : "bg-yellow-500",
        )}
      >
        {children}
      </div>
    </div>
  );
}

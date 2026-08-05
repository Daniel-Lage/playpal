import { cn } from "~/lib/utils";

export function TabLinkButton({
  onClick,
  className,
  children,
}: {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className={cn(
        "flex h-10 w-full items-center justify-center rounded-md font-bold underline-offset-4 hover:underline [&_svg]:size-6",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

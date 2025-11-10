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
        className,
        "h-10 w-full justify-center rounded-md font-bold underline-offset-4 hover:underline md:pl-4 [&_svg]:size-6",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

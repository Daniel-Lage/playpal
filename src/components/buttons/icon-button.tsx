import { cn } from "~/lib/utils";

export function IconButton({
  onClick,
  className,
  children,
  disabled,
  big,
}: {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  big?: boolean;
}) {
  return (
    <button
      className={cn(
        className,
        "shrink-0 items-center justify-center rounded-md p-2 hover:backdrop-brightness-95 [&_svg]:shrink-0",
        big
          ? "flex h-10 w-10 [&_svg]:size-7"
          : "flex h-5 w-5 md:h-8 md:w-8 [&_svg]:size-4 md:[&_svg]:size-6",
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

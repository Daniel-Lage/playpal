import { cn } from "~/lib/utils";

export function IconButton({
  onClick,
  className,
  children,
  disabled,
}: {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      className={cn(
        className,
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md p-2 hover:backdrop-brightness-95 [&_svg]:size-6 [&_svg]:shrink-0",
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

import { cn } from "~/lib/utils";

export function MenuButton({
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
        "flex h-9 w-[200px] items-center gap-2 p-0 px-2 font-bold hover:backdrop-brightness-95 [&_svg]:size-6",
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

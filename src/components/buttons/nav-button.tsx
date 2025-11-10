import { cn } from "~/lib/utils";

export function NavButton({
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
        "flex h-9 w-9 min-w-0 items-center justify-center gap-4 overflow-hidden text-clip rounded-md bg-terciary-accent hover:brightness-95 md:h-12 md:w-full md:justify-start md:pl-4 [&_svg]:size-6 [&_svg]:shrink-0",
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

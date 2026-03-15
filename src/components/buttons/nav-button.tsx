import { cn } from "~/lib/utils";

export function NavButton({
  children,
  collapsed,
  href,
  active,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  collapsed?: boolean;
  active: boolean;
}) {
  return (
    <a
      role="button"
      href={href}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 min-w-0 items-center justify-center gap-4 overflow-hidden text-clip rounded-full bg-primary-accent hover:brightness-95 md:h-12 [&_svg]:size-6 [&_svg]:shrink-0",
        collapsed
          ? "md:w-12"
          : "md:w-44 md:justify-start md:rounded-2xl md:px-4",
        active ? "font-bold" : "font-normal",
      )}
    >
      {children}
    </a>
  );
}

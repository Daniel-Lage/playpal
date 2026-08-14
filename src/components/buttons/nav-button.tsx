import Link from "next/link";
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
  const className = cn(
    "flex h-9 w-9 min-w-0 items-center justify-center gap-4 overflow-hidden text-clip rounded-full bg-primary text-primary-foreground hover:brightness-95 md:h-12 [&_svg]:size-6 [&_svg]:shrink-0 [&_svg]:stroke-primary-foreground",
    collapsed ? "md:w-12" : "md:w-44 md:justify-start md:px-3",
    active ? "font-bold" : "font-normal",
  );

  if (href != null) {
    return (
      <Link href={href} role="button" className={className}>
        {children}
      </Link>
    );
  }

  if (onClick != null) {
    return (
      <button className={className} onClick={onClick} role="button">
        {children}
      </button>
    );
  }

  return <div className={className}>{children}</div>;
}

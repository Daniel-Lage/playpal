import Link from "next/link";
import { cn } from "~/lib/utils";

export function TabLinkButton({
  onClick,
  href,
  className: classNameProp,
  children,
}: {
  onClick?: () => void;
  href?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const className = cn(
    "flex h-10 w-full items-center justify-center rounded-md font-bold underline-offset-4 hover:underline [&_svg]:size-6",
    classNameProp,
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

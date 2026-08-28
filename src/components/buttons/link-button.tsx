import Link from "next/link";
import { cn } from "~/lib/utils";

export function LinkButton({
  onClick,
  className: classNameProp,
  children,
  href,
  disabled,
}: {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  href?: string;
}) {
  const className = cn(
    "w-auto px-4 font-bold underline-offset-4 hover:underline",
    classNameProp,
  );

  if (disabled) return <div className={className}>{children}</div>;

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

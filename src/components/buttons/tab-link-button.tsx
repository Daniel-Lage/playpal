import { cn } from "~/lib/utils";

export function TabLinkButton({
  onClick,
  href,
  className,
  children,
}: {
  onClick?: () => void;
  href?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      className={cn(
        "flex h-10 w-full items-center justify-center rounded-md font-bold underline-offset-4 hover:underline [&_svg]:size-6",
        className,
      )}
      onClick={onClick}
      href={href}
      role="button"
    >
      {children}
    </a>
  );
}

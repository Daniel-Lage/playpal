import { cn } from "~/lib/utils";

export function FormButton({
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
        "flex h-12 w-full items-center justify-start gap-4 self-center rounded-md bg-primary-accent pl-4 hover:brightness-95 [&_svg]:size-6",
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

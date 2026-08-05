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
        "flex h-12 w-full items-center justify-start gap-4 self-center rounded-md border pl-4 hover:brightness-95 [&_svg]:size-6",
        className,
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

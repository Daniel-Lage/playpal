import { cn } from "~/lib/utils";

export function LinkButton({
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
        "w-auto px-4 font-bold underline-offset-4 hover:underline",
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

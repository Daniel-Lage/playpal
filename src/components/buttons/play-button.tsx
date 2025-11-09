export function PlayButton({
  onClick,
  children,
  disabled,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary p-4 drop-shadow-md hover:brightness-95 [&_svg]:size-8 [&_svg]:shrink-0"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

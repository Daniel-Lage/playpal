export function ItemsView({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 p-2 md:gap-4 md:p-4">{children}</div>
  );
}

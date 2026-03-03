export function MainContentView({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 p-2 md:gap-4 md:p-4 md:pl-[calc(var(--start-nav-w)_+_16px)] md:pr-[calc(var(--end-nav-w)_+_16px)]">
      {children}
    </div>
  );
}

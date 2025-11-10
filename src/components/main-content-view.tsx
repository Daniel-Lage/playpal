export function MainContentView({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 p-2 md:mx-[19vw] md:gap-4 md:p-4">
      {children}
    </div>
  );
}

export function OneElementView({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-svh w-full items-center justify-center">
      <div className="flex w-96 flex-col gap-4 rounded-md bg-secondary p-4">
        {children}
      </div>
    </div>
  );
}

export function OneElementView({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-svh w-full items-center justify-center">
      <div className="bg-container flex flex-col gap-4 rounded-md border p-4 md:w-96">
        {children}
      </div>
    </div>
  );
}

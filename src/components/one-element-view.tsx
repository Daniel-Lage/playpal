export function OneElementView({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-[-48px] grid h-screen w-full place-items-center md:my-0">
      <div className="relative flex w-[calc(100vw_-_32px)] max-w-96 flex-col gap-4 rounded-md bg-primary p-4">
        {children}
      </div>
    </div>
  );
}

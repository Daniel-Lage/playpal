export function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed left-0 top-0 z-10 flex h-svh w-svw items-center justify-center backdrop-brightness-50">
      {children}
    </div>
  );
}

export function PageView({
  children,
  sideContent,
}: {
  children: React.ReactNode;
  sideContent?: React.ReactNode;
}) {
  return (
    <>
      <div className="md:pl-[calc(var(--nav-bar-w))] md:pr-[calc(var(--side-bar-w))]">
        {children}
      </div>
      <div className="fixed right-0 top-0 hidden h-screen w-[--side-bar-w] overflow-y-auto border-l-2 border-background bg-primary md:flex md:flex-col">
        {sideContent}
      </div>
    </>
  );
}

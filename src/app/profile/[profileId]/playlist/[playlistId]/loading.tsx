import Image from "next/image";

export default async function LoadingPlaylistPage() {
  return (
    <>
      <div className="flex flex-col overflow-hidden md:rounded-2xl">
        <div className="flex flex-col items-center gap-2 bg-main p-2 md:flex-row md:items-start">
          <div className="aspect-square w-[200px] grow-0 rounded-xl bg-gray-950"></div>
          <div className="flex h-full w-full">
            <div className="flex grow flex-col items-start truncate">
              <div className="w-20 bg-gray-950"></div>
              <div className="w-28 bg-gray-950"></div>
              <div className="w-10 bg-gray-950"></div>
            </div>

            <div className="h-8 w-8 rounded-full bg-gray-950"></div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 bg-main2 p-2 md:flex-row">
          <div className="flex gap-2">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-main3 pl-1 pr-3 text-center">
              <div className="font-bold text-transparent md:p-1">Sort by</div>
              <select disabled={true}></select>
            </div>

            <button>
              <Image
                height={32}
                width={32}
                src="/direction.png"
                alt="direction icon"
              />
            </button>
          </div>
          <div className="w-28 bg-gray-950"></div>

          <Image height={32} width={32} src="/play.png" alt="play icon" />
        </div>
      </div>
    </>
  );
}

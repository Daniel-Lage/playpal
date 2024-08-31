import Image from "next/image";

export function Logo() {
  return (
    <div className="item flex aspect-square h-12 items-center rounded-md bg-main3 p-2">
      <Image width={32} height={38} src="/favicon.ico" alt="playpal logo" />
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { cn } from "~/lib/utils";
import type { IMetadata } from "~/models/post.model";

export function MetadataCard({
  metadata,
  isPrimaryColor,
}: {
  metadata: IMetadata;
  isPrimaryColor?: boolean;
}) {
  return (
    <Link
      href={metadata?.og_url ?? ""}
      className={cn(
        "flex w-full flex-1 items-start gap-2 overflow-hidden rounded-md p-2",
        isPrimaryColor ? "bg-primary" : "bg-secondary-accent",
      )}
    >
      {metadata?.og_image && (
        <Image
          width={100}
          height={100}
          className="max-h-[100px] shrink-0 overflow-hidden rounded-md"
          src={metadata?.og_image ?? ""}
          alt={metadata.og_title ?? "image"}
        />
      )}
      <div className="overflow-hidden">
        <div className="w-full truncate text-left text-xl font-bold md:text-2xl">
          {metadata.og_title ?? metadata.og_site_name}
        </div>
        <div className="truncate text-left text-sm">
          {metadata.og_description}
        </div>

        <div className="truncate text-left text-sm font-bold text-background">
          {metadata.og_url}
        </div>
      </div>
    </Link>
  );
}

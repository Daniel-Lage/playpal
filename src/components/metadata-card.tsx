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
          width={96}
          height={96}
          className="h-16 w-16 shrink-0 overflow-hidden rounded-md md:h-24 md:w-24"
          src={metadata?.og_image ?? ""}
          alt={metadata.og_title ?? "image"}
        />
      )}
      <div className="overflow-hidden">
        <div className="w-full truncate text-left font-bold md:text-xl">
          {metadata.og_title ?? metadata.og_site_name}
        </div>
        <div className="truncate text-left text-xs md:text-sm">
          {metadata.og_description}
        </div>

        <div className="truncate text-left text-xs font-bold text-background md:text-sm">
          {metadata.og_url}
        </div>
      </div>
    </Link>
  );
}

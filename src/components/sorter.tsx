import { ChevronDown, ChevronUp } from "lucide-react";
import { Select } from "./select";
import { IconButton } from "./buttons/icon-button";
import { cn } from "~/lib/utils";

export function Sorter({
  title,
  onSelect,
  value,
  options,
  reversed,
  reverse,
  isPrimaryColor,
}: {
  title: string;
  onSelect: (value: string) => void;
  value: string;
  options: string[];
  reversed: boolean;
  reverse: () => void;
  isPrimaryColor?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-fit grow-0 items-center justify-center gap-2 rounded-md border-2 text-center text-sm",
        isPrimaryColor ? "border-background" : "border-secondary-accent",
      )}
    >
      <Select
        title={title}
        onSelect={onSelect}
        value={value}
        options={options}
      />
      <IconButton onClick={reverse}>
        {reversed ? <ChevronDown /> : <ChevronUp />}
      </IconButton>
    </div>
  );
}

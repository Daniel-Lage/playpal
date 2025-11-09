import { ChevronDown, ChevronUp } from "lucide-react";
import { Select } from "./select";
import { IconButton } from "./buttons/icon-button";

export function Sorter({
  title,
  onSelect,
  value,
  options,
  reversed,
  reverse,
}: {
  title: string;
  onSelect: (value: string) => void;
  value: string;
  options: string[];
  reversed: boolean;
  reverse: () => void;
}) {
  return (
    <div className="flex h-fit grow-0 items-center justify-center gap-2 rounded-md border-2 border-primary-accent text-center text-sm">
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

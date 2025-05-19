import { ChevronDown, ChevronUp } from "lucide-react";
import { Select } from "./select";
import { Button } from "./ui/button";

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
    <div className="border-primary-accent flex h-fit grow-0 items-center justify-center gap-2 rounded-md border-2 text-center text-sm">
      <Select
        title={title}
        onSelect={onSelect}
        value={value}
        options={options}
      />
      <Button onClick={reverse}>
        {reversed ? <ChevronDown /> : <ChevronUp />}
      </Button>
    </div>
  );
}

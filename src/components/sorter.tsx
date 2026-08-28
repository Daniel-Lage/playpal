import { Select } from "./select";

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
    <div className="flex h-fit grow-0 items-center justify-center gap-2 rounded-md border text-center text-sm">
      <Select
        title={title}
        onSelect={onSelect}
        value={value}
        options={options}
        reversed={reversed}
        reverse={reverse}
      />
    </div>
  );
}

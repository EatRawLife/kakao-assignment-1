"use client";

type Props = {
  label: string;
  onFilter: () => void;
  active: boolean;
};

export default function FilterButton({ label, onFilter, active }: Props) {
  return (
    <button
      onClick={onFilter}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-[#672be0] text-white"
          : "bg-white text-zinc-600 border border-zinc-200 hover:border-[#672be0] hover:text-[#672be0]"
      }`}
    >
      {label}
    </button>
  );
}

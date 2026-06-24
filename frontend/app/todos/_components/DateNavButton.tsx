"use client";

type Props = {
  direction: "left" | "right";
  onClick: () => void;
};

export default function DateNavButton({ direction, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:border-[#672be0] hover:text-[#672be0] transition-colors text-lg leading-none"
    >
      {direction === "left" ? "‹" : "›"}
    </button>
  );
}

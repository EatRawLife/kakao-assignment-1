"use client";

import { useState, useImperativeHandle, type Ref } from "react";

export type TodoTextInputHandle = { submit: () => void };

type Props = {
  placeholder?: string;
  onSubmit: (text: string) => void;
  buttonLabel?: string;
  errorMessage?: string | null;
  ref?: Ref<TodoTextInputHandle>;
};

export default function TodoTextInput({ placeholder, onSubmit, buttonLabel, errorMessage, ref }: Props) {
  const [value, setValue] = useState("");

  useImperativeHandle(ref, () => ({ submit: handleSubmit }));

  function handleSubmit() {
    onSubmit(value);
    if (value.trim()) setValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#672be0] focus:ring-2 focus:ring-[#672be0]/20 bg-white transition-shadow"
        />
        {buttonLabel && (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-xl bg-[#672be0] text-white text-sm font-medium hover:bg-[#5520c0] transition-colors"
          >
            {buttonLabel}
          </button>
        )}
      </div>
      {errorMessage && <p className="text-xs text-red-500 px-1">{errorMessage}</p>}
    </div>
  );
}

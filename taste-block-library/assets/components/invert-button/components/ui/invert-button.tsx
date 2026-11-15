import React from "react";

export interface InvertButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
}

export const InvertButton = ({
  children = "Invert it",
  className = "",
  ...props
}: InvertButtonProps) => {
  return (
    <button
      type="button"
      className={`px-8 py-2 rounded-md bg-teal-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-teal-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};

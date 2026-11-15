import React from "react";

export interface InsetBorderButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
}

export const InsetBorderButton = ({
  children = "Playlist",
  className = "",
  ...props
}: InsetBorderButtonProps) => {
  return (
    <button
      type="button"
      className={`shadow-[inset_0_0_0_2px_#616467] text-black px-12 py-4 rounded-full tracking-widest uppercase font-bold bg-transparent hover:bg-[#616467] hover:text-white dark:text-neutral-200 transition duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#616467] ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};

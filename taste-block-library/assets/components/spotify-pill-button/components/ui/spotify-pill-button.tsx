import React from "react";

export interface SpotifyPillButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
}

export const SpotifyPillButton = ({
  children = "Spotify",
  className = "",
  ...props
}: SpotifyPillButtonProps) => {
  return (
    <button
      type="button"
      className={`px-12 py-4 rounded-full bg-[#1ED760] font-bold text-white tracking-widest uppercase transform hover:scale-105 hover:bg-[#21e065] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1ED760] ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};

import React from "react";

export interface LitUpBordersButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
}

export const LitUpBordersButton = ({
  children = "Lit up borders",
  className = "",
  ...props
}: LitUpBordersButtonProps) => {
  return (
    <button
      type="button"
      className={`p-[3px] relative cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg ${className}`.trim()}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg pointer-events-none" />
      <div className="px-8 py-2 bg-black rounded-[6px] relative transition duration-200 text-white group-hover:bg-transparent">
        {children}
      </div>
    </button>
  );
};

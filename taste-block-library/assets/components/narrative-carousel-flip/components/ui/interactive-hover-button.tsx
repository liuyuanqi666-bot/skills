import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../../../../shared/utils";

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  isTriggered?: boolean;
}

export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", isTriggered = false, className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative w-auto cursor-pointer overflow-hidden rounded-full border border-transparent bg-white px-6 py-2.5 text-center font-semibold text-black shadow-lg hover:shadow-xl transition-all duration-300",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        <div
          className={cn(
            "h-2 w-2 rounded-full bg-black transition-all duration-500 group-hover:scale-[100]",
            isTriggered && "scale-[100]"
          )}
        />
        <span
          className={cn(
            "inline-block text-xs sm:text-sm transition-all duration-500 group-hover:translate-x-12 group-hover:opacity-0",
            isTriggered && "translate-x-12 opacity-0"
          )}
        >
          {children || text}
        </span>
      </div>
      <div
        className={cn(
          "absolute top-0 left-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-white opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100",
          isTriggered && "translate-x-0 opacity-100"
        )}
      >
        <span className="text-xs sm:text-sm font-semibold">{children || text}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

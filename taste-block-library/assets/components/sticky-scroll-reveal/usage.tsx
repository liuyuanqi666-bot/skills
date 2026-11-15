import React from "react";
import { StickyScrollRevealDemo } from "./StickyScrollRevealDemo";

export default function App() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#04060d] p-3 sm:p-6 lg:p-10 antialiased selection:bg-cyan-500/30">
      <StickyScrollRevealDemo />
    </div>
  );
}

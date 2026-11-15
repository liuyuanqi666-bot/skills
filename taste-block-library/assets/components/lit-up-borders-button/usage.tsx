import { useState } from "react";
import { LitUpBordersButton } from "./components/ui/lit-up-borders-button";

export default function App() {
  const [clickCount, setClickCount] = useState(0);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-6 font-sans">
      <header className="mb-8 text-center">
        <p className="text-xs uppercase tracking-widest text-neutral-400 mb-1">
          Invocation Fixture (Port 5217)
        </p>
        <h1 className="text-xl font-bold">lit-up-borders-button--react</h1>
      </header>

      <main className="flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="flex min-h-32 w-full items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 p-8 shadow-inner">
          <LitUpBordersButton onClick={() => setClickCount(c => c + 1)}>
            Lit up borders
          </LitUpBordersButton>
        </div>
      </main>

      <footer className="mt-8 flex flex-col items-center gap-2">
        <p className="text-xs text-neutral-400">
          点击计数: <span className="font-mono font-bold text-emerald-400">{clickCount}</span> 次
        </p>
      </footer>
    </div>
  );
}

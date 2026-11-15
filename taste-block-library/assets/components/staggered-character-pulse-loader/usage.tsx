import { useState } from "react";
import { LoaderFive } from "./components/ui/loader";

export default function App() {
  const [remountKey, setRemountKey] = useState(0);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-6 font-sans">
      <header className="mb-8 text-center">
        <p className="text-xs uppercase tracking-widest text-neutral-400 mb-1">
          Invocation Fixture (Port 5214)
        </p>
        <h1 className="text-xl font-bold">staggered-character-pulse-loader--react</h1>
      </header>

      <main className="flex min-h-32 w-full max-w-sm items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 p-8 shadow-inner">
        <LoaderFive key={remountKey} text="正在加载..." />
      </main>

      <footer className="mt-8 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => setRemountKey((k) => k + 1)}
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-medium text-neutral-200 transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 cursor-pointer"
        >
          重新挂载组件 (Remount)
        </button>
        <p className="text-xs text-neutral-400">
          挂载计数: {remountKey} · 字符逐字脉冲与阴影交错加载器
        </p>
      </footer>
    </div>
  );
}

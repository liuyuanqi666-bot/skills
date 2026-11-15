import { useState, useEffect } from "react";
import { TracingNarrativeShowcase } from "./components/TracingNarrativeShowcase";
import { Moon, Sun, ArrowDown } from "lucide-react";

export default function App() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-200">
        {/* Editorial Top Navigation */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-neutral-200 dark:border-neutral-800 px-6 py-3.5">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 animate-pulse" />
              <h1 className="font-semibold text-sm tracking-tight text-neutral-800 dark:text-neutral-200">
                Tracing Narrative Showcase · Section Fixture
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.scrollBy({ top: 600, behavior: "smooth" })}
                className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors py-1.5 px-2.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
              >
                <span>向下阅读</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                title="切换明暗主题"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* Section Showcase */}
        <main>
          <TracingNarrativeShowcase />
        </main>
      </div>
    </div>
  );
}

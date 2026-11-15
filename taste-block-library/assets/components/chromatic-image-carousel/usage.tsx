import React from "react"

import { ChromaticImageCarousel } from "./ChromaticImageCarousel"
function App() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <ChromaticImageCarousel />
      </div>
    </main>
  )
}

export default App;

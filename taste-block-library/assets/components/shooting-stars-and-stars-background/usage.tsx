import React from "react";

import { ShootingStars } from "./shooting-stars";
import { StarsBackground } from "./stars-background";
function App() {
  return (
    <main className="min-h-screen bg-neutral-950 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl h-[40rem] rounded-2xl bg-neutral-900 flex flex-col items-center justify-center relative overflow-hidden border border-neutral-800 shadow-2xl">
        <h2 className="relative flex-col md:flex-row z-10 text-3xl md:text-5xl md:leading-tight max-w-3xl mx-auto text-center tracking-tight font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-white to-white flex items-center gap-2 md:gap-8 select-none">
          <span>Shooting Star</span>
          <span className="text-white text-lg font-thin">x</span>
          <span>Star Background</span>
        </h2>
        
        <div className="z-10 mt-4 text-xs font-mono text-neutral-400 bg-neutral-950/70 px-4 py-1.5 rounded-full border border-neutral-800 backdrop-blur">
          Fixture Demonstration: Pure White & Tranquil Pacing
        </div>

        <ShootingStars
          starColor="#FFFFFF"
          trailColor="#93C5FD"
          minSpeed={5}
          maxSpeed={11}
          minDelay={1800}
          maxDelay={3800}
          maxStars={2}
          starWidth={12}
          starHeight={1.2}
        />
        <StarsBackground
          starDensity={0.0002}
          allStarsTwinkle={true}
          twinkleProbability={0.7}
        />
      </div>
    </main>
  );
}

export default App;

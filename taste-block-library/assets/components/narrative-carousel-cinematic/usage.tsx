"use client";
import greenHillsImage from "../../public/images/travel-landscape-svg/green-hills.svg?url";
import forestImage from "../../public/images/travel-landscape-svg/forest.svg?url";
import starsImage from "../../public/images/travel-landscape-svg/stars.svg?url";
import coastImage from "../../public/images/travel-landscape-svg/coast.svg?url";

import Carousel, { type SlideData } from "./components/ui/carousel";

export default function App() {
  const slideData: SlideData[] = [
    {
      title: "Mystic Mountains",
      subtitle: "The Alpine Solitude · 01",
      src: greenHillsImage,
    },
    {
      title: "Urban Dreams",
      subtitle: "Metropolitan Echoes · 02",
      src: forestImage,
    },
    {
      title: "Neon Nights",
      subtitle: "Cyberpunk Glow · 03",
      src: starsImage,
    },
    {
      title: "Desert Whispers",
      subtitle: "Dune Horizon · 04",
      src: coastImage,
    },
  ];

  return (
    <div className="relative overflow-hidden w-full min-h-screen py-20 flex items-center justify-center bg-[#0A0C10]">
      <Carousel slides={slideData} />
    </div>
  );
}

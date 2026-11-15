import { ExpandableCardDemoGrid } from "./ExpandableCardDemoGrid";
export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-6 text-center">
          精选目的地
        </h2>
        <ExpandableCardDemoGrid />
      </div>
    </div>
  );
}

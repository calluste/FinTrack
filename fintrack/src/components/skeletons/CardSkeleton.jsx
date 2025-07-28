export default function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 animate-pulse">
      <div className="h-4 w-28 bg-zinc-700 rounded mb-4" />
      <div className="h-8 w-44 bg-zinc-700 rounded" />
    </div>
  );
}

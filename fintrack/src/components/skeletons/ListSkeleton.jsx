export default function ListSkeleton({ rows = 6 }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 divide-y divide-zinc-800">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 animate-pulse">
          <div className="h-4 w-2/5 bg-zinc-700 rounded mb-2" />
          <div className="h-3 w-1/4 bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  );
}

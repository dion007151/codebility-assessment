export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col animate-pulse">
      <div className="bg-gray-100 h-52" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-3 bg-gray-200 rounded-full w-1/3" />
        <div className="h-4 bg-gray-200 rounded-full w-full" />
        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
        <div className="mt-2 flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded-full w-1/4" />
          <div className="h-4 bg-gray-200 rounded-full w-1/3" />
        </div>
        <div className="h-9 bg-gray-200 rounded-xl mt-2" />
      </div>
    </div>
  );
}

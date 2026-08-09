'use client';

export function SkeletonLoader() {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 p-6 space-y-6 hidden md:block shrink-0 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 bg-slate-800 rounded-lg" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-800 rounded w-2/3" />
            <div className="h-3 bg-slate-800 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-4 pt-6">
          <div className="h-9 bg-slate-800 rounded-lg" />
          <div className="h-9 bg-slate-800 rounded-lg" />
          <div className="h-9 bg-slate-800 rounded-lg" />
          <div className="h-9 bg-slate-800 rounded-lg" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header Skeleton */}
        <header className="h-16 bg-white border-b border-slate-150 px-8 flex items-center justify-between animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-48" />
          <div className="flex items-center space-x-4">
            <div className="h-8 w-24 bg-slate-200 rounded-lg" />
            <div className="h-8 w-8 bg-slate-200 rounded-full" />
          </div>
        </header>

        {/* Content Body Skeleton */}
        <main className="flex-grow p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Title Area Skeleton */}
          <div className="space-y-2.5 animate-pulse">
            <div className="h-7 bg-slate-200 rounded-lg w-72" />
            <div className="h-4 bg-slate-200 rounded-lg w-[400px]" />
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid gap-6 md:grid-cols-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-white border border-slate-100 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-250 rounded w-1/2" />
                  <div className="h-8 w-8 bg-slate-200 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <div className="h-7 bg-slate-250 rounded-lg w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>

          {/* Table / Content Area Skeleton */}
          <div className="bg-white border border-slate-100 rounded-xl p-6 space-y-5 animate-pulse">
            <div className="h-5 bg-slate-200 rounded w-36" />
            <div className="space-y-3.5 pt-2">
              <div className="h-12 bg-slate-100 rounded-lg" />
              <div className="h-12 bg-slate-100 rounded-lg" />
              <div className="h-12 bg-slate-100 rounded-lg" />
              <div className="h-12 bg-slate-100 rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
export default SkeletonLoader;

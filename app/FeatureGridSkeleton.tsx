import { Skeleton } from "./Skeleton";

export function FeatureGridSkeleton() {
  return (
    <section className="bg-[#030712] py-24 sm:py-32">
      <div className="container">
        <Skeleton className="h-12 w-1/2 max-w-lg mx-auto mb-16" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-start p-8 rounded-3xl bg-gray-900 border border-white/10"
            >
              <Skeleton className="h-12 w-12 rounded-xl mb-4" />
              <Skeleton className="h-6 w-3/4 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
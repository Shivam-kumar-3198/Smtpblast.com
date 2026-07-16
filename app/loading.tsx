import { Skeleton } from "./Skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-50 w-full border-b border-slate-900/[0.06] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.25rem] w-full max-w-[80rem] items-center px-5 sm:px-8 lg:px-12">
          <Skeleton className="h-7 w-32" />
          <div className="ml-auto flex items-center gap-3">
            <Skeleton className="hidden h-9 w-20 rounded-full sm:block" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
          <Skeleton className="h-7 w-44 rounded-full" />
          <Skeleton className="mt-8 h-12 w-full max-w-2xl" />
          <Skeleton className="mt-3 h-12 w-2/3 max-w-md" />
          <Skeleton className="mt-6 h-5 w-full max-w-lg" />
          <Skeleton className="mt-2 h-5 w-4/5 max-w-md" />
        </div>
      </main>
    </div>
  );
}

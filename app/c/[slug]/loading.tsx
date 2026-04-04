// app/c/[slug]/loading.tsx
export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl flex flex-col items-center gap-12 animate-pulse">

        {/* Event title skeleton */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-surface" />
          <div className="w-64 h-7 rounded-lg bg-brand-surface" />
          <div className="w-40 h-4 rounded bg-brand-surface" />
        </div>

        {/* Timer skeleton */}
        <div className="flex items-end gap-4 sm:gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="w-20 sm:w-28 md:w-32 h-20 sm:h-28 md:h-32 rounded-2xl bg-brand-surface" />
              <div className="w-10 h-3 rounded bg-brand-surface" />
            </div>
          ))}
        </div>

        {/* Share skeleton */}
        <div className="w-full max-w-md h-12 rounded-xl bg-brand-surface" />
      </div>
    </main>
  )
}

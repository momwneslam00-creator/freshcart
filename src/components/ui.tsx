import { Star, StarHalf } from "lucide-react";

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-brand">
      <Spinner className="h-10 w-10" />
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="mx-auto my-10 max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-danger mt-4">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto my-16 max-w-md text-center">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      {hint && <p className="mt-2 text-sm text-slate-500">{hint}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="h-9 w-3 rounded-full bg-brand" />
      <h2 className="text-2xl font-bold text-ink sm:text-3xl">{children}</h2>
    </div>
  );
}

export function Stars({ value, count }: { value: number; count?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${value} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => {
        if (i < full)
          return <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />;
        if (i === full && half)
          return <StarHalf key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />;
        return <Star key={i} className="h-4 w-4 text-slate-300" />;
      })}
      {count !== undefined && <span className="ml-1 text-xs text-slate-500">({count})</span>}
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse rounded-lg bg-surface p-4">
          <div className="aspect-square rounded bg-slate-200" />
          <div className="mt-4 h-3 w-1/3 rounded bg-slate-200" />
          <div className="mt-2 h-4 w-2/3 rounded bg-slate-200" />
          <div className="mt-4 h-8 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (p: number) => void;
}) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button className="btn-outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      {nums.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
          className={
            n === page
              ? "btn-primary min-w-10"
              : "btn-outline min-w-10"
          }
        >
          {n}
        </button>
      ))}
      <button className="btn-outline" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}

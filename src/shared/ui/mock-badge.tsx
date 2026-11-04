/** Marks UI that still runs on mock data / assumptions because the API doc has no matching contract. */
export function MockBadge({ detail, className = '' }: { detail?: string; className?: string }) {
  return <span title={detail} className={`inline-flex items-center rounded-full border border-dashed border-[#bd6e46] bg-[#fdf3ec] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#bd6e46] ${className}`} data-testid="badge-mock">Mock</span>;
}

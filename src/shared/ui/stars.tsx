import { Star } from 'lucide-react';

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return <span className="inline-flex text-[#d4a24c]" aria-label={`${value} trên 5 sao`}>{[1, 2, 3, 4, 5].map(i => <Star key={i} size={size} fill={i <= Math.round(value) ? 'currentColor' : 'none'} strokeWidth={1.8} />)}</span>;
}

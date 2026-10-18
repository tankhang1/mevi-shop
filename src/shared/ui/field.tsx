import { type ReactNode } from 'react';

export function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold">{value || 'Đang cập nhật'}</dd></div>; }

export function Field({ label, required, wide, children }: { label: string; required?: boolean; wide?: boolean; children: ReactNode }) { return <label className={`grid gap-2 text-sm font-semibold ${wide ? 'sm:col-span-2' : ''}`}>{label}{required && <span className="sr-only"> (bắt buộc)</span>}{children}</label>; }

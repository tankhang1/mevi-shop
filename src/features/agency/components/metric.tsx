import { type ReactNode } from 'react';

export function Metric({ label, value, note, icon }: { label: string; value: ReactNode; note: string; icon: ReactNode }) { return <div className="surface p-5"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-muted-foreground">{label}</span><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#eef1e9] text-[#285e45]">{icon}</span></div><p className="mt-4 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>; }

import { type ReactNode } from 'react';

export function Feature({ icon, number, title, desc }: { icon: ReactNode; number: string; title: string; desc: string }) { return <div className="rounded-2xl border border-[#e5e1d5] bg-[#fbfaf5] p-5"><div className="flex items-center justify-between"><span className="text-[#285e45]">{icon}</span><span className="font-mono text-xs text-[#a6a99b]">{number}</span></div><h3 className="mt-4 font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{desc}</p></div>; }

import { type ReactNode } from 'react';
import { CircleAlert, Package } from 'lucide-react';

export function Loading({ label = 'Đang tải dữ liệu' }: { label?: string }) { return <div className="space-y-4 py-8" role="status" data-testid="state-loading"><div className="h-8 w-48 animate-pulse rounded-lg bg-[#e7e5dc]" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(x => <div key={x} className="h-56 animate-pulse rounded-2xl bg-[#e9e7df]" />)}</div><p className="text-sm text-muted-foreground">{label}</p></div>; }

export function ErrorState({ retry }: { retry: () => void }) { return <div className="surface my-8 flex flex-col items-center p-10 text-center" data-testid="state-error"><CircleAlert className="text-[#bd6e46]" /><h3 className="mt-3 font-bold">Chưa thể tải dữ liệu</h3><p className="mt-1 text-sm text-muted-foreground">Vui lòng thử lại sau ít phút.</p><button className="btn-outline mt-5" onClick={retry} data-testid="button-retry">Thử lại</button></div>; }

export function Empty({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) { return <div className="surface my-7 grid justify-items-center p-12 text-center" data-testid="state-empty"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eef1e9] text-[#285e45]"><Package size={25} /></span><h3 className="mt-4 text-lg font-bold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{detail}</p>{action && <div className="mt-5">{action}</div>}</div>; }

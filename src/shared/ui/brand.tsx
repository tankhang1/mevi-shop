import { useContext } from 'react';
import { Link } from 'wouter';
import { agencyBrandContext } from '@/app/providers/agency-brand-provider';
import { basePath } from '@/shared/config';

export const brandLetters = [['M', '#bd6e46'], ['E', '#285e45'], ['V', '#5f8f6e'], ['I', '#7fa36b']] as const;

export function Brand({ inverse = false }: { inverse?: boolean }) { const agency=useContext(agencyBrandContext); const color=agency?.primaryColor||'#285e45'; return <Link href="/" className={`inline-flex items-center gap-2.5 font-extrabold tracking-tight ${inverse ? 'text-[#f5f1e5]' : ''}`} style={!inverse?{color}:undefined} data-testid="link-brand" aria-label={agency?.displayName||'Mevi'}>{agency?.logoUrl?<span className="grid h-9 min-w-9 place-items-center overflow-hidden rounded-xl bg-white p-1"><img src={agency.logoUrl} alt="" className="h-full max-w-32 object-contain" /></span>:<img src={`${basePath}/mevi-mark.png`} alt="" className="h-10 w-auto" />}<span className="text-[21px]">{agency?.displayName||<>mevi<span className="font-medium text-[#bd6e46]">.</span></>}</span></Link>; }

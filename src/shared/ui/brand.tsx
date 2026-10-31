import { Link } from 'wouter';
import { basePath } from '@/shared/config';

export const brandLetters = [['M', '#bd6e46'], ['E', '#285e45'], ['V', '#5f8f6e'], ['I', '#7fa36b']] as const;

// Always Mevi: an agency referral only credits orders; agency branding lives on its own /dai-ly page.
export function Brand({ inverse = false }: { inverse?: boolean }) { return <Link href="/" className={`inline-flex items-center gap-2.5 font-extrabold tracking-tight ${inverse ? 'text-[#f5f1e5]' : 'text-[#285e45]'}`} data-testid="link-brand" aria-label="Mevi"><img src={`${basePath}/mevi-mark.png`} alt="" className="h-10 w-auto" /><span className="text-[21px]">mevi<span className="font-medium text-[#bd6e46]">.</span></span></Link>; }

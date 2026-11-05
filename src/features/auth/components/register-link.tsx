import { Link, useLocation } from 'wouter';
import { ROUTES } from '@/shared/constants/routes';

/** Link to the sign-up page that remembers the current page, so login can return here afterwards. */
export function RegisterLink({ className, onClick, children = 'Đăng ký' }: { className?: string; onClick?: () => void; children?: React.ReactNode }) {
  const [location] = useLocation();
  return (
    <Link href={`${ROUTES.register}?next=${encodeURIComponent(location)}`} className={className} onClick={onClick} data-testid="link-register">
      {children}
    </Link>
  );
}

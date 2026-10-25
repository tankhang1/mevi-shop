import { PageFrame } from '@/shared/ui/layout';
import { ProfileHeader } from '@/features/account/components/profile-header';
import { AccountMenu } from '@/features/account/components/account-menu';

export function AccountPage() {
  return (
    <PageFrame>
      <main className="shell py-5 md:py-10 max-w-xl mx-auto space-y-5">
        <ProfileHeader />
        <AccountMenu />
      </main>
    </PageFrame>
  );
}

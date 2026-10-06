import type { Metadata } from 'next';
import Link from 'next/link';
import { PRIMARY_ACTION, SECONDARY_ACTION, StatusPage } from '@/components/ui/status-page';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <StatusPage
      eyebrow="404"
      title="Page not found"
      actions={
        <>
          <Link href="/" className={PRIMARY_ACTION}>
            Back to home
          </Link>
          <Link href="/rooms" className={SECONDARY_ACTION}>
            View rooms
          </Link>
        </>
      }
    >
      <p>The page you are looking for doesn&apos;t exist or has moved.</p>
    </StatusPage>
  );
}

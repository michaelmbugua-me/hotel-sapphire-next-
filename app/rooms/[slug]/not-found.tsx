import type { Metadata } from 'next';
import Link from 'next/link';
import { PRIMARY_ACTION, StatusPage } from '@/components/ui/status-page';

export const metadata: Metadata = {
  title: 'Room not found',
};

export default function RoomNotFound() {
  return (
    <StatusPage
      eyebrow="404"
      title="Room not found"
      actions={
        <Link href="/rooms" className={PRIMARY_ACTION}>
          See all rooms
        </Link>
      }
    >
      <p>We couldn&apos;t find that room. It may have been renamed or is no longer offered.</p>
    </StatusPage>
  );
}

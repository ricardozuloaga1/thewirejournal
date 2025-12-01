import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editorial Dashboard | The Wire Journal',
  description: 'Editor dashboard for AI-generated news articles',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}



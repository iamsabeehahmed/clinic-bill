import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar userRole={session.user.role} userName={session.user.name || 'User'} />
        <div className="flex-1 ml-72">
          <Header userName={session.user.name || 'User'} userRole={session.user.role} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}

'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminLayout({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-8">
        {children}
      </main>
    </div>
  );
}
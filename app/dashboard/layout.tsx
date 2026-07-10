'use client';
import { useSession, signOut } from 'next-auth/react';
import { SessionProvider } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

function DashboardNav() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  if (status === 'loading') return <div className="p-8 text-center">Loading...</div>;
  if (!session) return null;

  const isActive = (path) => pathname === path ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100';

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md border-r border-gray-200 p-4 flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">🏢 Dashboard</h2>
          <p className="text-xs text-gray-500">{(session.user as any)?.tenantSlug}</p>
        </div>
        <nav className="flex-1 space-y-1">
          <Link href="/dashboard" className={`block px-4 py-2 rounded ${isActive('/dashboard')}`}>📊 Overview</Link>
          <Link href="/dashboard/builder" className={`block px-4 py-2 rounded ${isActive('/dashboard/builder')}`}>🎨 Builder</Link>
          <Link href="/dashboard/pages" className={`block px-4 py-2 rounded ${isActive('/dashboard/pages')}`}>📄 Pages</Link>
          <Link href="/dashboard/templates" className={`block px-4 py-2 rounded ${isActive('/dashboard/templates')}`}>🎭 Templates</Link>
          <Link href="/dashboard/products" className={`block px-4 py-2 rounded ${isActive('/dashboard/products')}`}>📦 Products</Link>
          <Link href="/dashboard/orders" className={`block px-4 py-2 rounded ${isActive('/dashboard/orders')}`}>🛒 Orders</Link>
          <Link href="/dashboard/accounting" className={`block px-4 py-2 rounded ${isActive('/dashboard/accounting')}`}>💰 Accounting</Link>
          <Link href="/dashboard/settings" className={`block px-4 py-2 rounded ${isActive('/dashboard/settings')}`}>⚙️ Settings</Link>
        </nav>
        <button onClick={() => signOut({ callbackUrl: '/login' })} className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 text-red-600 mt-4">🚪 Logout</button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-full">
          {/*
            This is where child pages render.
          */}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardNav />
      <div className="bg-gray-100 p-6">
        {children}
      </div>
    </SessionProvider>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  FileText,
  Users,
  PlusCircle,
  LogOut,
  Stethoscope,
  ChevronRight,
  Printer,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
  userName?: string;
}

export default function Sidebar({ userRole = 'admin', userName = 'User' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handlePrintLastReceipt = () => {
    const lastBillId = localStorage.getItem('lastViewedBillId');
    if (lastBillId) {
      router.push(`/bills/${lastBillId}?print=true`);
    } else {
      alert('No recent bill found. Please view a bill first.');
    }
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/bills', label: 'All Bills', icon: FileText },
    { href: '/bills/new', label: 'Create Bill', icon: PlusCircle },
    { href: '/patients', label: 'Patients', icon: Users },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const getRoleBadgeColor = () => {
    return 'bg-purple-500/20 text-purple-300';
  };

  return (
    <aside className="w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white min-h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/30">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              ClinicBill Pro
            </h1>
            <p className="text-xs text-gray-500">Healthcare Billing</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 mx-4 mt-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium capitalize ${getRoleBadgeColor()}`}>
              {userRole}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">Menu</p>
        {navItems.map((item) => {
          // Exact match for specific routes, or startsWith for parent routes (excluding sub-routes)
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' &&
             item.href !== '/bills' &&
             pathname.startsWith(item.href)) ||
            (item.href === '/bills' && pathname === '/bills');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}

        {/* Quick Actions */}
        <div className="my-4 border-t border-gray-800" />
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">Quick Actions</p>
        <Link
          href="/bills/new"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/20 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Quick Bill</span>
        </Link>
        <button
          onClick={handlePrintLastReceipt}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
        >
          <Printer className="w-5 h-5" />
          <span>Print Last Receipt</span>
        </button>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => signOut({ callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/login` })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

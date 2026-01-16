'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  FileText,
  Users,
  Banknote,
  Clock,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  CreditCard,
  Calendar,
  Activity,
  Printer,
} from 'lucide-react';

interface Stats {
  totalBills: number;
  pendingBills: number;
  paidBills: number;
  totalRevenue: number;
  monthlyRevenue: number;
  lastMonthRevenue: number;
  todayBills: number;
  pendingAmount: number;
  totalPaidAmount: number;
  totalPatients: number;
  monthlyBills: number;
  lastMonthBills: number;
  revenueChange: number;
  billsChange: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    totalBills: 0,
    pendingBills: 0,
    paidBills: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    lastMonthRevenue: 0,
    todayBills: 0,
    pendingAmount: 0,
    totalPaidAmount: 0,
    totalPatients: 0,
    monthlyBills: 0,
    lastMonthBills: 0,
    revenueChange: 0,
    billsChange: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/bills/stats');
      const data = await res.json();
      if (data && !data.error) {
        setStats({
          totalBills: data.totalBills ?? 0,
          pendingBills: data.pendingBills ?? 0,
          paidBills: data.paidBills ?? 0,
          totalRevenue: data.totalRevenue ?? 0,
          monthlyRevenue: data.monthlyRevenue ?? 0,
          lastMonthRevenue: data.lastMonthRevenue ?? 0,
          todayBills: data.todayBills ?? 0,
          pendingAmount: data.pendingAmount ?? 0,
          totalPaidAmount: data.totalPaidAmount ?? 0,
          totalPatients: data.totalPatients ?? 0,
          monthlyBills: data.monthlyBills ?? 0,
          lastMonthBills: data.lastMonthBills ?? 0,
          revenueChange: data.revenueChange ?? 0,
          billsChange: data.billsChange ?? 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const userRole = session?.user?.role || 'patient';
  const userName = session?.user?.name || 'User';

  // Admin/Employee Dashboard
  if (userRole === 'admin' || userRole === 'employee') {
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, <span className="text-emerald-600">{userName.split(' ')[0]}</span>
            </h1>
            <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your clinic today.</p>
          </div>
          <Link
            href="/bills/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            New Bill
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`Rs. ${(stats.totalRevenue || 0).toLocaleString()}`}
            change={`${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange}% this month`}
            trend={stats.revenueChange >= 0 ? 'up' : 'down'}
            icon={Banknote}
            color="emerald"
            loading={loading}
          />
          <StatCard
            title="Total Bills"
            value={stats.totalBills}
            change={`${stats.todayBills} today`}
            trend="neutral"
            icon={FileText}
            color="blue"
            loading={loading}
          />
          <StatCard
            title="Pending Amount"
            value={`Rs. ${(stats.pendingAmount || 0).toLocaleString()}`}
            change={`${stats.pendingBills} bills pending`}
            trend={stats.pendingBills > 0 ? 'down' : 'neutral'}
            icon={Clock}
            color="amber"
            loading={loading}
          />
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            change={`${stats.paidBills} paid bills`}
            trend="up"
            icon={Users}
            color="purple"
            loading={loading}
          />
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <QuickAction
                href="/bills/new"
                icon={Plus}
                label="Create New Bill"
                description="Generate a bill for a patient"
                color="emerald"
              />
              <QuickAction
                href="/patients"
                icon={Users}
                label="Add Patient"
                description="Register a new patient"
                color="blue"
              />
              <QuickAction
                href="/bills?status=pending"
                icon={Clock}
                label="Pending Bills"
                description="View unpaid invoices"
                color="amber"
              />
              <QuickAction
                href="#"
                icon={Printer}
                label="Print Reports"
                description="Generate daily reports"
                color="purple"
              />
            </div>
          </div>

          {/* Monthly Overview */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Monthly Overview</h2>
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-emerald-700">Monthly Revenue</span>
                </div>
                <p className="text-3xl font-bold text-emerald-900">
                  Rs. {(stats.monthlyRevenue || 0).toLocaleString()}
                </p>
                <p className={`text-sm mt-1 ${stats.revenueChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange}% from last month
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-blue-700">Bills This Month</span>
                </div>
                <p className="text-3xl font-bold text-blue-900">{stats.monthlyBills}</p>
                <p className={`text-sm mt-1 ${stats.billsChange >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {stats.billsChange >= 0 ? '+' : ''}{stats.billsChange}% from last month
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-amber-700">Pending Amount</span>
                </div>
                <p className="text-3xl font-bold text-amber-900">
                  Rs. {(stats.pendingAmount || 0).toLocaleString()}
                </p>
                <p className="text-sm text-amber-600 mt-1">{stats.pendingBills} invoices pending</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Receipt className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-purple-700">Collection Rate</span>
                </div>
                <p className="text-3xl font-bold text-purple-900">
                  {stats.totalBills > 0 ? Math.round((stats.paidBills / stats.totalBills) * 100) : 0}%
                </p>
                <p className="text-sm text-purple-600 mt-1">{stats.paidBills} of {stats.totalBills} bills paid</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Patient Dashboard
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">Welcome back, {userName.split(' ')[0]}!</h1>
        <p className="text-emerald-100 mt-2">View your billing history and manage payments.</p>
      </div>

      {/* Patient Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Receipt className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBills}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingBills}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">Rs. {(stats.totalRevenue || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/my-bills"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">View My Bills</p>
              <p className="text-sm text-gray-500">See all your invoices</p>
            </div>
          </Link>
          <Link
            href="/payments"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="p-3 bg-emerald-100 rounded-xl">
              <CreditCard className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Payment History</p>
              <p className="text-sm text-gray-500">Track your payments</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: 'emerald' | 'blue' | 'amber' | 'purple';
  loading: boolean;
}) {
  const colors = {
    emerald: 'from-emerald-500 to-teal-500',
    blue: 'from-blue-500 to-indigo-500',
    amber: 'from-amber-500 to-orange-500',
    purple: 'from-purple-500 to-pink-500',
  };

  const bgColors = {
    emerald: 'bg-emerald-50',
    blue: 'bg-blue-50',
    amber: 'bg-amber-50',
    purple: 'bg-purple-50',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend !== 'neutral' && (
          <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {loading ? <span className="animate-pulse">...</span> : value}
        </p>
        <p className="text-xs text-gray-400 mt-1">{change}</p>
      </div>
    </div>
  );
}

// Quick Action Component
function QuickAction({
  href,
  icon: Icon,
  label,
  description,
  color,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  color: 'emerald' | 'blue' | 'amber' | 'purple';
}) {
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
    >
      <div className={`p-2.5 rounded-lg ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
          {label}
        </p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
    </Link>
  );
}

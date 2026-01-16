'use client';

import { Bell, Search } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  userName?: string;
  userRole?: string;
}

export default function Header({ userName = 'User', userRole = 'admin' }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  const getRoleColor = () => {
    return 'bg-purple-100 text-purple-700';
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex items-center gap-4 flex-1">
          <div className={`relative transition-all duration-300 ${searchOpen ? 'w-full max-w-xl' : 'w-80'}`}>
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bills, patients, payments..."
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-100/80 border-0 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900">{userName}</p>
              <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium capitalize ${getRoleColor()}`}>
                {userRole}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-white font-semibold">{userName.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

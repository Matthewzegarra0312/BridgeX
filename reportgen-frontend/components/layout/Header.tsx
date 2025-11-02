"use client";

import React from 'react';
import { Moon, Sun, Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-[#0a0e1a] px-6">
      <div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-3">
        {action}
        
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700 bg-gray-900/50 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          aria-label="Toggle theme"
        >
          <Moon className="h-5 w-5" />
        </button>
        
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700 bg-gray-900/50 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        
        <div className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
          <span className="text-sm font-semibold text-white">AU</span>
        </div>
      </div>
    </header>
  );
}

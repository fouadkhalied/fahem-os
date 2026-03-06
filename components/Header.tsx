import React from 'react';
import { User, Language } from '../types';
import { Button } from './Button';

interface HeaderProps {
  user: User;
  language: Language;
  toggleLanguage: () => void;
  toggleRole: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, language, toggleLanguage, toggleRole }) => {
  return (
    <header className="h-20 flex items-center justify-between px-8 sticky top-0 z-10 bg-[#fdfdfd]/80 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 hidden md:block tracking-tight">
          {language === Language.AR ? 'لوحة القيادة' : 'Dashboard'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Switcher */}
        <button 
          onClick={toggleRole}
          className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
        >
          {user.role} MODE
        </button>

        {/* Language Toggle */}
        <button 
          onClick={toggleLanguage}
          className="w-10 h-10 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center font-bold text-sm transition-colors"
        >
          {language === Language.AR ? 'EN' : 'ع'}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-end hidden md:block">
            <p className="text-sm font-bold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 font-medium capitalize">{user.role}</p>
          </div>
          <img 
            src={user.avatar} 
            alt="User" 
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
        </div>
      </div>
    </header>
  );
};
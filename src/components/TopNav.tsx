import React from 'react';
import { Landmark, SlidersHorizontal, BookOpen } from 'lucide-react';

interface TopNavProps {
  activeTab: 'feed' | 'analytics' | 'departments' | 'profile' | 'architecture';
  setActiveTab: (tab: 'feed' | 'analytics' | 'departments' | 'profile' | 'architecture') => void;
  savedCount: number;
  onOpenProfile: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-xs">
              <Landmark className="w-5 h-5" />
            </div>
            <a
              href="#feed"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('feed');
              }}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-blue-700 transition-colors"
            >
              Kamuİlan<span className="text-blue-700">Analitik</span>
            </a>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('feed')}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
                activeTab === 'feed'
                  ? 'border-blue-700 text-blue-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              İlan Akışı
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
                activeTab === 'analytics'
                  ? 'border-blue-700 text-blue-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Taban Puan Analitiği
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
                activeTab === 'departments'
                  ? 'border-blue-700 text-blue-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              ÖSYM Bölüm Kılavuzu
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
                activeTab === 'profile'
                  ? 'border-blue-700 text-blue-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Bölüm & Profilim
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
                activeTab === 'architecture'
                  ? 'border-blue-700 text-blue-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Prisma & Kazıma Mimarisi
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tercihlerimi Güncelle</span>
              <span className="sm:hidden">Profilim</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="flex md:hidden items-center justify-between overflow-x-auto py-2 border-t border-slate-100 gap-1.5 text-xs">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-2 py-1 rounded-md whitespace-nowrap shrink-0 font-medium ${
              activeTab === 'feed'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            İlanlar
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-2 py-1 rounded-md whitespace-nowrap shrink-0 font-medium ${
              activeTab === 'analytics'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Taban Puanlar
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-2 py-1 rounded-md whitespace-nowrap shrink-0 font-medium ${
              activeTab === 'departments'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ÖSYM Kılavuz
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-2 py-1 rounded-md whitespace-nowrap shrink-0 font-medium ${
              activeTab === 'profile'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profil
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-2 py-1 rounded-md whitespace-nowrap shrink-0 font-medium ${
              activeTab === 'architecture'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mimari
          </button>
        </div>
      </div>
    </header>
  );
};

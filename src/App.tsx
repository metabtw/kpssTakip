/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { UserProfile, FilterState, Posting } from './types';
import { DEFAULT_PROFILE, SAMPLE_POSTINGS } from './data/mockData';
import { TopNav } from './components/TopNav';
import { ProfileBanner } from './components/ProfileBanner';
import { FilterBar } from './components/FilterBar';
import { PostingCard } from './components/PostingCard';
import { PostingDetailModal } from './components/PostingDetailModal';
import { HistoricalScoreExplorer } from './components/HistoricalScoreExplorer';
import { ArchitectureDocsView } from './components/ArchitectureDocsView';
import { OsymDepartmentsCatalogueView } from './components/OsymDepartmentsCatalogueView';
import { OnboardingModal } from './components/OnboardingModal';
import {
  queryPostingsByPreferences,
  loadSavedProfile,
  saveProfileToStorage,
} from './services/placementQueryService';
import {
  Bookmark,
  Sparkles,
  TrendingUp,
  Landmark,
  ShieldAlert,
  SearchX,
  CheckCircle2,
  SlidersHorizontal,
  UserCheck,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'analytics' | 'departments' | 'profile' | 'architecture'>('feed');
  
  // Kullanıcının daha önce kaydettiği tercihleri yükle (yoksa varsayılan)
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = loadSavedProfile();
    return saved || DEFAULT_PROFILE;
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    const saved = loadSavedProfile();
    return saved ? !saved.isCompleted : !DEFAULT_PROFILE.isCompleted;
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedPosting, setSelectedPosting] = useState<Posting | null>(null);
  const [savedPostingIds, setSavedPostingIds] = useState<string[]>(['post-1']);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    educationLevel: 'ALL',
    institutionType: 'ALL',
    city: 'ALL',
    positionType: 'ALL',
    onlyEligibleScore: false,
    onlyMyDepartment: false,
    sortBy: 'deadline',
  });

  const handleToggleSave = (id: string) => {
    setSavedPostingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetFilter = () => {
    setFilter({
      searchQuery: '',
      educationLevel: 'ALL',
      institutionType: 'ALL',
      city: 'ALL',
      positionType: 'ALL',
      onlyEligibleScore: false,
      onlyMyDepartment: false,
      sortBy: 'deadline',
    });
    setShowSavedOnly(false);
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    saveProfileToStorage(updatedProfile);
  };

  // Kullanıcının gerçek tercihlerine göre dinamik veri sorgulaması
  const queryResult = useMemo(() => {
    return queryPostingsByPreferences(profile, filter, savedPostingIds, showSavedOnly);
  }, [profile, filter, savedPostingIds, showSavedOnly]);

  const filteredPostings = queryResult.postings;
  const scoreEligibleCount = queryResult.scoreEligibleCount;
  const departmentEligibleCount = queryResult.departmentEligibleCount;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 0. Onboarding Flow Modal (Bölüm, Sınav Yılı, Puan, Cinsiyet vb. seçim) */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        initialProfile={profile}
        onSave={(updated) => {
          handleSaveProfile(updated);
          setIsOnboardingOpen(false);
        }}
        onSkip={() => {
          const finished = { ...profile, isCompleted: true };
          handleSaveProfile(finished);
          setIsOnboardingOpen(false);
        }}
      />

      {/* 1. Header / Top Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedPostingIds.length}
        onOpenProfile={() => {
          setIsProfileOpen(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 2. Profile & KPSS Customizer Banner */}
      <ProfileBanner
        profile={profile}
        setProfile={(val) => {
          const updated = typeof val === 'function' ? val(profile) : val;
          handleSaveProfile(updated);
        }}
        eligibleCount={scoreEligibleCount}
        totalActiveCount={SAMPLE_POSTINGS.length}
        isOpen={isProfileOpen || activeTab === 'profile'}
        onClose={() => {
          setIsProfileOpen(false);
          if (activeTab === 'profile') setActiveTab('feed');
        }}
      />

      {/* 3. Main Workspace Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* TAB 1: FEED (İlan Akışı) */}
        {activeTab === 'feed' && (
          <div>
            {/* Quick Stats & Saved Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Aktif Kamu Personeli Alım İlanları
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cumhurbaşkanlığı SBB Kamu İlan, Kariyer Kapısı, İŞKUR ve Resmi Gazete verileriyle güncellenmektedir.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsOnboardingOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Tercihleri Yeniden Belirle</span>
                </button>

                <button
                  onClick={() => setShowSavedOnly((prev) => !prev)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    showSavedOnly
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-amber-600 text-amber-600' : ''}`}
                  />
                  <span>Kaydedilen İlanlar ({savedPostingIds.length})</span>
                </button>
              </div>
            </div>

            {/* Filter Card Component */}
            <FilterBar
              filter={filter}
              setFilter={setFilter}
              totalMatches={filteredPostings.length}
              onReset={handleResetFilter}
            />

            {/* Postings Grid */}
            {filteredPostings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPostings.map((posting) => (
                  <PostingCard
                    key={posting.id}
                    posting={posting}
                    user={profile}
                    isSaved={savedPostingIds.includes(posting.id)}
                    onToggleSave={handleToggleSave}
                    onSelect={(p) => setSelectedPosting(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto my-8 shadow-xs">
                <SearchX className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-900">
                  Kriterlere Uygun İlan Bulunamadı
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                  Arama terimini değiştirebilir, şehir veya kurum filtrelerini esnetebilir veya "Bölümüme Uygun" filtresini kaldırabilirsiniz.
                </p>
                <button
                  onClick={handleResetFilter}
                  className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                >
                  Filtreleri Sıfırla
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TABAN PUAN ANALİTİĞİ */}
        {activeTab === 'analytics' && <HistoricalScoreExplorer user={profile} />}

        {/* TAB 2.5: ÖSYM BÖLÜMLER & NİTELİK KODLARI KILAVUZU */}
        {activeTab === 'departments' && (
          <OsymDepartmentsCatalogueView
            currentProfile={profile}
            onSelectDepartment={(dept) => {
              handleSaveProfile({
                ...profile,
                departmentId: dept.id,
                departmentName: dept.name,
                qualificationCodes: dept.qualificationCodes,
                educationLevel: dept.educationLevel,
              });
              setActiveTab('feed');
            }}
          />
        )}

        {/* TAB 3: PROFİLİM & BÖLÜMÜM */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Kişiselleştirilmiş İlan & Puan Eşleştirme Profili
                </h2>
                <button
                  onClick={() => setIsOnboardingOpen(true)}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-4 cursor-pointer"
                >
                  Sihirbazı Başlat
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Bu alanda tanımladığınız mezuniyet seviyesi, bölüm, sınav yılı, puanınız ve cinsiyetiniz; platformdaki tüm ilanların sizin için filtrelenmesinde ve ÖSYM geçmiş taban puan analizinde kullanılır.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block mb-1">Kayıtlı Bölüm:</span>
                  <span className="font-semibold text-slate-900 text-sm">
                    {profile.departmentName}
                  </span>
                  <div className="mt-2 text-slate-500">
                    Öğrenim: <strong className="text-slate-800">{profile.educationLevel}</strong>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block mb-1">Geçerli KPSS Sınavı:</span>
                  <span className="font-mono tabular-nums font-bold text-blue-700 text-lg">
                    {profile.score.toFixed(2)}
                  </span>
                  <div className="mt-2 text-slate-500">
                    Yıl / Tür: <strong className="text-slate-800">{profile.examYear} · {profile.scoreType}</strong>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block mb-1">Cinsiyet & İkamet:</span>
                  <span className="font-semibold text-slate-900 text-sm">
                    {profile.gender === 'ERKEK' ? 'Erkek' : profile.gender === 'KADIN' ? 'Kadın' : 'Belirtilmedi'}
                  </span>
                  <div className="mt-2 text-slate-500">
                    İl: <strong className="text-slate-800">{profile.residenceCity || 'Belirtilmedi'}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  Bilgileri Hızlı Düzenle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MİMARİ & PRISMA & KAZIMA SERVİSİ */}
        {activeTab === 'architecture' && <ArchitectureDocsView />}
      </main>

      {/* 4. Posting Detail Modal with Historical Analytics */}
      <PostingDetailModal
        posting={selectedPosting}
        user={profile}
        isOpen={Boolean(selectedPosting)}
        onClose={() => setSelectedPosting(null)}
      />

      {/* 5. Minimal Clean Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Kamuİlan Analitik Platformu</span>
            <span aria-hidden="true">·</span>
            <a
              href="https://www.osym.gov.tr/SinavGrubu/Menu/341"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:underline"
            >
              ÖSYM Menü/341 Sayısal Bilgiler Veritabanı
            </a>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>PostgreSQL & Prisma Destekli</span>
            <span>·</span>
            <span>Python Playwright ETL Mimarisi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

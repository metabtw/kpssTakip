import React from 'react';
import { FilterState, EducationLevel } from '../types';
import { Search, RotateCcw, Check, Filter } from 'lucide-react';

interface FilterBarProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatches: number;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  setFilter,
  totalMatches,
  onReset,
}) => {
  const cities = [
    'Tüm İller',
    'Ankara',
    'İstanbul',
    'İzmir',
    'Bursa',
    'Antalya',
    'Kocaeli',
    '81 İl Taşra Teşkilatı',
  ];

  const instTypes = [
    'Tüm Kurumlar',
    'Bakanlık',
    'Üniversite',
    'Belediye',
    'KİT',
    'Bağımsız Kurul',
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex flex-col gap-4">
        {/* Row 1: Search Bar & Quick Toggles */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filter.searchQuery}
              onChange={(e) => setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Kurum adı, unvan (Yazılım, Hemşire, Zabıt Katibi...), nitelik kodu..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Smart Toggle: Bölümüme Uygun */}
            <button
              onClick={() =>
                setFilter((prev) => ({ ...prev, onlyMyDepartment: !prev.onlyMyDepartment }))
              }
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border ${
                filter.onlyMyDepartment
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                  filter.onlyMyDepartment ? 'bg-blue-700 border-blue-700 text-white' : 'border-slate-300'
                }`}
              >
                {filter.onlyMyDepartment && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span>Bölümüme Uygun İlanlar</span>
            </button>

            {/* Smart Toggle: Puanımın Yettikleri */}
            <button
              onClick={() =>
                setFilter((prev) => ({ ...prev, onlyEligibleScore: !prev.onlyEligibleScore }))
              }
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border ${
                filter.onlyEligibleScore
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                  filter.onlyEligibleScore
                    ? 'bg-emerald-700 border-emerald-700 text-white'
                    : 'border-slate-300'
                }`}
              >
                {filter.onlyEligibleScore && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span>Puanımın Yettiği İlanlar</span>
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {/* Kurum Türü */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Kurum Türü</label>
            <select
              value={filter.institutionType}
              onChange={(e) => setFilter((prev) => ({ ...prev, institutionType: e.target.value }))}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {instTypes.map((t) => (
                <option key={t} value={t === 'Tüm Kurumlar' ? 'ALL' : t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Şehir */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Şehir</label>
            <select
              value={filter.city}
              onChange={(e) => setFilter((prev) => ({ ...prev, city: e.target.value }))}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {cities.map((c) => (
                <option key={c} value={c === 'Tüm İller' ? 'ALL' : c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Kadro Statüsü */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Kadro Statüsü</label>
            <select
              value={filter.positionType}
              onChange={(e) => setFilter((prev) => ({ ...prev, positionType: e.target.value }))}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">Tüm Statüler</option>
              <option value="MEMUR">Memur (657 4/A)</option>
              <option value="SOZLESMELI">Sözleşmeli (657 4/B)</option>
              <option value="AKADEMIK">Akademik Personel</option>
            </select>
          </div>

          {/* Sıralama */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Sıralama Ölçütü</label>
            <select
              value={filter.sortBy}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  sortBy: e.target.value as FilterState['sortBy'],
                }))
              }
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="deadline">Son Başvuru (Önce Bitenler)</option>
              <option value="minScore">En Düşük Taban Puan</option>
              <option value="quota">En Çok Kontenjan</option>
              <option value="newest">En Yeni Yayımlanan</option>
            </select>
          </div>
        </div>

        {/* Row 3: Result Count & Reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-2">
            <span>Kriterlere uyan <strong className="text-slate-900 font-semibold">{totalMatches}</strong> ilan listeleniyor</span>
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Filtreleri Sıfırla</span>
          </button>
        </div>
      </div>
    </div>
  );
};

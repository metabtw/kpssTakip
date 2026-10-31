import React, { useState } from 'react';
import { OSYM_DEPARTMENTS_CATALOGUE, OsymDepartmentDetail } from '../data/osymDepartments';
import { QUALIFICATIONS } from '../data/mockData';
import { UserProfile, EducationLevel } from '../types';
import {
  GraduationCap,
  Search,
  ExternalLink,
  BookOpen,
  Check,
  CheckCircle2,
  FileSpreadsheet,
  Info,
} from 'lucide-react';

interface OsymDepartmentsCatalogueViewProps {
  currentProfile: UserProfile;
  onSelectDepartment: (dept: OsymDepartmentDetail) => void;
}

export const OsymDepartmentsCatalogueView: React.FC<OsymDepartmentsCatalogueViewProps> = ({
  currentProfile,
  onSelectDepartment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState<'ALL' | 'Tablo-3' | 'Tablo-2' | 'Tablo-1'>('ALL');

  const filtered = OSYM_DEPARTMENTS_CATALOGUE.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.includes(searchTerm) ||
      item.facultyOrSchool.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.qualificationCodes.some((code) => code.includes(searchTerm));

    const matchesTable = selectedTable === 'ALL' || item.osymTable === selectedTable;

    return matchesSearch && matchesTable;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold mb-1">
              <BookOpen className="w-4 h-4" />
              <span>ÖSYM KPSS Tercih Kılavuzu ve Tablolar Arşivi</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              ÖSYM Mezuniyet Alanları & Nitelik Kodları Rehberi
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              ÖSYM'nin resmi KPSS Tercih Kılavuzunda (Tablo-3 Lisans, Tablo-2 Ön Lisans, Tablo-1 Ortaöğretim) yer alan mezuniyet programlarını ve aldıkları 4 haneli nitelik kodlarını inceleyin.
            </p>
          </div>

          <a
            href="https://www.osym.gov.tr/kpss20261-bazi-kamu-kurum-ve-kuruluslarinin-kadro-ve-pozisyonlarina-yerlestirme-yapmak-icin-tercih-kilavuzu-ve-tablolar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <span>ÖSYM Resmi Kılavuz Sayfası</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Bölüm adı (Bilgisayar, Hukuk, Hemşirelik, Adalet...), Nitelik Kodu (4531, 3005)..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">Tüm Kılavuz Tabloları</option>
            <option value="Tablo-3">Tablo-3: Lisans Bölümleri (4 Yıllık)</option>
            <option value="Tablo-2">Tablo-2: Ön Lisans Programları (2 Yıllık)</option>
            <option value="Tablo-1">Tablo-1: Ortaöğretim Alanları (Lise)</option>
          </select>
        </div>
      </div>

      {/* Catalogue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((dept) => {
          const isSelected = currentProfile.departmentId === dept.id;

          return (
            <div
              key={dept.id}
              className={`bg-white border rounded-xl p-5 transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/20'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span className="font-semibold text-blue-700">{dept.osymTable}</span>
                  <span className="font-mono tabular-nums">Program Kodu: {dept.code}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  {dept.facultyOrSchool}
                </p>

                {/* Qualification Codes Tag Box */}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs mb-4">
                  <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                    Sağladığı ÖSYM Nitelik Kodları:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dept.qualificationCodes.map((code) => {
                      const qual = QUALIFICATIONS[code];
                      return (
                        <span
                          key={code}
                          className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded text-xs"
                          title={qual ? qual.title : ''}
                        >
                          {code}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button: Set as Profile */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                {isSelected ? (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Aktif Bölümünüz
                  </span>
                ) : (
                  <button
                    onClick={() => onSelectDepartment(dept)}
                    className="w-full py-1.5 px-3 text-xs font-semibold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-700 rounded-lg border border-blue-200 hover:border-transparent transition-colors cursor-pointer text-center"
                  >
                    Bu Bölümü Profilim Yap
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

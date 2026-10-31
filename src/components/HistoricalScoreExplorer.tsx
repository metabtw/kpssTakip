import React, { useState } from 'react';
import { HistoricalScore, UserProfile } from '../types';
import { HISTORICAL_SCORES, QUALIFICATIONS } from '../data/mockData';
import { Search, History, TrendingUp, TrendingDown, Filter, Info, Award } from 'lucide-react';

interface HistoricalScoreExplorerProps {
  user: UserProfile;
}

export const HistoricalScoreExplorer: React.FC<HistoricalScoreExplorerProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedScoreType, setSelectedScoreType] = useState<string>('ALL');
  const [onlyMyQualification, setOnlyMyQualification] = useState<boolean>(false);
  const [onlyEligible, setOnlyEligible] = useState<boolean>(false);

  const filteredScores = HISTORICAL_SCORES.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      item.positionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.qualificationCode.includes(searchTerm);

    const matchesYear = selectedYear === 'ALL' || item.year.toString() === selectedYear;
    const matchesType = selectedScoreType === 'ALL' || item.scoreType === selectedScoreType;

    // Kullanıcı tercihine göre bölüm/nitelik kodu filtrelemesi
    if (onlyMyQualification && !user.qualificationCodes.includes(item.qualificationCode)) {
      return false;
    }

    // Kullanıcı tercihine göre puan yeterlilik filtrelemesi
    if (onlyEligible && user.score < item.minScore) {
      return false;
    }

    return matchesSearch && matchesYear && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold mb-1">
              <History className="w-4 h-4" />
              <span>Resmi ÖSYM Taban Puanları Veritabanı</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              ÖSYM KPSS Yerleştirme Sayısal Bilgileri & Taban Puan Analitiği
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              ÖSYM'nin <code className="bg-slate-100 text-blue-800 px-1 py-0.5 rounded font-mono">SinavGrubu/Menu/341</code> arşivindeki <em>"kadro-ve-pozisyonlarina-yerlestirme-sonuclarina-iliskin-sayisal-bilgiler"</em> bültenlerinden derlenen resmi taban ve tavan puanları. Mevcut KPSS puanınız (<strong className="font-mono tabular-nums text-blue-700">{user.score.toFixed(2)}</strong>) ile anlık kıyaslanır.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="https://www.osym.gov.tr/SinavGrubu/Menu/341"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <span>ÖSYM Menü/341 Arşivi</span>
              <Info className="w-3.5 h-3.5 text-slate-500" />
            </a>

            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs flex items-center gap-2.5">
              <Award className="w-4 h-4 text-blue-700" />
              <div>
                <span className="block text-slate-500 text-[11px]">Kayıtlı Puanınız:</span>
                <span className="font-mono tabular-nums font-bold text-blue-900 text-sm">
                  {user.score.toFixed(2)} ({user.scoreType.replace('_', ' ')})
                </span>
              </div>
            </div>
          </div>
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
            placeholder="Kadro unvanı (Mühendis, Zabıt Katibi...), Kurum veya Nitelik Kodu (4531, 4001...)..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Kullanıcı Tercihleri: Bölümüme Ait */}
          <button
            onClick={() => setOnlyMyQualification((prev) => !prev)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              onlyMyQualification
                ? 'bg-blue-50 text-blue-900 border-blue-300 font-bold'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Bölümümün Kodları ({user.qualificationCodes.join(', ')})
          </button>

          {/* Kullanıcı Tercihleri: Puanımın Yettikleri */}
          <button
            onClick={() => setOnlyEligible((prev) => !prev)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              onlyEligible
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Puanımın Yettikleri (≤ {user.score.toFixed(2)})
          </button>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">Tüm Dönemler (2024 - 2026)</option>
            <option value="2026">2026 Yerleştirmeleri (KPSS 2026/1)</option>
            <option value="2025">2025 Yerleştirmeleri (KPSS 2025/2)</option>
            <option value="2024">2024 Yerleştirmeleri (KPSS 2024/1)</option>
          </select>

          <select
            value={selectedScoreType}
            onChange={(e) => setSelectedScoreType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">Tüm Puan Türleri</option>
            <option value="KPSS_P3">KPSS P3 (Lisans)</option>
            <option value="KPSS_P93">KPSS P93 (Önlisans)</option>
            <option value="KPSS_P1">KPSS P1 (A Grubu)</option>
          </select>
        </div>
      </div>

      {/* Scores Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">ÖSYM Atama Dönemi & Link</th>
                <th className="py-3 px-4">Kurum Adı</th>
                <th className="py-3 px-4">Kadro & Unvan</th>
                <th className="py-3 px-4">Şehir</th>
                <th className="py-3 px-4 text-center">Nitelik Kodu</th>
                <th className="py-3 px-4 text-right">Kontenjan</th>
                <th className="py-3 px-4 text-right">Puan Türü</th>
                <th className="py-3 px-4 text-right">Taban Puan</th>
                <th className="py-3 px-4 text-right">Tavan Puan</th>
                <th className="py-3 px-4 text-center">Puanınızla Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {filteredScores.length > 0 ? (
                filteredScores.map((score) => {
                  const diff = user.score - score.minScore;
                  const isSuccess = diff >= 0;
                  const qual = QUALIFICATIONS[score.qualificationCode];

                  return (
                    <tr key={score.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-sans font-medium text-slate-800">
                        <div>{score.term}</div>
                        {score.osymUrl && (
                          <a
                            href={score.osymUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 underline mt-0.5"
                          >
                            <span>ÖSYM Sayfası</span>
                            <Info className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-700">
                        {score.institutionName}
                      </td>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                        {score.positionTitle}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600">
                        {score.city}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-800 font-semibold"
                          title={qual ? qual.title : ''}
                        >
                          {score.qualificationCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-800">
                        {score.quota}
                      </td>
                      <td className="py-3 px-4 text-right font-sans text-slate-600">
                        {score.scoreType.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {score.minScore.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">
                        {score.maxScore ? score.maxScore.toFixed(2) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            isSuccess ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isSuccess ? (
                            <>
                              <TrendingUp className="w-3.5 h-3.5" />
                              +{diff.toFixed(2)}
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-3.5 h-3.5" />
                              {diff.toFixed(2)}
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-sans">
                    Aranan kriterlere uygun geçmiş taban puan kaydı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

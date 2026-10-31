import React from 'react';
import { Posting, UserProfile } from '../types';
import { QUALIFICATIONS } from '../data/mockData';
import {
  X,
  ExternalLink,
  Calendar,
  MapPin,
  Users,
  Award,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
  Landmark,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface PostingDetailModalProps {
  posting: Posting | null;
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const PostingDetailModal: React.FC<PostingDetailModalProps> = ({
  posting,
  user,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !posting) return null;

  const scoreDiff = user.score - posting.minScore;
  const isScoreEligible = scoreDiff >= 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Landmark className="w-3.5 h-3.5 text-blue-700" />
              <span className="font-semibold text-slate-800">{posting.institutionName}</span>
              <span aria-hidden="true">·</span>
              <span>{posting.institutionType}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">İlan No: {posting.sourceId}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {posting.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Snapshot Info Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div>
              <span className="block text-xs text-slate-500">Konum / Şehir</span>
              <span className="font-medium text-slate-900 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {posting.city}
              </span>
            </div>
            <div>
              <span className="block text-xs text-slate-500">Kontenjan Adedi</span>
              <span className="font-semibold text-slate-900 font-mono tabular-nums flex items-center gap-1 mt-0.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {posting.totalQuota} Kadro
              </span>
            </div>
            <div>
              <span className="block text-xs text-slate-500">İstihdam Türü</span>
              <span className="font-medium text-slate-900 mt-0.5 block">
                {posting.positionType === 'MEMUR'
                  ? '657 4/A Kadrolu'
                  : posting.positionType === 'SOZLESMELI'
                  ? '657 4/B Sözleşmeli'
                  : 'Akademik'}
              </span>
            </div>
            <div>
              <span className="block text-xs text-slate-500">Son Başvuru Tarihi</span>
              <span className="font-semibold text-slate-900 font-mono tabular-nums flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                {posting.deadlineDate}
              </span>
            </div>
          </div>

          {/* User Score Match Analysis Box */}
          <div
            className={`border rounded-xl p-4 ${
              isScoreEligible
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-rose-50/70 border-rose-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isScoreEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4
                    className={`font-semibold text-sm ${
                      isScoreEligible ? 'text-emerald-900' : 'text-rose-900'
                    }`}
                  >
                    {isScoreEligible
                      ? 'KPSS Taban Puan Şartını Karşılıyorsunuz'
                      : 'KPSS Taban Puanınız Bu İlan İçin Yetersiz'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    İlan Taban Puanı: <strong className="font-mono tabular-nums">{posting.minScore.toFixed(2)}</strong> ({posting.requiredScoreType.replace('_', ' ')}) · Sizin Puanınız: <strong className="font-mono tabular-nums">{user.score.toFixed(2)}</strong> ({user.scoreType.replace('_', ' ')})
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-base font-bold font-mono tabular-nums ${
                    isScoreEligible ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {isScoreEligible ? `+${scoreDiff.toFixed(2)}` : scoreDiff.toFixed(2)}
                </span>
                <span className="block text-xs text-slate-500">Puan Farkı</span>
              </div>
            </div>
          </div>

          {/* Critical Feature: Historical Scores Analysis */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-700" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Geçmiş Yıllardaki Atama & Taban Puan Analitiği
                </h3>
              </div>
              <span className="text-xs text-slate-500">ÖSYM Merkezi & Kurumsal Atama Arşivi</span>
            </div>

            {posting.historicalScores && posting.historicalScores.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">Atama Dönemi & ÖSYM Bülteni</th>
                      <th className="py-2.5 px-3">Kadro Unvanı</th>
                      <th className="py-2.5 px-3 text-right">Kontenjan</th>
                      <th className="py-2.5 px-3 text-right">Taban Puan (Min)</th>
                      <th className="py-2.5 px-3 text-right">Tavan Puan (Maks)</th>
                      <th className="py-2.5 px-3 text-center">Puanınızla Kıyaslama</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                    {posting.historicalScores.map((hs) => {
                      const diff = user.score - hs.minScore;
                      const hasSucceeded = diff >= 0;
                      return (
                        <tr key={hs.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-sans font-medium text-slate-800">
                            <div>{hs.term}</div>
                            {hs.osymUrl && (
                              <a
                                href={hs.osymUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 underline mt-0.5"
                              >
                                <span>ÖSYM Sayısal Bilgiler Sayfası</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-sans text-slate-600">
                            {hs.positionTitle}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-700">
                            {hs.quota}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                            {hs.minScore.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-500">
                            {hs.maxScore ? hs.maxScore.toFixed(2) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-semibold ${
                                hasSucceeded ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {hasSucceeded ? (
                                <>
                                  <TrendingUp className="w-3 h-3" />
                                  +{diff.toFixed(2)} Yetiyor
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="w-3 h-3" />
                                  {diff.toFixed(2)} Yetersiz
                                </>
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                Bu kadro veya unvan için doğrudan eşleşen merkezi atama geçmişi henüz kayıt altına alınmamış; kurum bu alımı ilk kez veya özel mülakatla yapıyor olabilir.
              </div>
            )}
          </div>

          {/* Aranan Nitelik Kodları & Şartlar */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <FileText className="w-4 h-4 text-blue-700" />
              <h3 className="font-semibold text-slate-900 text-sm">
                Aranan ÖSYM Nitelik Kodları & Bölüm Şartları
              </h3>
            </div>

            <div className="space-y-2">
              {posting.qualificationCodes.map((code) => {
                const qual = QUALIFICATIONS[code];
                const isMatched = user.qualificationCodes.includes(code);
                return (
                  <div
                    key={code}
                    className={`p-3 rounded-lg border text-xs flex items-start gap-3 ${
                      isMatched
                        ? 'bg-blue-50/60 border-blue-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded text-xs shrink-0">
                      {code}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">
                        {qual ? qual.title : 'Özel Şart Kodu'}
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        {qual ? qual.description : 'Belirtilen bölümden mezun olmak veya sertifikaya sahip olmak.'}
                      </p>
                    </div>
                    {isMatched && (
                      <span className="text-xs font-semibold text-blue-700 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Bölümünüzle Uyuşuyor
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Başvuru Şartları & Açıklama */}
          <div>
            <h3 className="font-semibold text-slate-900 text-sm mb-2">
              Başvuru Genel ve Özel Şartları
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {posting.requirementsText}
            </div>
          </div>

          {/* Başvuru Şekli */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-slate-900 block">Başvuru Yöntemi:</span>
              <span className="text-slate-600">{posting.applicationMethod}</span>
            </div>
            <div className="text-slate-500">
              Yayımlanma: <span className="font-mono tabular-nums">{posting.publishDate}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Kapat
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {posting.officialWebsiteUrl && (
              <a
                href={posting.officialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                <span>Kurum Resmi Sitesi</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}

            <a
              href={posting.directApplicationUrl || 'https://isealimkariyerkapisi.cbiko.gov.tr/'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>Resmi Başvuru Portalı ({posting.sourcePlatform.replace('_', ' ')})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

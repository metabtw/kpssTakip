import React from 'react';
import { Posting, UserProfile } from '../types';
import { Bookmark, ExternalLink, Calendar, MapPin, Users, Award, ChevronRight } from 'lucide-react';

interface PostingCardProps {
  posting: Posting;
  user: UserProfile;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onSelect: (posting: Posting) => void;
}

export const PostingCard: React.FC<PostingCardProps> = ({
  posting,
  user,
  isSaved,
  onToggleSave,
  onSelect,
}) => {
  // Puan farkı hesaplama
  const scoreDiff = user.score - posting.minScore;
  const isScoreEligible = scoreDiff >= 0;

  // Bölüm eşleşmesi kontrolü
  const isDeptMatch = posting.qualificationCodes.some((code) =>
    user.qualificationCodes.includes(code)
  );

  // Kalan gün hesabı (güncel referans: 2026-10-31)
  const today = new Date('2026-10-31');
  const deadline = new Date(posting.deadlineDate);
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formatPlatform = (p: string) => {
    switch (p) {
      case 'SBB_KAMU_ILAN':
        return 'SBB Kamu İlan';
      case 'KARIYER_KAPISI':
        return 'Kariyer Kapısı';
      case 'ISKUR':
        return 'İŞKUR';
      case 'RESMI_GAZETE':
        return 'Resmi Gazete';
      default:
        return 'Kamu Portalı';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between">
      <div>
        {/* Top Header: Platform & Deadline */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">{posting.institutionName}</span>
            <span aria-hidden="true">·</span>
            <span>{formatPlatform(posting.sourcePlatform)}</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono tabular-nums text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {diffDays > 0 ? (
              <span className={diffDays <= 5 ? 'text-amber-700 font-semibold' : 'text-slate-600'}>
                Son {diffDays} gün ({posting.deadlineDate})
              </span>
            ) : (
              <span className="text-red-600 font-semibold">Süresi Doldu</span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect(posting)}
          className="text-base font-bold text-slate-900 hover:text-blue-700 transition-colors cursor-pointer mb-2.5 line-clamp-1"
        >
          {posting.title}
        </h3>

        {/* Unboxed Metadata Line (Zero-Pill Rule) */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600 mb-3.5">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {posting.city}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <strong className="font-mono tabular-nums text-slate-800">{posting.totalQuota}</strong> Kadro
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>
            {posting.positionType === 'MEMUR'
              ? 'Memur (657 4/A)'
              : posting.positionType === 'SOZLESMELI'
              ? 'Sözleşmeli (657 4/B)'
              : 'Akademik'}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>
            {posting.educationLevel === 'LISANS'
              ? 'Lisans'
              : posting.educationLevel === 'ONLISANS'
              ? 'Önlisans'
              : 'Ortaöğretim'}
          </span>
        </div>

        {/* Requirement & Score Match Row */}
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <span className="text-slate-500">Baraj Puanı: </span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {posting.requiredScoreType.replace('_', ' ')} ≥ {posting.minScore.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Puan Uygunluk Durumu */}
            <span
              className={`font-mono tabular-nums font-medium ${
                isScoreEligible ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {isScoreEligible
                ? `+${scoreDiff.toFixed(2)} puan üstündesiniz`
                : `${scoreDiff.toFixed(2)} puan eksik`}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            {/* Bölüm Uygunluk Durumu */}
            <span className={isDeptMatch ? 'text-blue-700 font-medium' : 'text-slate-500'}>
              {isDeptMatch ? 'Bölümünüz Uygun' : 'Farklı Bölüm'}
            </span>
          </div>
        </div>

        {/* Short Summary Snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4">
          {posting.summary}
        </p>
      </div>

      {/* Card Footer: Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
        <button
          onClick={() => onToggleSave(posting.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer border ${
            isSaved
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          title={isSaved ? 'Kaydedilenlerden Çıkar' : 'İlanı Kaydet'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
          <span>{isSaved ? 'Kaydedildi' : 'Kaydet'}</span>
        </button>

        <button
          onClick={() => onSelect(posting)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <span>İlan Detayı & Taban Puanlar</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

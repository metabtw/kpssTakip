import React, { useState, useEffect } from 'react';
import { UserProfile, EducationLevel, ScoreType } from '../types';
import { DEPARTMENTS } from '../data/mockData';
import { UserCheck, CheckCircle2, AlertCircle, Edit3, Save, X } from 'lucide-react';

interface ProfileBannerProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  eligibleCount: number;
  totalActiveCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileBanner: React.FC<ProfileBannerProps> = ({
  profile,
  setProfile,
  eligibleCount,
  totalActiveCount,
  isOpen,
  onClose,
}) => {
  const [eduLevel, setEduLevel] = useState<EducationLevel>(profile.educationLevel);
  const [deptId, setDeptId] = useState<string>(profile.departmentId);
  const [scoreType, setScoreType] = useState<ScoreType>(profile.scoreType);
  const [score, setScore] = useState<number>(profile.score);
  const [gender, setGender] = useState<'ERKEK' | 'KADIN' | 'BELIRTILMEDI'>(profile.gender || 'BELIRTILMEDI');
  const [examYear, setExamYear] = useState<number>(profile.examYear || 2024);
  const [residenceCity, setResidenceCity] = useState<string>(profile.residenceCity || 'Ankara');

  // Kullanıcının başta seçtiği/güncel tercihleri forma senkronize et
  useEffect(() => {
    setEduLevel(profile.educationLevel);
    setDeptId(profile.departmentId);
    setScoreType(profile.scoreType);
    setScore(profile.score);
    setGender(profile.gender || 'BELIRTILMEDI');
    setExamYear(profile.examYear || 2024);
    setResidenceCity(profile.residenceCity || 'Ankara');
  }, [profile, isOpen]);

  // Filter available departments by education level
  const filteredDepts = DEPARTMENTS.filter((d) => d.educationLevel === eduLevel);

  const handleEduLevelChange = (level: EducationLevel) => {
    setEduLevel(level);
    const validDepts = DEPARTMENTS.filter((d) => d.educationLevel === level);
    if (validDepts.length > 0) {
      setDeptId(validDepts[0].id);
    }
    // Update default score type
    if (level === 'LISANS') setScoreType('KPSS_P3');
    else if (level === 'ONLISANS') setScoreType('KPSS_P93');
    else setScoreType('KPSS_P94');
  };

  const handleSave = () => {
    const selectedDept = DEPARTMENTS.find((d) => d.id === deptId);
    setProfile({
      name: profile.name,
      gender,
      examYear,
      educationLevel: eduLevel,
      departmentId: deptId,
      departmentName: selectedDept ? selectedDept.name : 'Belirtilmedi',
      qualificationCodes: selectedDept ? selectedDept.qualificationCodes : ['4001'],
      scoreType,
      score: Number(score) || 70,
      residenceCity,
      isCompleted: true,
    });
    onClose();
  };

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Compact Bar Mode */}
        {!isOpen ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-700" />
                Aktif Profil:
              </span>
              <span className="text-slate-800 font-medium">
                {profile.departmentName} ({profile.educationLevel === 'LISANS' ? 'Lisans' : profile.educationLevel === 'ONLISANS' ? 'Önlisans' : 'Ortaöğretim'})
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-700">
                {profile.examYear || 2024} {profile.scoreType.replace('_', ' ')}:{' '}
                <strong className="text-blue-700 font-mono tabular-nums font-semibold">{profile.score.toFixed(2)}</strong>
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600">
                {profile.gender === 'ERKEK' ? 'Erkek' : profile.gender === 'KADIN' ? 'Kadın' : 'Cinsiyet: Belirtilmedi'}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-emerald-700 font-medium">
                {eligibleCount} uygun ilan
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono tabular-nums hidden lg:inline">
                Toplam {totalActiveCount} aktif ilan taranıyor
              </span>
              <button
                onClick={onClose}
                className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 underline underline-offset-4 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Profili & Puanı Değiştir
              </button>
            </div>
          </div>
        ) : (
          /* Expanded Edit Panel */
          <div className="py-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Profil ve KPSS Puan Tanımlaması
                </h2>
                <p className="text-xs text-slate-500">
                  İlan akışı, cinsiyet şartları ve geçmiş ÖSYM taban puan karşılaştırmaları bu değerlere göre anlık hesaplanır.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Öğrenim Seviyesi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Öğrenim Seviyesi
                </label>
                <select
                  value={eduLevel}
                  onChange={(e) => handleEduLevelChange(e.target.value as EducationLevel)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="LISANS">Lisans (4 Yıl)</option>
                  <option value="ONLISANS">Önlisans (2 Yıl)</option>
                  <option value="LISE">Ortaöğretim (Lise)</option>
                </select>
              </div>

              {/* Bölüm */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bölüm
                </label>
                <select
                  value={deptId}
                  onChange={(e) => setDeptId(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 truncate"
                >
                  {filteredDepts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} (Kod: {d.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sınav Yılı */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sınav Yılı
                </label>
                <select
                  value={examYear}
                  onChange={(e) => setExamYear(parseInt(e.target.value))}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value={2026}>2026 KPSS</option>
                  <option value={2025}>2025 KPSS</option>
                  <option value={2024}>2024 KPSS</option>
                  <option value={2022}>2022 KPSS</option>
                </select>
              </div>

              {/* KPSS Puan Türü */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Puan Türü
                </label>
                <select
                  value={scoreType}
                  onChange={(e) => setScoreType(e.target.value as ScoreType)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {eduLevel === 'LISANS' && (
                    <>
                      <option value="KPSS_P3">KPSS P3 (Lisans)</option>
                      <option value="KPSS_P1">KPSS P1 (A Grubu)</option>
                      <option value="ALES">ALES</option>
                    </>
                  )}
                  {eduLevel === 'ONLISANS' && (
                    <option value="KPSS_P93">KPSS P93</option>
                  )}
                  {eduLevel === 'LISE' && (
                    <option value="KPSS_P94">KPSS P94</option>
                  )}
                </select>
              </div>

              {/* KPSS Puanı & Kaydet */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  KPSS Puanınız
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.01"
                    min="50"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="82.45"
                  />
                  <button
                    onClick={handleSave}
                    className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Kaydet</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cinsiyet Seçimi Row */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Cinsiyet:</span>
                <div className="flex items-center gap-1">
                  {[
                    { id: 'ERKEK', label: 'Erkek' },
                    { id: 'KADIN', label: 'Kadın' },
                    { id: 'BELIRTILMEDI', label: 'Fark Etmez' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGender(g.id as any)}
                      className={`px-2.5 py-1 rounded-md border font-medium transition-colors cursor-pointer ${
                        gender === g.id
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-slate-500">
                İkamet: <strong className="text-slate-800">{residenceCity}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { UserProfile, EducationLevel, ScoreType } from '../types';
import { DEPARTMENTS } from '../data/mockData';
import {
  Sparkles,
  GraduationCap,
  Award,
  Calendar,
  User,
  MapPin,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  initialProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onSkip?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  initialProfile,
  onSave,
  onSkip,
}) => {
  const [eduLevel, setEduLevel] = useState<EducationLevel>(initialProfile.educationLevel);
  const [deptId, setDeptId] = useState<string>(initialProfile.departmentId);
  const [examYear, setExamYear] = useState<number>(initialProfile.examYear || 2024);
  const [scoreType, setScoreType] = useState<ScoreType>(initialProfile.scoreType || 'KPSS_P3');
  const [score, setScore] = useState<number>(initialProfile.score || 75.0);
  const [gender, setGender] = useState<'ERKEK' | 'KADIN' | 'BELIRTILMEDI'>(
    initialProfile.gender || 'BELIRTILMEDI'
  );
  const [residenceCity, setResidenceCity] = useState<string>(
    initialProfile.residenceCity || 'Ankara'
  );

  // Kullanıcının daha önce seçtiği bilgilerle formu senkronize et
  useEffect(() => {
    if (isOpen) {
      setEduLevel(initialProfile.educationLevel);
      setDeptId(initialProfile.departmentId);
      setExamYear(initialProfile.examYear || 2024);
      setScoreType(initialProfile.scoreType || 'KPSS_P3');
      setScore(initialProfile.score || 75.0);
      setGender(initialProfile.gender || 'BELIRTILMEDI');
      setResidenceCity(initialProfile.residenceCity || 'Ankara');
    }
  }, [initialProfile, isOpen]);

  if (!isOpen) return null;

  const availableDepts = DEPARTMENTS.filter((d) => d.educationLevel === eduLevel);

  const handleEduChange = (newLevel: EducationLevel) => {
    setEduLevel(newLevel);
    const valid = DEPARTMENTS.filter((d) => d.educationLevel === newLevel);
    if (valid.length > 0) {
      setDeptId(valid[0].id);
    }
    if (newLevel === 'LISANS') setScoreType('KPSS_P3');
    else if (newLevel === 'ONLISANS') setScoreType('KPSS_P93');
    else setScoreType('KPSS_P94');
  };

  const handleFinish = () => {
    const selectedDept = DEPARTMENTS.find((d) => d.id === deptId);
    onSave({
      name: initialProfile.name || 'Aday',
      gender,
      examYear,
      educationLevel: eduLevel,
      departmentId: deptId,
      departmentName: selectedDept ? selectedDept.name : 'Genel Mezuniyet',
      qualificationCodes: selectedDept ? selectedDept.qualificationCodes : ['4001'],
      scoreType,
      score: Number(score) || 70,
      residenceCity,
      isCompleted: true,
    });
  };

  const cities = [
    'Tüm Türkiye (Fark Etmez)',
    'Ankara',
    'İstanbul',
    'İzmir',
    'Bursa',
    'Antalya',
    'Adana',
    'Konya',
    'Trabzon',
    'Diyarbakır',
    'Kocaeli',
    'Eskişehir',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-linear-to-r from-blue-700 to-indigo-800 px-6 py-6 text-white">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-200 mb-1">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Kişiselleştirilmiş Kamu İlan Asistanı</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Kamu İlan & KPSS Tercih Profilinizi Oluşturun
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl leading-relaxed">
            Mezun olduğunuz bölüm, girdiğiniz KPSS sınavı ve puanınızı belirterek size tam uyan ilanları ve geçmiş ÖSYM taban puanlarını anında listeleyin.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 text-sm max-h-[75vh] overflow-y-auto">
          {/* 1. Öğrenim Düzeyi */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-700" />
              1. Öğrenim Düzeyi
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: 'LISANS', label: 'Lisans', sub: '4 Yıllık Fakülte' },
                { id: 'ONLISANS', label: 'Önlisans', sub: '2 Yıllık MYO' },
                { id: 'LISE', label: 'Ortaöğretim', sub: 'Lise & Dengi' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleEduChange(item.id as EducationLevel)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    eduLevel === item.id
                      ? 'border-blue-700 bg-blue-50/70 text-blue-900 ring-2 ring-blue-700/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block font-bold text-xs sm:text-sm">{item.label}</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">{item.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Bölüm Seçimi */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              2. Mezun Olunan / Okunan Bölüm
            </label>
            <select
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            >
              {availableDepts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (ÖSYM Nitelik: {d.qualificationCodes.join(', ')})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Sınav Yılı ve KPSS Puan Türü & Puanı */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-700" />
                Sınav Yılı
              </label>
              <select
                value={examYear}
                onChange={(e) => setExamYear(parseInt(e.target.value))}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              >
                <option value={2026}>2026 KPSS</option>
                <option value={2025}>2025 KPSS</option>
                <option value={2024}>2024 KPSS (Geçerli)</option>
                <option value={2022}>2022 KPSS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-blue-700" />
                Puan Türü
              </label>
              <select
                value={scoreType}
                onChange={(e) => setScoreType(e.target.value as ScoreType)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              >
                {eduLevel === 'LISANS' && (
                  <>
                    <option value="KPSS_P3">KPSS P3 (Lisans Genel)</option>
                    <option value="KPSS_P1">KPSS P1 (A Grubu/Müfettişlik)</option>
                    <option value="ALES">ALES Sayısal/EA</option>
                  </>
                )}
                {eduLevel === 'ONLISANS' && (
                  <option value="KPSS_P93">KPSS P93 (Önlisans Genel)</option>
                )}
                {eduLevel === 'LISE' && (
                  <option value="KPSS_P94">KPSS P94 (Ortaöğretim Genel)</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                KPSS Puanınız
              </label>
              <input
                type="number"
                step="0.01"
                min="50"
                max="100"
                value={score}
                onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
                placeholder="Örn: 83.45"
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono tabular-nums font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* 4. Cinsiyet ve İkamet Şehri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-700" />
                Cinsiyet (Özel Kadro Şartları İçin)
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'ERKEK', label: 'Erkek' },
                  { id: 'KADIN', label: 'Kadın' },
                  { id: 'BELIRTILMEDI', label: 'Fark Etmez' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGender(g.id as any)}
                    className={`flex-1 py-2 px-2 text-xs rounded-lg border font-medium transition-colors cursor-pointer text-center ${
                      gender === g.id
                        ? 'border-blue-700 bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-700" />
                İkamet / Tercih Ettiğiniz İl
              </label>
              <select
                value={residenceCity}
                onChange={(e) => setResidenceCity(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Trust Marker */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Verileriniz tarayıcınızda güvenle tutulur. Bu bilgiler yalnızca kamu ilanları ile ÖSYM geçmiş taban puanlarını karşılaştırmak için kullanılır.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          {onSkip ? (
            <button
              onClick={onSkip}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
            >
              Şimdilik Atla (Varsayılan Profil)
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleFinish}
            className="flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>Profili Kaydet ve İlanları İncele</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

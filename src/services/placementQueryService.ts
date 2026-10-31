/**
 * ÖSYM Yerleştirme Veritabanı Dinamik Sorgu ve Eşleştirme Motoru
 * Kullanıcının tercih ettiği bölüm, KPSS puanı, sınav yılı ve cinsiyetine göre
 * aktif kamu ilanları ve geçmiş ÖSYM taban puanları üzerinde gerçek zamanlı filtreleme ve kıyaslama yapar.
 */

import { UserProfile, Posting, HistoricalScore, FilterState } from '../types';
import { SAMPLE_POSTINGS, HISTORICAL_SCORES, DEPARTMENTS } from '../data/mockData';

const STORAGE_KEY = 'kamuilan_user_profile_v2';

export interface QueryResult {
  postings: Posting[];
  matchedCount: number;
  scoreEligibleCount: number;
  departmentEligibleCount: number;
  averageBaseScore: number;
}

/**
 * Kullanıcı tercihlerini yerel depolamadan yükler
 */
export function loadSavedProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.departmentId && parsed.score !== undefined) {
      return parsed as UserProfile;
    }
  } catch (e) {
    console.error('Profil yükleme hatası:', e);
  }
  return null;
}

/**
 * Kullanıcı tercihlerini kalıcı olarak saklar
 */
export function saveProfileToStorage(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Profil saklama hatası:', e);
  }
}

/**
 * Kullanıcının aktif tercihlerine göre ilan akışını sorgular
 */
export function queryPostingsByPreferences(
  profile: UserProfile,
  filter: FilterState,
  savedIds: string[],
  showSavedOnly: boolean
): QueryResult {
  const userQuals = new Set(profile.qualificationCodes);

  let departmentEligibleTotal = 0;
  let scoreEligibleTotal = 0;
  let scoreSum = 0;
  let countWithScores = 0;

  const results = SAMPLE_POSTINGS.filter((posting) => {
    // 1. Kaydedilenler filtresi
    if (showSavedOnly && !savedIds.includes(posting.id)) {
      return false;
    }

    // 2. Metin Arama (Kurum, unvan, il, özet, nitelik kodu)
    if (filter.searchQuery.trim() !== '') {
      const q = filter.searchQuery.toLowerCase();
      const match =
        posting.title.toLowerCase().includes(q) ||
        posting.institutionName.toLowerCase().includes(q) ||
        posting.city.toLowerCase().includes(q) ||
        posting.summary.toLowerCase().includes(q) ||
        posting.qualificationCodes.some((code) => code.includes(q));

      if (!match) return false;
    }

    // 3. Kurum Türü Filtresi
    if (filter.institutionType !== 'ALL' && posting.institutionType !== filter.institutionType) {
      return false;
    }

    // 4. Şehir Filtresi
    if (filter.city !== 'ALL' && !posting.city.includes(filter.city)) {
      return false;
    }

    // 5. Kadro Türü
    if (filter.positionType !== 'ALL' && posting.positionType !== filter.positionType) {
      return false;
    }

    // İstatistik Takibi
    const isDeptMatch = posting.qualificationCodes.some((code) => userQuals.has(code));
    const isScoreMatch = profile.score >= posting.minScore;

    if (isDeptMatch) departmentEligibleTotal++;
    if (isScoreMatch) scoreEligibleTotal++;
    if (posting.minScore) {
      scoreSum += posting.minScore;
      countWithScores++;
    }

    // 6. Kullanıcı Tercihleri: Yalnızca Bölümüme Uygun
    if (filter.onlyMyDepartment && !isDeptMatch) {
      return false;
    }

    // 7. Kullanıcı Tercihleri: Yalnızca Puanımın Yettikleri
    if (filter.onlyEligibleScore && !isScoreMatch) {
      return false;
    }

    // 8. Cinsiyet Şartı Kontrolü (varsa)
    if (
      posting.genderRequirement &&
      posting.genderRequirement !== 'HEPSI' &&
      profile.gender !== 'BELIRTILMEDI' &&
      posting.genderRequirement !== profile.gender
    ) {
      return false;
    }

    return true;
  });

  // Sıralama
  results.sort((a, b) => {
    if (filter.sortBy === 'deadline') {
      return new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime();
    }
    if (filter.sortBy === 'minScore') {
      return a.minScore - b.minScore;
    }
    if (filter.sortBy === 'quota') {
      return b.totalQuota - a.totalQuota;
    }
    if (filter.sortBy === 'newest') {
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    }
    return 0;
  });

  return {
    postings: results,
    matchedCount: results.length,
    scoreEligibleCount: scoreEligibleTotal,
    departmentEligibleCount: departmentEligibleTotal,
    averageBaseScore: countWithScores > 0 ? Number((scoreSum / countWithScores).toFixed(2)) : 70.0,
  };
}

/**
 * Kullanıcının bölümü ve puanına göre ÖSYM geçmiş taban puanlarını sorgular
 */
export function queryHistoricalScoresByPreferences(
  profile: UserProfile,
  searchTerm: string,
  selectedYear: string,
  selectedScoreType: string
): HistoricalScore[] {
  return HISTORICAL_SCORES.filter((score) => {
    // Arama
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matches =
        score.positionTitle.toLowerCase().includes(q) ||
        score.institutionName.toLowerCase().includes(q) ||
        score.city.toLowerCase().includes(q) ||
        score.qualificationCode.includes(q);
      if (!matches) return false;
    }

    // Yıl / Dönem
    if (selectedYear !== 'ALL' && score.year.toString() !== selectedYear) {
      return false;
    }

    // Puan Türü
    if (selectedScoreType !== 'ALL' && score.scoreType !== selectedScoreType) {
      return false;
    }

    return true;
  });
}

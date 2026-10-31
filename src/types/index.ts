export type EducationLevel = 'LISANS' | 'ONLISANS' | 'LISE';

export type PositionType = 'MEMUR' | 'SOZLESMELI' | 'ISCI' | 'AKADEMIK';

export type ScoreType =
  | 'KPSS_P3'
  | 'KPSS_P93'
  | 'KPSS_P94'
  | 'KPSS_P1'
  | 'ALES'
  | 'PUANSIZ';

export interface Department {
  id: string;
  code: string;
  name: string;
  educationLevel: EducationLevel;
  qualificationCodes: string[];
}

export interface Qualification {
  code: string;
  title: string;
  description: string;
}

export interface HistoricalScore {
  id: string;
  year: number;
  term: string; // Örn: "KPSS-2026/1 Yerleştirme Sonuçları"
  institutionName: string;
  positionTitle: string;
  city: string;
  quota: number;
  scoreType: ScoreType;
  minScore: number;
  maxScore: number;
  qualificationCode: string;
  osymUrl: string; // ÖSYM Sayısal Bilgiler Sayfa Linki
  tableLevel: 'LISANS' | 'ONLISANS' | 'LISE';
}

export interface Posting {
  id: string;
  sourceId: string;
  sourceUrl: string;
  directApplicationUrl: string;
  officialWebsiteUrl?: string;
  sourcePlatform: 'SBB_KAMU_ILAN' | 'KARIYER_KAPISI' | 'ISKUR' | 'RESMI_GAZETE' | 'MEMURLAR_NET';
  institutionName: string;
  institutionType: 'Bakanlık' | 'Üniversite' | 'Belediye' | 'KİT' | 'Bağımsız Kurul' | 'Diğer';
  title: string;
  positionType: PositionType;
  city: string;
  totalQuota: number;
  requiredScoreType: ScoreType;
  minScore: number;
  educationLevel: EducationLevel;
  genderRequirement?: 'ERKEK' | 'KADIN' | 'HEPSI';
  publishDate: string;
  deadlineDate: string;
  isActive: boolean;
  summary: string;
  requirementsText: string;
  applicationMethod: string;
  qualificationCodes: string[];
  historicalScores: HistoricalScore[];
}

export interface UserProfile {
  name: string;
  gender: 'ERKEK' | 'KADIN' | 'BELIRTILMEDI';
  examYear: number;
  educationLevel: EducationLevel;
  departmentId: string;
  departmentName: string;
  qualificationCodes: string[];
  scoreType: ScoreType;
  score: number;
  residenceCity: string;
  isCompleted: boolean;
}

export interface FilterState {
  searchQuery: string;
  educationLevel: EducationLevel | 'ALL';
  institutionType: string;
  city: string;
  positionType: string;
  onlyEligibleScore: boolean;
  onlyMyDepartment: boolean;
  sortBy: 'deadline' | 'quota' | 'minScore' | 'newest';
}

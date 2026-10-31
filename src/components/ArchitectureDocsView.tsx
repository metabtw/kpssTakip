import React, { useState } from 'react';
import { Database, Terminal, FileCode2, Copy, Check, Layers, GitBranch, Cpu } from 'lucide-react';

export const ArchitectureDocsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'prisma' | 'scraper' | 'nextjs'>('prisma');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const prismaSchemaCode = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum EducationLevel {
  LISE          // Ortaöğretim
  ONLISANS      // 2 Yıllık Önlisans
  LISANS        // 4 Yıllık Lisans
  YUKSEK_LISANS // Yüksek Lisans
  DOKTORA       // Doktora
}

enum PositionType {
  MEMUR          // 657 Sayılı Kanun 4/A Kadrolu Memur
  SOZLESMELI     // 657 Sayılı Kanun 4/B Sözleşmeli Personel
  ISCI           // 4857 Sayılı İş Kanunu Sürekli İşçi
  AKADEMIK       // 2547 Sayılı Kanun (Arş. Gör., Öğr. Gör., Doçent)
  ASKERI_EMNIYET // TSK, EGM, Jandarma
}

enum ScoreType {
  KPSS_P3   // Lisans Genel Yetenek - Genel Kültür
  KPSS_P93  // Önlisans Genel Yetenek - Genel Kültür
  KPSS_P94  // Ortaöğretim Genel Yetenek - Genel Kültür
  KPSS_P1   // A Grubu / Uzman & Müfettiş Yardımcılığı
  ALES
  YDS
  PUANSIZ
}

model User {
  id             String          @id @default(uuid())
  email          String          @unique
  name           String?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  
  // Profil & Öğrenim Bilgileri
  educationLevel EducationLevel?
  departmentId   String?
  department     Department?     @relation(fields: [departmentId], references: [id])
  kpssScores     UserScore[]
  savedPostings  SavedPosting[]

  @@map("users")
}

model UserScore {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  scoreType ScoreType
  score     Decimal   @db.Decimal(5, 2)
  examYear  Int?

  @@unique([userId, scoreType])
  @@map("user_scores")
}

model Department {
  id               String            @id @default(uuid())
  code             String?           @unique // ÖSYM veya YÖK Bölüm Kodu (Örn: 3245)
  name             String            // Örn: "Bilgisayar Mühendisliği"
  educationLevel   EducationLevel
  users            User[]
  qualifications   Qualification[]   // Bu bölümün sağladığı nitelik kodları
  historicalScores HistoricalScore[]

  @@index([name])
  @@map("departments")
}

model Qualification {
  id          String        @id @default(uuid())
  code        String        @unique // Örn: "4531" (Bilgisayar Müh.), "4001" (Herhangi Lisans)
  title       String        // Örn: "Bilgisayar Mühendisliği Lisans Programından Mezun Olmak"
  description String?
  departments Department[]
  postings    Posting[]

  @@map("qualifications")
}

model Posting {
  id                String            @id @default(uuid())
  sourceId          String?
  sourceUrl         String            // Orijinal kaynak linki (kamuilan.sbb veya kariyerkapisi)
  sourcePlatform    String            // "SBB_KAMU_ILAN", "KARIYER_KAPISI", "ISKUR", "RESMI_GAZETE"
  
  institutionName   String            // Örn: "T.C. Ulaştırma ve Altyapı Bakanlığı"
  institutionType   String?           // "Bakanlık", "Üniversite", "Belediye", "KİT"
  title             String            // Örn: "Mühendis (Yazılım) Alımı"
  positionType      PositionType      @default(SOZLESMELI)
  
  city              String?
  totalQuota        Int               @default(1)
  
  // KPSS Şartları
  requiredScoreType ScoreType?        @default(KPSS_P3)
  minScore          Decimal?          @db.Decimal(5, 2)
  educationLevel    EducationLevel
  
  // Başvuru Takvimi
  publishDate       DateTime
  deadlineDate      DateTime
  isActive          Boolean           @default(true)
  
  summary           String?           @db.Text
  requirementsText  String?           @db.Text
  applicationMethod String?
  rawMetadata       Json?
  
  qualifications    Qualification[]
  savedByUsers      SavedPosting[]
  historicalScores  HistoricalScore[]

  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  @@index([institutionName])
  @@index([deadlineDate])
  @@index([educationLevel, minScore])
  @@map("postings")
}

model HistoricalScore {
  id                String       @id @default(uuid())
  year              Int          // Örn: 2024
  term              String       // Örn: "2024/1 KPSS Merkezi Atama"
  institutionName   String
  positionTitle     String
  city              String?
  quota             Int
  
  scoreType         ScoreType    @default(KPSS_P3)
  minScore          Decimal      @db.Decimal(5, 2) // Taban Puan
  maxScore          Decimal?     @db.Decimal(5, 2) // Tavan Puan
  
  departmentId      String?
  department        Department?  @relation(fields: [departmentId], references: [id])
  qualificationCode String?      // Örn: "4531"
  
  postingId         String?
  posting           Posting?     @relation(fields: [postingId], references: [id])

  createdAt         DateTime     @default(now())

  @@index([positionTitle, institutionName])
  @@index([qualificationCode])
  @@map("historical_scores")
}

model SavedPosting {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  postingId String
  posting   Posting  @relation(fields: [postingId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, postingId])
  @@map("saved_postings")
}`;

  const pythonPipelineExplanation = `# Python Tabanlı Bağımsız Kazıma & ETL Servisi

## 1. Playwright Tabanlı ÖSYM Sayısal Bilgiler Kazıyıcı & SQL Generator (Yeni)
Dosya: \`scraper-service/scripts/osym_playwright_sql_generator.py\`
Ana Kaynak: https://www.osym.gov.tr/SinavGrubu/Menu/341
Hedef Bültenler: "kadro-ve-pozisyonlarina-yerlestirme-sonuclarina-iliskin-sayisal-bilgiler" içeren tüm alt sayfalar.

İşleyiş Mantığı:
1. Headless Chromium tarayıcı ile ÖSYM Menü/341 sayfasını açar.
2. 'kadro-ve-pozisyonlarina-yerlestirme-sonuclarina-iliskin-sayisal-bilgiler' anahtar kelimesini içeren bülten linklerini filtreler.
3. Her sayfadaki HTML tablolarını gezerek Kadro Kodu, Kurum Adı, Kadro Unvanı, Kontenjan, Taban ve Tavan puanları parse eder.
4. Çıktı olarak PostgreSQL 'historical_scores' tablosu için doğrudan çalıştırılabilir 'osym_historical_scores.sql' dosyasını üretir:
   \`INSERT INTO historical_scores (id, year, term, institution_name, position_title, quota, min_score, max_score, qualification_code, osym_url) VALUES (...);\`

Çalıştırma Komutu:
\`\`\`bash
# Bağımlılıkları kur:
pip install playwright beautifulsoup4
playwright install chromium

# Scripti çalıştır:
python scraper-service/scripts/osym_playwright_sql_generator.py --limit 15 --output osym_historical_scores.sql

# Üretilen SQL dosyasını PostgreSQL veritabanına aktar:
psql -d kamuilan_db -f osym_historical_scores.sql
\`\`\`

---

## 2. ÖSYM Tercih Kılavuzu & Bölüm Kataloğu Crawler
Dosya: \`scraper-service/scripts/osym_departments_crawler.py\`
Kaynak: https://www.osym.gov.tr/kpss20261-bazi-kamu-kurum-ve-kuruluslarinin-kadro-ve-pozisyonlarina-yerlestirme-yapmak-icin-tercih-kilavuzu-ve-tablolar

İşlev:
- Tablo-3 (Lisans Mezuniyet Alanları ve 4 Haneli Kodları - Örn: 4531 Bilgisayar Müh., 4127 Hukuk, 4421 İktisat)
- Tablo-2 (Ön Lisans Mezuniyet Alanları - Örn: 3249 Bilgisayar Prog., 3005 Adalet)
- Tablo-1 (Ortaöğretim Alanları - Örn: 2001 Genel Lise, 2063 Bilişim Alanı)
verilerini çekip yapılandırılmış JSON ve TypeScript enum/data nesnelerine dönüştürür.

Çalıştırma Komutu:
\`\`\`bash
python scraper-service/scripts/osym_departments_crawler.py --output src/data/osymDepartments.json
\`\`\`

---

## 3. Diğer Kamu Portalları Kazıma Yöntemleri
1. kamuilan.sbb.gov.tr: Requests + BeautifulSoup (lxml) ile hızlı SSR HTML ayrıştırma.
2. kariyerkapisi.gov.tr/isealim: Headless Playwright (Chromium) ile dinamik JS ve asenkron liste rendering'i.
3. iskur.gov.tr: İŞKUR Kamu Memur Alım İlanları tablo parser'ı.
4. Resmi Gazete (resmigazete.gov.tr): Günlük Çeşitli İlanlar metin analizi.

## 4. Veri Tekilleştirme (Deduplication) & Hash Algoritması
Aynı ilan birden fazla kaynakta yayımlandığında şu imza üretilir:
   hash_key = SHA256(kurum_slug + unvan_slug + deadline_date)
PostgreSQL'de ON CONFLICT ("sourceUrl") DO UPDATE (UPSERT) uygulanır.

## 5. ÖSYM 4 Haneli Nitelik Kodu Eşleme (Matcher)
İlan şartları ve tabloları taranarak 4531 (Bilgisayar Müh.), 3001 (Önlisans), 4001 (Lisans) otomatik eşlenir.`;

  const nextjsSetupExplanation = `# Next.js (App Router) + Prisma Adım Adım Kurulum

## Adım 1: Proje Oluşturma
npx create-next-app@latest kamu-ilan-platform --typescript --tailwind --eslint --app
cd kamu-ilan-platform

## Adım 2: Bağımlılıkları Kurma
npm install @prisma/client lucide-react clsx tailwind-merge
npm install -D prisma

## Adım 3: Prisma Kurulumu & Migration
npx prisma init
# .env dosyasına veritabanı adresinizi yazın:
# DATABASE_URL="postgresql://user:password@localhost:5432/kamuilan_db?schema=public"

# Şemayı uygulayın:
npx prisma migrate dev --name init_kamu_ilan
npx prisma generate

## Adım 4: Klasör Yapısı
app/
├── feed/page.tsx         # Kişiselleştirilmiş İlan Akışı
├── postings/[id]/page.tsx# İlan Detayı & Taban Puan Analitiği
├── analytics/page.tsx    # KPSS Taban Puan Arama & Trendleri
├── profile/page.tsx      # Bölüm ve Puan Tanımlama
└── api/postings/route.ts # Filtrelenebilir REST API`;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold mb-1">
          <Layers className="w-4 h-4" />
          <span>Üretim Mimarisi & Şema Dökümantasyonu</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Veritabanı Şeması, Python Kazıma Motoru ve Next.js Yapısı
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Platformun arka planında çalışan ilişkisel PostgreSQL veri modeli, harici Python Playwright/BeautifulSoup kazıma hattı ve Next.js App Router üretim kodları.
        </p>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 mt-5 border-b border-slate-100 pb-3">
          <button
            onClick={() => setActiveTab('prisma')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'prisma'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>1. PostgreSQL / Prisma Şeması</span>
          </button>

          <button
            onClick={() => setActiveTab('scraper')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'scraper'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>2. Python Web Kazıma Mimarisi</span>
          </button>

          <button
            onClick={() => setActiveTab('nextjs')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'nextjs'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>3. Next.js App Router Kurulumu</span>
          </button>
        </div>
      </div>

      {/* Code / Docs Container */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 text-slate-200 overflow-hidden shadow-lg">
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono text-slate-400">
            <FileCode2 className="w-4 h-4 text-blue-400" />
            <span>
              {activeTab === 'prisma'
                ? 'prisma/schema.prisma'
                : activeTab === 'scraper'
                ? 'scraper-service/ARCHITECTURE.py'
                : 'docs/NEXTJS_SETUP.md'}
            </span>
          </div>

          <button
            onClick={() => {
              const text =
                activeTab === 'prisma'
                  ? prismaSchemaCode
                  : activeTab === 'scraper'
                  ? pythonPipelineExplanation
                  : nextjsSetupExplanation;
              handleCopy(text, activeTab);
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors cursor-pointer text-xs"
          >
            {copied === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Kopyalandı</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Kodu Kopyala</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-x-auto max-h-[600px] text-xs font-mono leading-relaxed">
          <pre>
            {activeTab === 'prisma' && prismaSchemaCode}
            {activeTab === 'scraper' && pythonPipelineExplanation}
            {activeTab === 'nextjs' && nextjsSetupExplanation}
          </pre>
        </div>
      </div>
    </div>
  );
};

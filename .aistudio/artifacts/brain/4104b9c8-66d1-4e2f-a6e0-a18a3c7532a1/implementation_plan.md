# Kamu İlan & KPSS Taban Puan Takip Platformu

Kamu kurumlarının işe alım ilanlarını (memur, sözleşmeli personel, akademisyen, işçi) ve geçmiş ÖSYM/merkezi atama taban puanlarını takip eden, kullanıcıların öğrenim seviyesi, mezun olduğu bölüm ve KPSS puan türüne (P3, P93, P94 vb.) göre kişiselleştirilmiş ilan akışı ve geçmiş puan analitiği sunan modern web platformu.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Faz 1 sorularında netleştirilen kullanıcı tercihleri ve mimari kararlar doğrultusunda bu plan oluşturulmuştur:
> - **Çalışma Ortamı:** AI Studio ortamında tam işlevsel, canlı çalışan interaktif bir arayüz (React + Tailwind CSS + Lucide Icons + zengin filtreler ve veri havuzu) geliştirilirken, eş zamanlı olarak üretime yönelik eksiksiz Next.js (App Router) + Prisma + PostgreSQL mimari kodları ve dosyaları sağlanacaktır.
> - **Veri Kazıma & ETL:** Harici bağımsız Python (Playwright + BeautifulSoup + APScheduler) mikroservis mimarisi tasarlanmış, veri normalizasyonu kuralları belirlenmiştir.
> - **Arayüz Tasarımı:** Sade ilan listesi, hızlı filtreleme panelleri ve net geçmiş taban puan karşılaştırma kartları ön planda tutulmuştur.

- **Onaylanan Tercih 1 (Prototip & Mimari):** Canlı interaktif platform ve Next.js/Prisma üretim mimarisi birlikte sunulacaktır.
- **Onaylanan Tercih 2 (Veri Hattı):** Harici bağımsız Python tabanlı mikroservis tasarımı (kamuilan.sbb.gov.tr, kariyerkapisi, iskur, Resmi Gazete, Memurlar.net).
- **Onaylanan Tercih 3 (Arayüz & Analitik):** Sade ilan listesi, güçlü filtreleme kartları ve kurum/kadro bazlı geçmiş taban puan dökümü.

---

## 1. Overview & Core Concept

- **Ne Yapar:** Kamu kurumlarının (Bakanlıklar, Üniversiteler, Belediyeler, KİT'ler vb.) yayımladığı tüm personel alım ilanlarını tek merkezde toplar. Kullanıcının bölümünü (Örn: Bilgisayar Mühendisliği, Adalet, Hemşirelik, Kamu Yönetimi) ve KPSS puanını alarak filtreler, başvurabileceği güncel ilanları ve o kadronun geçmiş yıllardaki taban puan aralıklarını gösterir.
- **Hedef Kitle:** KPSS Lisans, Önlisans ve Ortaöğretim mezunları, kamuya atanmak isteyen adaylar, sözleşmeli personel ve akademisyen adayları.
- **Sağlanan Temel Değer:** Dağınık ve takibi zor olan 5 farklı kamu ilan kaynağını tekilleştirilmiş, filtrelenebilir ve taban puan şeffaflığı olan bir deneyime dönüştürmek; adayın "bu kadroya atanmak için kaç puan gerekmişti?" sorusunu ilan sayfasından ayrılmadan yanıtlamak.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Onboarding & Profil Belirleme:**
   - Öğrenim düzeyi seçimi (Lisans / Önlisans / Ortaöğretim).
   - Bölüm / Alan seçimi (Örn: Bilgisayar Mühendisliği, İktisat, İlahiyat, Anestezi vb.).
   - KPSS Puan Türü ve Puanı (Örn: P3 - 82.45, P93 - 78.10).
2. **Kişiselleştirilmiş İlan Akışı (Feed):**
   - Kullanıcı profiline uyan "Tam Eşleşen İlanlar" ve genel "Tüm Aktif İlanlar" sekmesi.
   - Hızlı filtre çubuğu: Kurum türü (Bakanlık, Üniversite, Belediye), Şehir (Tüm Türkiye veya il seçimi), Kadro unvanı, Puan barajı, Son başvuru tarihi.
3. **İlan Kartı & Detay Görünümü:**
   - İlan başlığı, kurum adı, kadro sayısı, başvuru başlangıç/bitiş tarihi, kalan gün sayacı (`tabular-nums`).
   - Detay modalı/sayfası: Genel ve özel şartlar, istenen belgeler, başvuru şekli (Kariyer Kapısı / Şahsen / Posta) ve doğrudan orijinal başvuru bağlantısı.
4. **Geçmiş Taban Puan Analitiği (Kart İçi & Detay):**
   - İlgili kadro için son 3-5 yıldaki ÖSYM merkezi atama ve kurum içi alım taban/tavan puanları, kontenjan adetleri ve atanan bölüm kodları.
   - Adayın puanı ile geçmiş taban puanın doğrudan karşılaştırılması (Örn: "2024/1 Ataması Taban Puanı: 81.20 · Sizin Puanınız: 82.45 · Baraj Üstü: +1.25").

### Visual Identity & Theme
- **Tasarım Dili:** SaaS & Kamu Bilişim standardı; sade, güven veren, net tipografik hiyerarşi (Anti-slop kurallarına tam uyumlu; anlamsız hap rozetler veya yapay kart yığınları yerine temiz tipografik ayraçlar `·`).
- **Renk Paleti (60-30-10 Kuralı):**
  - %60 Zemin: Temiz beyaz (`#ffffff`) ve açık gri zemin (`#f8fafc` / `#f1f5f9`).
  - %30 Yapısal Yüzeyler: İnce kenarlıklar (`border-slate-200`), kurumsal koyu lacivert/arduvaz başlıklar (`#0f172a`, `#1e293b`).
  - %10 Vurgu: Türk kamu kurumsal kimliğine uygun derin mavi/indigo (`#1d4ed8` / `#2563eb`) ve son başvuru uyarılarında amber/kızıl tonlar (`#d97706` / `#dc2626`).
- **Tipografi:** Başlıklar ve gezinmede modern sans-serif (`Plus Jakarta Sans` veya `DM Sans`), sayısal veriler ve puanlarda `font-mono tabular-nums`.

---

## 3. Key Product Decisions & Trade-Offs

| Karar | Seçilen Yaklaşım | Gerekçe / Avantaj | Alternatif & Terk Edilme Nedeni |
| :--- | :--- | :--- | :--- |
| **Veritabanı Katmanı** | PostgreSQL + Prisma ORM | Güçlü ilişkisel model (`postings` $\leftrightarrow$ `qualifications` $\leftrightarrow$ `departments`), JSONB desteği, tip güvenliği | MongoDB: İlişkisel nitelik kodları ve geçmiş puan filtrelerinde zayıf kalır. |
| **Kazıma Mimarisi** | Bağımsız Python Mikroservisi | Playwright ve BeautifulSoup'un dinamik kamu portallarındaki (SPA, iframe, e-devlet girişli Kariyer Kapısı) üstün kararlılığı | Node.js Cheerio: JS ile render edilen Kariyer Kapısı tablolarında yetersiz kalmaktadır. |
| **Puan Analitiği UI** | Sade Karşılaştırma Kartları | Kullanıcının hızlıca karar vermesini sağlayan, göz yormayan net atama tablosu ve fark göstergesi | Karmaşık 3D grafikler: Mobil ekranda okunması zor, karar vermeyi yavaşlatır. |
| **İnteraktif Prototip** | React 19 + Express API + Zengin Mock Veri | AI Studio içinde kullanıcı deneyiminin, filtreleme motorunun ve puan hesaplamasının anında test edilebilmesi | Yalnızca metin dokümantasyonu: Kullanıcının ürünü gerçek ortamda deneyimlemesini engeller. |

---

## 4. Technical Architecture & Data Strategy

### A. Sistem Mimarisi & Veri Akış Şeması

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KAMU VERİ KAYNAKLARI                           │
│  [kamuilan.sbb]  [kariyerkapisi]  [iskur.gov.tr]  [Resmi Gazete]      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│             HARİCİ PYTHON VERİ KAZIMA MİKROSERVİSİ                     │
│  - Playwright / BeautifulSoup Scrapers                                 │
│  - Data Cleaning, Deduplication & Nitelik Kodu Eşleştirme Motoru      │
│  - APScheduler / Celery Cron Jobs (Günlük / 6 saatte bir)             │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼ (SQL INSERT / UPSERT)
┌────────────────────────────────────────────────────────────────────────┐
│                   POSTGRESQL VERİTABANI (PRISMA)                       │
│  - users & user_preferences     - postings (ilanlar)                   │
│  - departments (bölümler)       - qualifications (nitelik kodları)     │
│  - historical_scores (ÖSYM geçmiş merkezi atama taban puanları)        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼ (Prisma Client / REST API)
┌────────────────────────────────────────────────────────────────────────┐
│               FRONTEND: NEXT.JS APP ROUTER / INTERACTIVE UI            │
│  - /feed (Kişiselleştirilmiş İlan Akışı & Hızlı Filtre Kartları)       │
│  - /postings/[id] (İlan Detayı & Başvuru Bağlantısı)                  │
│  - /analytics/kpss (Kadro & Bölüm Taban Puan Geçmiş Analitiği)         │
│  - /profile (Bölüm, Öğrenim Düzeyi, KPSS Puan Tanımları)              │
└────────────────────────────────────────────────────────────────────────┘
```

---

### B. PostgreSQL & Prisma Veritabanı Şeması (`schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum EducationLevel {
  LİSE          // Ortaöğretim
  ÖNLİSANS      // 2 Yıllık
  LİSANS        // 4 Yıllık
  YÜKSEK_LİSANS // Tezli/Tezsiz
  DOKTORA
}

enum PostType {
  MEMUR             // 657 4/A Kadrolu
  SÖZLEŞMELİ        // 657 4/B Sözleşmeli
  İŞÇİ              // Sürekli İşçi
  AKADEMİK          // Araştırma Gör., Öğretim Gör., Doçent vb.
  ASKERİ_EMNİYET    // Subay, Astsubay, Polis vb.
}

enum ScoreType {
  KPSS_P3   // Lisans Genel
  KPSS_P93  // Önlisans Genel
  KPSS_P94  // Ortaöğretim Genel
  KPSS_P1   // A Grubu / Mühendislik vb.
  KPSS_P2
  KPSS_P10  // Öğretmenlik
  KPSS_P121 // ÖABT
  ALES
  YDS
  DİĞER
}

model User {
  id             String          @id @default(uuid())
  email          String          @unique
  name           String?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  
  // Profil & Tercihler
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
  score     Decimal   @db.Decimal(5, 2) // Örn: 84.75
  examYear  Int?

  @@unique([userId, scoreType])
  @@map("user_scores")
}

model Department {
  id             String          @id @default(uuid())
  code           String?         @unique // YÖK veya ÖSYM Bölüm Kodu
  name           String          // Örn: Bilgisayar Mühendisliği
  educationLevel EducationLevel
  users          User[]
  qualifications Qualification[]
  historicalScores HistoricalScore[]

  @@index([name])
  @@map("departments")
}

model Qualification {
  id          String       @id @default(uuid())
  code        String       @unique // Örn: "4531" (Bilgisayar Mühendisliği Lisans) veya "7113"
  title       String       // Örn: "Bilgisayar Mühendisliği Lisans Programından Mezun Olmak"
  description String?
  departments Department[] // Çoktan çoğa ilişki
  postings    Posting[]    // Bu nitelik kodunu isteyen ilanlar

  @@map("qualifications")
}

model Posting {
  id                String         @id @default(uuid())
  sourceId          String?        // Kaynak sistemdeki benzersiz ilan ID'si
  sourceUrl         String         // kamuilan.sbb, kariyerkapisi vb. orijinal link
  sourcePlatform    String         // "SBB_KAMU_ILAN", "KARIYER_KAPISI", "ISKUR", "RESMI_GAZETE"
  
  institutionName   String         // Örn: "T.C. Ulaştırma ve Altyapı Bakanlığı"
  institutionType   String?        // "Bakanlık", "Üniversite", "Belediye", "KİT"
  title             String         // Örn: "Mühendis (Yazılım) Alımı"
  positionType      PostType       @default(SÖZLEŞMELİ)
  
  city              String?        // "Ankara", "İstanbul" veya "Merkez / Taşra"
  totalQuota        Int            @default(1)
  
  // KPSS Şartları
  requiredScoreType ScoreType?
  minScore          Decimal?       @db.Decimal(5, 2) // Örn: 70.00
  educationLevel    EducationLevel
  
  // Başvuru Tarihleri
  publishDate       DateTime
  deadlineDate      DateTime
  isActive          Boolean        @default(true)
  
  // İçerik ve Detaylar
  summary           String?        @db.Text
  requirementsText  String?        @db.Text
  rawMetadata       Json?          // Orijinal ilanın ham JSON/tablo özellikleri
  
  // İlişkiler
  qualifications    Qualification[]
  savedByUsers      SavedPosting[]
  historicalScores  HistoricalScore[]

  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  @@index([institutionName])
  @@index([deadlineDate])
  @@index([educationLevel, minScore])
  @@index([isActive])
  @@map("postings")
}

model HistoricalScore {
  id              String         @id @default(uuid())
  year            Int            // Örn: 2024
  term            String         // Örn: "2024/1 KPSS Merkezi Atama" veya "2023 Kurumsal Alım"
  institutionName String         // Örn: "Devlet Demiryolları İşletmesi Genel Müdürlüğü"
  positionTitle   String         // Örn: "Mühendis"
  city            String?        // Örn: "Ankara"
  quota           Int            // Kontenjan adedi
  
  scoreType       ScoreType      @default(KPSS_P3)
  minScore        Decimal        @db.Decimal(5, 2) // Taban Puan (Örn: 83.45)
  maxScore        Decimal?       @db.Decimal(5, 2) // Tavan Puan (Örn: 91.20)
  
  departmentId    String?
  department      Department?    @relation(fields: [departmentId], references: [id])
  qualificationCode String?      // Örn: "4531"
  
  postingId       String?
  posting         Posting?       @relation(fields: [postingId], references: [id])

  createdAt       DateTime       @default(now())

  @@index([positionTitle, institutionName])
  @@index([qualificationCode])
  @@index([year, term])
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
}
```

---

### C. Web Scraping & Veri Hattı Mimarisi (Python Mikroservisi)

```
scraper-service/
├── config.py              # Kaynak URL'leri, DB Connection URI, Cron frekansları
├── main.py                # Servis başlatıcı & APScheduler yöneticisi
├── parsers/
│   ├── base_parser.py     # Standartlaştırılmış İlan Veri Modeli (Pydantic)
│   ├── sbb_kamuilan.py    # kamuilan.sbb.gov.tr API / HTML scraper
│   ├── kariyer_kapisi.py  # Playwright tabanlı headless tarayıcı (Kariyer Kapısı)
│   ├── iskur_parser.py    # İŞKUR kamu ilanları scraper
│   ├── resmi_gazete.py    # Resmi Gazete Çeşitli İlanlar PDF / HTML parser
│   └── osym_taban_puan.py # ÖSYM geçmiş atama PDF / Excel veritabanı ayrıştırıcı
├── pipeline/
│   ├── normalizer.py      # Tarih, puan ve kurum isimlerini kanonik formata çevirme
│   ├── matcher.py         # Nitelik kodları (4531, 3001 vb.) ve bölüm eşleştirme
│   └── db_writer.py       # PostgreSQL upsert (idempotent işlem)
└── requirements.txt       # playwright, beautifulsoup4, pydantic, sqlalchemy, apscheduler
```

#### Veri Normalizasyonu ve Tutarlılık Stratejisi:
1. **İlan Tekilleştirme (Deduplication):** Aynı ilan hem SBB'de hem Resmi Gazete'de yayımlanabildiği için; `institution_name_slug` + `deadline_date` + `title_slug` kombinasyonundan bir `hash_signature` üretilir. Mevcut kayıt varsa güncellenir (`UPSERT`).
2. **Kanonik Bölüm & Nitelik Kodu Haritalama:**
   - İlan metnindeki şartlar NLP / regex ile taranır (Örn: `"Bilgisayar Mühendisliği"`, `"4531"`).
   - ÖSYM'nin 4 haneli lisans ve önlisans nitelik kodları sözlüğü ile eşleştirilerek `qualifications` tablosuna bağlanır.
3. **Puan & Tarih Standartlaştırması:**
   - Farklı kaynaklardaki `31.12.2026`, `31/12/2026`, `31 Aralık 2026 17:00` tarihleri ISO 8601 UTC'ye çevrilir.
   - KPSS puanları `Decimal(5, 2)` formatında temizlenir (Örn: `"70 ve üzeri"` $\rightarrow$ `70.00`).

---

### D. Next.js Proje Dosya Yapısı & Adım Adım Kurulum Planı

```
kamu-ilan-platform/
├── app/
│   ├── layout.tsx                # Root layout, fontlar, Header ve Footer
│   ├── page.tsx                  # Landing / Giriş ekranı
│   ├── feed/
│   │   └── page.tsx              # Kişiselleştirilmiş İlan Akışı & Filtre Kartları
│   ├── postings/
│   │   └── [id]/
│   │       └── page.tsx          # İlan Detayı & Orijinal Başvuru Butonu
│   ├── analytics/
│   │   └── page.tsx              # KPSS Geçmiş Taban Puan Arama & Trendleri
│   ├── profile/
│   │   └── page.tsx              # Bölüm ve KPSS Puan Tanımlama / Onboarding
│   └── api/
│       ├── postings/route.ts     # Filtrelenebilir ilan listeleme API'si
│       ├── departments/route.ts  # Bölüm ve nitelik kodu arama
│       └── analytics/route.ts    # Kadro bazlı geçmiş puan getirme
├── components/
│   ├── layout/
│   │   ├── TopNav.tsx            # Top Bar Contract (1-line wordmark, linkler, CTA)
│   │   └── Footer.tsx
│   ├── feed/
│   │   ├── FilterBar.tsx         # Kurum, Şehir, Puan, Tarih filtre kartları
│   │   ├── PostingCard.tsx       # Sade ilan kartı (puan farkı, kurum, son gün)
│   │   └── ProfileQuickMatch.tsx # Aktif kullanıcının puan/bölüm eşleşme göstergesi
│   ├── detail/
│   │   ├── RequirementsList.tsx  # Nitelik şartları & belgeler
│   │   └── HistoricalScores.tsx  # Geçmiş yıl taban puan tablosu & kıyaslama
│   └── ui/                       # Düğmeler, diyaloglar, form girdileri
├── lib/
│   ├── prisma.ts                 # Prisma singleton client
│   └── utils.ts                  # Tarih ve puan hesaplama yardımcıları
├── prisma/
│   ├── schema.prisma             # Yukarıda tanımlanan eksiksiz şema
│   └── seed.ts                   # Bölümler, nitelik kodları ve 2022-2026 örnek verileri
├── package.json
└── tsconfig.json
```

#### Adım Adım Kurulum ve Geliştirme Süreci:
1. **Adım 1:** Next.js + Tailwind CSS projesi ve Prisma ORM kurulumu (`npx prisma init`, PostgreSQL bağlantısı).
2. **Adım 2:** Veritabanı şemasının `schema.prisma` içine yazılması, `npx prisma migrate dev` ile tabloların oluşturulması.
3. **Adım 3:** ÖSYM nitelik kodları ve geçmiş merkezi atama taban puanlarının `seed.ts` ile veritabanına yüklenmesi.
4. **Adım 4:** Python tabanlı kazıyıcı modüllerinin yapılandırılması ve test edilmesi.
5. **Adım 5:** Next.js üzerinde Onboarding, Filtrelenebilir İlan Feed'i, İlan Detay Modalı ve Geçmiş Taban Puan Analitiği arayüzlerinin inşası.
6. **Adım 6:** AI Studio prototipinde tüm filtreler, puan hesaplama ve ilan kartlarının canlı olarak test edilmesi.

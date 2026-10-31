# Next.js (App Router) + Prisma + PostgreSQL Kurulum & Mimari Rehberi

Bu doküman, kamu ilanları ve geçmiş KPSS taban puan takip platformunun Next.js App Router tabanlı üretim projesine dönüştürülmesi adımlarını içerir.

---

## 1. Proje Başlatma & Bağımlılıklar

```bash
# 1. Next.js App Router projesi oluşturma
npx create-next-app@latest kamu-ilan-platform --typescript --tailwind --eslint --app --src-dir

cd kamu-ilan-platform

# 2. Prisma ve UI kütüphaneleri
npm install @prisma/client lucide-react clsx tailwind-merge
npm install -D prisma

# 3. Prisma Başlatma
npx prisma init
```

`.env` dosyanıza PostgreSQL bağlantısını ekleyin:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/kamuilan_db?schema=public"
```

---

## 2. Şema ve Migration

Projenin kök dizinindeki `prisma/schema.prisma` dosyasını `prisma/schema.prisma` içeriğimizle doldurun ve migrasyonu çalıştırın:

```bash
npx prisma migrate dev --name init_kamu_ilan_tables
npx prisma generate
```

---

## 3. Next.js Klasör Mimarisi

```
src/
├── app/
│   ├── layout.tsx                # Kök layout, Header (Top Bar Contract), Footer
│   ├── page.tsx                  # Ana Sayfa / Landing & Popüler İlanlar
│   ├── feed/
│   │   └── page.tsx              # Kişiselleştirilmiş İlan Akışı & Hızlı Filtre Kartları
│   ├── postings/
│   │   └── [id]/
│   │       └── page.tsx          # İlan Detayı, Şartlar, Geçmiş Puan Kıyaslama
│   ├── analytics/
│   │   └── page.tsx              # KPSS Kadro & Taban Puan Trend Analiz Sayfası
│   ├── profile/
│   │   └── page.tsx              # Kullanıcı Bölüm & KPSS Puan Tanımlama
│   └── api/
│       ├── postings/
│       │   └── route.ts          # GET: Filtrelenebilir ilan listesi (bölüm, puan, şehir)
│       ├── departments/
│       │   └── route.ts          # GET: Bölümler ve ÖSYM nitelik kodları
│       └── analytics/
│           └── route.ts          # GET: Kadro ve kuruma göre geçmiş yıl taban puanları
├── components/
│   ├── layout/
│   │   ├── TopNav.tsx            # Tek satır wordmark, nav linkleri, CTA
│   │   └── Footer.tsx
│   ├── feed/
│   │   ├── FilterBar.tsx         # Kurum türü, şehir, puan barajı, mezuniyet
│   │   ├── PostingCard.tsx       # Unboxed metadata (·), puan farkı, kalan gün
│   │   └── MatchBadge.tsx        # Uygun / Puan Yetersiz / Fark göstergesi
│   └── analytics/
│       └── HistoricalTable.tsx   # Geçmiş atama taban-tavan puanları ve kontenjanlar
├── lib/
│   ├── prisma.ts                 # Prisma singleton instance
│   └── utils.ts
└── types/
    └── index.ts
```

---

## 4. Örnek API Route (`src/app/api/postings/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const educationLevel = searchParams.get("educationLevel");
  const maxScore = searchParams.get("userScore");
  const city = searchParams.get("city");
  const institutionType = searchParams.get("institutionType");
  const query = searchParams.get("q");

  const where: any = { isActive: true };

  if (educationLevel) {
    where.educationLevel = educationLevel;
  }
  if (city && city !== "Tümü") {
    where.city = { contains: city, mode: "insensitive" };
  }
  if (institutionType && institutionType !== "Tümü") {
    where.institutionType = institutionType;
  }
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { institutionName: { contains: query, mode: "insensitive" } },
    ];
  }

  const postings = await prisma.posting.findMany({
    where,
    include: {
      qualifications: true,
      historicalScores: {
        orderBy: { year: "desc" },
        take: 3,
      },
    },
    orderBy: { deadlineDate: "asc" },
  });

  return NextResponse.json(postings);
}
```

---

## 5. Cron Kazıyıcı ile Entegrasyon

Python mikroservisi (`scraper-service`) aynı PostgreSQL veritabanına bağlanır (`DATABASE_URL`). Her 6 saatte bir kamu portallarını kazıyıp `postings` tablosuna `UPSERT` yapar. Böylece Next.js uygulamanız her zaman en güncel kamu ilanlarını ve geçmiş taban puan eşleşmelerini servis eder.

#!/usr/bin/env python3
"""
ÖSYM KPSS Yerleştirme Sayısal Bilgileri ve Taban Puanları Otomatik Kazıma Scripti
Kaynak: https://www.osym.gov.tr/SinavGrubu/Menu/341
Hedef: 'kadro-ve-pozisyonlarina-yerlestirme-sonuclarina-iliskin-sayisal-bilgiler' anahtar kelimesini içeren tüm sonuç bültenleri.

Kullanım:
    python osym_crawler.py [--output osym_taban_puanlar.json] [--db-url postgresql://...]
"""

import sys
import os
import re
import json
import logging
import argparse
from typing import List, Dict, Any, Optional
from datetime import datetime
from decimal import Decimal
import requests
from bs4 import BeautifulSoup

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("OSYM_Crawler")

TARGET_KEYWORD = "kadro-ve-pozisyonlarina-yerlestirme-sonuclarina-iliskin-sayisal-bilgiler"
BASE_URL = "https://www.osym.gov.tr"
MENU_URL = "https://www.osym.gov.tr/SinavGrubu/Menu/341"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
}

def clean_text(text: Optional[str]) -> str:
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()

def parse_decimal(val_str: str) -> Optional[float]:
    """Türkçe virgüllü sayı formatını (Örn: 82,45123) float sayıya dönüştürür"""
    try:
        clean = re.sub(r"[^\d,\.]", "", val_str).replace(",", ".")
        return round(float(clean), 4) if clean else None
    except Exception:
        return None

def fetch_menu_bulletin_links() -> List[Dict[str, str]]:
    """
    1. Aşama: https://www.osym.gov.tr/SinavGrubu/Menu/341 menüsünü tarar.
    2. 'kadro-ve-pozisyonlarina-yerlestirme-sonuclarina-iliskin-sayisal-bilgiler' içeren linkleri filtreler.
    """
    logger.info(f"ÖSYM Ana Menüsü taranıyor: {MENU_URL}")
    session = requests.Session()
    session.headers.update(HEADERS)
    
    try:
        resp = session.get(MENU_URL, timeout=20)
        resp.raise_for_status()
    except Exception as e:
        logger.error(f"ÖSYM menü sayfasına erişim hatası: {e}")
        return []

    soup = BeautifulSoup(resp.content, "lxml")
    bulletin_links = []
    
    # Tüm bağlantıları tara
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        link_text = clean_text(a.get_text())
        
        # Hedef anahtar kelime eşleşmesi
        full_match_text = f"{href} {link_text}".lower()
        if TARGET_KEYWORD in full_match_text or "yerlestirme-sonuclarina-iliskin-sayisal-bilgiler" in href.lower():
            absolute_url = href if href.startswith("http") else f"{BASE_URL}{href}"
            
            # Dönem tespiti (Örn: 2026/1, 2025/2, 2024/1 vb.)
            term_match = re.search(r"202\d[/-]?\d?", absolute_url + " " + link_text)
            term_str = term_match.group(0) if term_match else "Merkezi Atama"
            
            bulletin_links.append({
                "title": link_text or f"KPSS {term_str} Yerleştirme Sayısal Bilgileri",
                "url": absolute_url,
                "term": term_str,
                "detected_at": datetime.now().isoformat()
            })

    logger.info(f"Toplam {len(bulletin_links)} adet geçerli ÖSYM sayısal bilgiler bülteni bulundu.")
    return bulletin_links

def parse_bulletin_page(bulletin_url: str, term: str) -> List[Dict[str, Any]]:
    """
    2. Aşama: İlgili ÖSYM bülten sayfasını (Örn: kpss-20261-... / kpss20252-...) açar.
    Lisans, Ön Lisans ve Ortaöğretim için yayımlanan tablo veya Excel bağlantılarını tespit edip verileri çeker.
    """
    logger.info(f"Bülten içeriği taranıyor: {bulletin_url}")
    session = requests.Session()
    session.headers.update(HEADERS)
    
    results = []
    try:
        resp = session.get(bulletin_url, timeout=20)
        resp.raise_for_status()
    except Exception as e:
        logger.error(f"Bülten sayfasına erişilemedi ({bulletin_url}): {e}")
        return results

    soup = BeautifulSoup(resp.content, "lxml")
    
    # Sayfa içindeki HTML veri tablolarını ayrıştır
    tables = soup.find_all("table")
    for t_idx, table in enumerate(tables):
        rows = table.find_all("tr")
        if len(rows) < 2:
            continue
            
        # Başlık satırından sütun dizilimini anla
        headers = [clean_text(th.get_text()).lower() for th in rows[0].find_all(["th", "td"])]
        
        for row in rows[1:]:
            cols = [clean_text(td.get_text()) for td in row.find_all("td")]
            if len(cols) < 5:
                continue
                
            # Standart ÖSYM Sayısal Bilgiler sütunları:
            # [Kadro Kodu, Kurum Adı, Kadro Unvanı, İl/Bölge, Kontenjan, Yerleşen, En Küçük Puan, En Büyük Puan]
            kadro_kodu = cols[0]
            kurum_adi = cols[1] if len(cols) > 1 else ""
            kadro_unvani = cols[2] if len(cols) > 2 else ""
            sehir = cols[3] if len(cols) > 3 else "Merkez"
            
            # Puan ve kontenjan sütunlarını güvenli tespit et
            try:
                kontenjan = int(re.sub(r"\D", "", cols[4]) or "1")
                yerlesen = int(re.sub(r"\D", "", cols[5]) or str(kontenjan)) if len(cols) > 5 else kontenjan
                min_puan = parse_decimal(cols[6]) if len(cols) > 6 else parse_decimal(cols[-2])
                max_puan = parse_decimal(cols[7]) if len(cols) > 7 else parse_decimal(cols[-1])
            except Exception:
                continue

            if not min_puan:
                continue

            # Kadro kodunun baş hanesine göre öğrenim seviyesi:
            # 1xxxx -> Ortaöğretim, 3xxxx -> Önlisans, 4xxxx -> Lisans
            level = "LISANS"
            if kadro_kodu.startswith("3"):
                level = "ONLISANS"
            elif kadro_kodu.startswith("1") or kadro_kodu.startswith("2"):
                level = "LISE"

            results.append({
                "source_url": bulletin_url,
                "term": f"KPSS-{term}",
                "level": level,
                "kadro_kodu": kadro_kodu,
                "kurum_adi": kurum_adi,
                "kadro_unvani": kadro_unvani,
                "sehir": sehir,
                "kontenjan": kontenjan,
                "yerlesen": yerlesen,
                "taban_puan": min_puan,
                "tavan_puan": max_puan or min_puan,
                "score_type": "KPSS_P3" if level == "LISANS" else "KPSS_P93" if level == "ONLISANS" else "KPSS_P94"
            })

    return results

def main():
    parser = argparse.ArgumentParser(description="ÖSYM KPSS Yerleştirme Sayısal Bilgileri Kazıyıcı")
    parser.add_argument("--output", default="osym_taban_puanlar.json", help="Çıktı JSON dosya yolu")
    parser.add_argument("--limit", type=int, default=10, help="Maksimum taranacak bülten sayısı")
    args = parser.parse_args()

    logger.info("=== ÖSYM KPSS Yerleştirme Taban Puanı Kazıma Başlatıldı ===")
    bulletins = fetch_menu_bulletin_links()
    
    if not bulletins:
        logger.warning("Hedef desene uyan bülten bulunamadı. Lütfen URL yapısını kontrol edin.")
        return

    all_placement_records = []
    for b in bulletins[:args.limit]:
        records = parse_bulletin_page(b["url"], b["term"])
        logger.info(f"{b['title']} -> {len(records)} kadro verisi çekildi.")
        all_placement_records.extend(records)

    # JSON Çıktısı Yaz
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "source_menu": MENU_URL,
            "target_keyword": TARGET_KEYWORD,
            "total_bulletins_found": len(bulletins),
            "total_records": len(all_placement_records),
            "data": all_placement_records
        }, f, ensure_ascii=False, indent=2)

    logger.info(f"İşlem tamamlandı. Toplam {len(all_placement_records)} adet taban puan kaydı '{args.output}' dosyasına yazıldı.")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
ÖSYM Sayısal Bilgiler ve Yerleştirme Taban Puanları Playwright Kazıyıcı & SQL Insert Üreticisi
Kaynak: https://www.osym.gov.tr/SinavGrubu/Menu/341
Hedef: 'kadro-ve-pozisyonlarina-yerlestirme-sonuclarina-iliskin-sayisal-bilgiler' anahtar kelimesini içeren bültenler

İşlev:
    Playwright ile sayfaları headless tarayıcıda render eder,
    HTML tablolarını parse eder ve PostgreSQL 'historical_scores' tablosu için
    doğrudan çalıştırılabilir SQL INSERT scripti (.sql) üretir.
"""

import asyncio
import re
import os
import logging
from datetime import datetime
from decimal import Decimal
from typing import List, Dict, Any, Optional
from playwright.async_api import async_playwright, Page, Browser

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("Playwright_SQL_Generator")

MENU_URL = "https://www.osym.gov.tr/SinavGrubu/Menu/341"
BASE_URL = "https://www.osym.gov.tr"
TARGET_KEYWORD = "kadro-ve-pozisyonlarina-yerlestirme-sonuclarina-iliskin-sayisal-bilgiler"
OUTPUT_SQL_FILE = "osym_historical_scores.sql"

def clean_sql_string(val: Optional[str]) -> str:
    """SQL Injection ve tek tırnak kırılmalarını önler"""
    if not val:
        return "NULL"
    escaped = val.replace("'", "''").strip()
    return f"'{escaped}'"

def parse_score(val: Optional[str]) -> Optional[float]:
    """Türkçe virgüllü puan formatını (84,6512) float sayıya dönüştürür"""
    if not val:
        return None
    try:
        clean = re.sub(r"[^\d,\.]", "", val).replace(",", ".")
        return float(clean) if clean else None
    except Exception:
        return None

async def find_placement_bulletin_urls(page: Page) -> List[Dict[str, str]]:
    """
    ÖSYM Menu/341 sayfasını açar ve 'kadro-ve-pozisyonlarina-yerlestirme-sonuclarina-iliskin-sayisal-bilgiler'
    anahtar kelimesini içeren tüm linkleri toplar.
    """
    logger.info(f"ÖSYM Menü sayfası taranıyor: {MENU_URL}")
    await page.goto(MENU_URL, timeout=45000, wait_until="domcontentloaded")
    
    links = await page.eval_on_selector_all("a[href]", """elements => {
        return elements.map(el => ({
            href: el.getAttribute('href'),
            text: el.innerText.trim()
        }));
    }""")
    
    matched = []
    for link in links:
        href = link.get("href", "")
        text = link.get("text", "")
        full = f"{href} {text}".lower()
        
        if TARGET_KEYWORD in full or "yerlestirme-sonuclarina-iliskin-sayisal-bilgiler" in href.lower():
            full_url = href if href.startswith("http") else f"{BASE_URL}{href}"
            
            # Dönem analizi (Örn: 2026/1, 2025/2, 2024/1)
            term_match = re.search(r"202\d[/-]?\d?", full_url + " " + text)
            term = term_match.group(0) if term_match else "Merkezi Atama"
            
            matched.append({
                "title": text or f"KPSS {term} Yerleştirme Sayısal Bilgileri",
                "url": full_url,
                "term": term
            })

    # Tekilleştirme
    unique_links = {m["url"]: m for m in matched}.values()
    logger.info(f"Bulunan hedef bülten sayısı: {len(unique_links)}")
    return list(unique_links)

async def parse_placement_table_from_page(page: Page, bulletin_url: str, term: str) -> List[Dict[str, Any]]:
    """
    Bülten sayfasını ziyaret eder, HTML tablolarındaki kadroları ve puanları ayıklar.
    """
    logger.info(f"Bülten taranıyor: {bulletin_url}")
    records = []
    
    try:
        await page.goto(bulletin_url, timeout=40000, wait_until="domcontentloaded")
        # Tabloların veya içerik kartlarının yüklenmesini bekle
        await page.wait_for_selector("table, .table-responsive, article", timeout=8000)
    except Exception as e:
        logger.warning(f"Sayfa yükleme uyarısı ({bulletin_url}): {e}")

    # Sayfadaki tüm tablo satırlarını topla
    rows_data = await page.evaluate("""() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr, table tr'));
        return rows.map(r => Array.from(r.querySelectorAll('th, td')).map(td => td.innerText.trim()));
    }""")

    for cols in rows_data:
        if len(cols) < 5:
            continue
            
        # Sütun yapısı: [Kadro Kodu, Kurum Adı, Kadro Unvanı, İl, Kontenjan, Yerleşen, En Küçük Puan, En Büyük Puan]
        kadro_kodu = cols[0]
        kurum_adi = cols[1] if len(cols) > 1 else "Kamu Kurumu"
        kadro_unvani = cols[2] if len(cols) > 2 else "Kadro"
        sehir = cols[3] if len(cols) > 3 else "Merkez"
        
        # Puan sütunları
        min_p = None
        max_p = None
        kontenjan = 1
        
        for c in reversed(cols):
            p = parse_score(c)
            if p and 50.0 <= p <= 100.0:
                if max_p is None:
                    max_p = p
                elif min_p is None:
                    min_p = p
                    break
                    
        if not min_p:
            min_p = max_p
            
        if not min_p:
            continue

        # Kontenjan tespiti
        for c in cols[3:6]:
            if c.isdigit():
                kontenjan = int(c)
                break

        # Öğrenim seviyesi ve puan türü tespiti
        level = "LISANS"
        score_type = "KPSS_P3"
        qual_code = "4001"
        
        if kadro_kodu.startswith("3"):
            level = "ONLISANS"
            score_type = "KPSS_P93"
            qual_code = "3001"
        elif kadro_kodu.startswith("1") or kadro_kodu.startswith("2"):
            level = "LISE"
            score_type = "KPSS_P94"
            qual_code = "2001"
        elif "Mühendis" in kadro_unvani:
            qual_code = "4531"

        records.append({
            "term": f"KPSS-{term} Sayısal Bilgiler",
            "year": int(term[:4]) if term[:4].isdigit() else 2026,
            "institution_name": kurum_adi,
            "position_title": kadro_unvani,
            "city": sehir,
            "quota": kontenjan,
            "score_type": score_type,
            "min_score": min_p,
            "max_score": max_p or min_p,
            "qualification_code": qual_code,
            "osym_url": bulletin_url
        })

    return records

def generate_sql_insert_statements(records: List[Dict[str, Any]], output_filepath: str) -> None:
    """
    Çekilen verileri PostgreSQL için INSERT INTO historical_scores (...) SQL ifadelerine dönüştürür.
    """
    logger.info(f"SQL Insert ifadeleri oluşturuluyor ({len(records)} kayıt)...")
    
    with open(output_filepath, "w", encoding="utf-8") as f:
        f.write("-- =========================================================================\n")
        f.write(f"-- ÖSYM KPSS Yerleştirme Taban Puanları Otomatik SQL Çıktısı\n")
        f.write(f"-- Üretim Zamanı: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"-- Kaynak: {MENU_URL}\n")
        f.write("-- =========================================================================\n\n")
        
        f.write("BEGIN;\n\n")
        
        for r in records:
            term_sql = clean_sql_string(r["term"])
            inst_sql = clean_sql_string(r["institution_name"])
            title_sql = clean_sql_string(r["position_title"])
            city_sql = clean_sql_string(r["city"])
            qual_sql = clean_sql_string(r["qualification_code"])
            url_sql = clean_sql_string(r["osym_url"])
            
            sql = f"""INSERT INTO historical_scores (
    id, year, term, "institutionName", "positionTitle", city, quota, 
    "scoreType", "minScore", "maxScore", "qualificationCode", "createdAt"
) VALUES (
    gen_random_uuid(), {r['year']}, {term_sql}, {inst_sql}, {title_sql}, {city_sql}, {r['quota']},
    '{r['score_type']}'::"ScoreType", {r['min_score']:.2f}, {r['max_score']:.2f}, {qual_sql}, NOW()
) ON CONFLICT DO NOTHING;\n"""
            f.write(sql)
            
        f.write("\nCOMMIT;\n")
        f.write(f"-- Toplam {len(records)} kayıt eklendi.\n")

    logger.info(f"SQL dosyası başarıyla kaydedildi: {output_filepath}")

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800}
        )
        page = await context.new_page()

        try:
            bulletins = await find_placement_bulletin_urls(page)
            all_records = []
            
            for b in bulletins[:10]: # İlk 10 bülten
                recs = await parse_placement_table_from_page(page, b["url"], b["term"])
                all_records.extend(recs)
                logger.info(f"Bülten: {b['term']} -> {len(recs)} kadro parse edildi.")

            if all_records:
                generate_sql_insert_statements(all_records, OUTPUT_SQL_FILE)
            else:
                logger.warning("Tablolardan kayıt okunamadı.")
                
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())

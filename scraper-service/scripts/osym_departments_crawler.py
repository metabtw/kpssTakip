#!/usr/bin/env python3
"""
ÖSYM KPSS Tercih Kılavuzu ve Bölüm Kodları Kazıyıcı (Playwright)
Kaynak: https://www.osym.gov.tr/kpss20261-bazi-kamu-kurum-ve-kuruluslarinin-kadro-ve-pozisyonlarina-yerlestirme-yapmak-icin-tercih-kilavuzu-ve-tablolar

İşlev:
    ÖSYM Tercih Kılavuzu Tablolarını (Lisans Tablo-3, Ön Lisans Tablo-2, Ortaöğretim Tablo-1)
    tarayarak tüm mezuniyet alanlarını, YÖK/ÖSYM program kodlarını ve 4 haneli nitelik kodlarını
    (Örn: 4531 Bilgisayar Müh., 4421 İktisat, 3005 Adalet vb.) JSON ve SQL formatında çıkarır.
"""

import asyncio
import re
import json
import logging
from datetime import datetime
from typing import List, Dict, Any
from playwright.async_api import async_playwright, Page

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("OSYM_Dept_Crawler")

GUIDE_URL = "https://www.osym.gov.tr/kpss20261-bazi-kamu-kurum-ve-kuruluslarinin-kadro-ve-pozisyonlarina-yerlestirme-yapmak-icin-tercih-kilavuzu-ve-tablolar"
OUTPUT_JSON = "osym_departments_catalogue.json"

async def crawl_osym_guide_departments():
    logger.info(f"ÖSYM Tercih Kılavuzu taranıyor: {GUIDE_URL}")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36"
        )
        
        try:
            await page.goto(GUIDE_URL, timeout=45000, wait_until="domcontentloaded")
            logger.info("Kılavuz sayfası başarıyla açıldı. Tablo bağlantıları tespit ediliyor...")
            
            # Sayfadaki kılavuz tablo linklerini topla
            guide_links = await page.eval_on_selector_all("a[href]", """elements => {
                return elements.map(e => ({
                    title: e.innerText.trim(),
                    href: e.getAttribute('href')
                })).filter(e => e.title.includes('Tablo') || e.title.includes('Nitelik') || e.title.includes('Kadro'));
            }""")
            
            logger.info(f"Tespit edilen kılavuz bölümleri: {len(guide_links)}")
            
        except Exception as e:
            logger.error(f"Kılavuz sayfasına erişim hatası: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(crawl_osym_guide_departments())

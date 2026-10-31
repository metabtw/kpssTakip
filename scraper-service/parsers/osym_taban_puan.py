"""
ÖSYM KPSS Yerleştirme Taban ve Tavan Puanları Kazıyıcı Servisi
Kaynak: https://www.osym.gov.tr/SinavGrubu/Menu/341
Hedef: "kadro-ve-pozisyonlarina-yerlestirme-sonuclarina-iliskin-sayisal-bilgiler" içeren tüm atama bültenleri
"""
import re
import logging
from decimal import Decimal
from typing import List, Dict, Any, Optional
import requests
from bs4 import BeautifulSoup
from pydantic import BaseModel

logger = logging.getLogger("OSYM_TabanPuan_Scraper")

class OSYMPlacementResult(BaseModel):
    year: int
    term: str # Örn: "KPSS-2026/1 Bazı Kamu Kurum ve Kuruluşlarının..."
    page_url: str
    level: str # LISANS, ONLISANS, LISE
    institution_name: str
    position_title: str
    city: str
    quota: int
    placed_count: int
    min_score: Decimal
    max_score: Decimal
    qualification_code: str
    score_type: str = "KPSS_P3"

class OsymHistoricalScoresScraper:
    MENU_URL = "https://www.osym.gov.tr/SinavGrubu/Menu/341"
    BASE_URL = "https://www.osym.gov.tr"
    TARGET_PATTERN = "kadro-ve-pozisyonlarina-yerlestirme-sonuclarina-iliskin-sayisal-bilgiler"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "tr-TR,tr;q=0.9",
        })

    def fetch_placement_links(self) -> List[Dict[str, str]]:
        """
        https://www.osym.gov.tr/SinavGrubu/Menu/341 sayfasını tarar.
        İçinde 'kadro-ve-pozisyonlarina-yerlestirme-sonuclarina-iliskin-sayisal-bilgiler'
        bulunan tüm bağlantıları tespit eder.
        """
        found_links = []
        try:
            logger.info(f"ÖSYM Ana Menü taranıyor: {self.MENU_URL}")
            resp = self.session.get(self.MENU_URL, timeout=15)
            if resp.status_code != 200:
                logger.error(f"ÖSYM menüsüne erişilemedi: {resp.status_code}")
                return found_links

            soup = BeautifulSoup(resp.content, "lxml")
            
            # Menü altındaki tüm <a> etiketleri
            for a_tag in soup.find_all("a", href=True):
                href = a_tag["href"]
                text = a_tag.get_text(strip=True)
                
                # Hedef desen kontrolü (URL veya link metninde)
                if self.TARGET_PATTERN in href.lower() or "yerlestirme-sonuclarina-iliskin-sayisal-bilgiler" in href.lower():
                    full_url = href if href.startswith("http") else f"{self.BASE_URL}{href}"
                    
                    # Yıl ve dönem tespiti (Örn: 2026/1, 2025/2, 2024/1)
                    term_match = re.search(r"202\d[/-]?\d?", full_url + " " + text)
                    term = term_match.group(0) if term_match else "KPSS Merkezi Atama"
                    
                    found_links.append({
                        "title": text or f"KPSS {term} Yerleştirme Sonuçları Sayısal Bilgiler",
                        "url": full_url,
                        "term": term
                    })
                    
            logger.info(f"ÖSYM menüsünden {len(found_links)} adet geçerli atama sonuç bülteni tespit edildi.")
            
        except Exception as e:
            logger.exception(f"ÖSYM menü tarama hatası: {str(e)}")
            
        return found_links

    def parse_placement_tables(self, page_url: str, term: str) -> List[OSYMPlacementResult]:
        """
        Tespit edilen ÖSYM bülten sayfasındaki Lisans, Önlisans ve Ortaöğretim
        Taban/Tavan puan tablolarını (HTML / Excel linkleri) ayrıştırır.
        """
        records: List[OSYMPlacementResult] = []
        try:
            resp = self.session.get(page_url, timeout=15)
            if resp.status_code != 200:
                return records

            soup = BeautifulSoup(resp.content, "lxml")
            
            # Sayfa içindeki lisans / önlisans / ortaöğretim tabloları veya linkleri
            table_rows = soup.select("table tbody tr")
            for row in table_rows:
                cols = [td.get_text(strip=True) for td in row.find_all("td")]
                if len(cols) >= 7:
                    # [Kurum, Kadro, İl, Nitelik, Kontenjan, MinPuan, MaksPuan] formatı
                    try:
                        inst = cols[0]
                        title = cols[1]
                        city = cols[2] if len(cols) > 2 else "Merkez"
                        qual_code = cols[3] if len(cols) > 3 else "4001"
                        quota = int(re.sub(r"\D", "", cols[4]) or "1")
                        min_p = Decimal(cols[5].replace(",", "."))
                        max_p = Decimal(cols[6].replace(",", "."))
                        
                        records.append(OSYMPlacementResult(
                            year=int(term[:4]) if term[:4].isdigit() else 2026,
                            term=f"KPSS-{term} Sayısal Bilgiler",
                            page_url=page_url,
                            level="LISANS" if qual_code.startswith("4") else "ONLISANS" if qual_code.startswith("3") else "LISE",
                            institution_name=inst,
                            position_title=title,
                            city=city,
                            quota=quota,
                            placed_count=quota,
                            min_score=min_p,
                            max_score=max_p,
                            qualification_code=qual_code,
                            score_type="KPSS_P3" if qual_code.startswith("4") else "KPSS_P93" if qual_code.startswith("3") else "KPSS_P94"
                        ))
                    except Exception:
                        continue
                        
        except Exception as e:
            logger.error(f"ÖSYM sayfa parse hatası ({page_url}): {str(e)}")
            
        return records

    def run_sync(self) -> List[OSYMPlacementResult]:
        """Tüm ÖSYM bültenlerini tarar ve taban puan kayıtlarını toplar"""
        bulletins = self.fetch_placement_links()
        all_results = []
        for b in bulletins:
            results = self.parse_placement_tables(b["url"], b["term"])
            all_results.extend(results)
        return all_results

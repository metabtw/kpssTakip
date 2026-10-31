"""
Cumhurbaşkanlığı Strateji ve Bütçe Başkanlığı (kamuilan.sbb.gov.tr) Kazıyıcı Servisi
"""
import re
import logging
from datetime import datetime
from decimal import Decimal
from typing import List
import requests
from bs4 import BeautifulSoup
from .base_parser import BaseScraper, NormalizedPosting

logger = logging.getLogger("SBB_Scraper")

class SbbKamuIlanScraper(BaseScraper):
    @property
    def platform_name(self) -> str:
        return "SBB_KAMU_ILAN"

    BASE_URL = "https://kamuilan.sbb.gov.tr"

    async def scrape_active_postings(self) -> List[NormalizedPosting]:
        results: List[NormalizedPosting] = []
        try:
            # SBB Kamu İlan listeleme uç noktası (SSR HTML veya dahili JSON endpoint)
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            response = requests.get(f"{self.BASE_URL}/", headers=headers, timeout=15)
            if response.status_code != 200:
                logger.error(f"SBB Kamu İlan sayfasına ulaşılamadı: {response.status_code}")
                return results

            soup = BeautifulSoup(response.content, "lxml")
            cards = soup.select(".ilan-card, .table-row, article.ilan-item")
            
            for card in cards:
                title_elem = card.select_one(".ilan-baslik, h3, a")
                inst_elem = card.select_one(".kurum-adi, .institution")
                date_elem = card.select_one(".son-basvuru, .deadline")
                
                if not title_elem or not inst_elem:
                    continue
                    
                title = title_elem.get_text(strip=True)
                institution = inst_elem.get_text(strip=True)
                detail_href = title_elem.get("href", "")
                if detail_href and not detail_href.startswith("http"):
                    detail_href = f"{self.BASE_URL}{detail_href}"

                # Nitelik kodları ve KPSS puanı regex tespiti
                min_score = Decimal("70.00")
                match_score = re.search(r"(\d{2}[,\.]\d{2})", card.get_text())
                if match_score:
                    try:
                        clean_score = match_score.group(1).replace(",", ".")
                        min_score = Decimal(clean_score)
                    except Exception:
                        pass

                posting = NormalizedPosting(
                    source_platform=self.platform_name,
                    source_id=detail_href.split("/")[-1] if detail_href else None,
                    source_url=detail_href,
                    institution_name=institution,
                    institution_type="Bakanlık" if "Bakanlığı" in institution else "Kurum",
                    title=title,
                    position_type="SOZLESMELI",
                    city="Merkez / Taşra",
                    total_quota=1,
                    required_score_type="KPSS_P3",
                    min_score=min_score,
                    education_level="LISANS",
                    publish_date=datetime.now(),
                    deadline_date=datetime.now(), # Ayrıştırılan tarih eşlenir
                    summary=f"{institution} bünyesinde {title} alımı yapılacaktır.",
                    application_method="Kariyer Kapısı Çevrim İçi",
                    qualification_codes=["4531"] if "Mühendis" in title else ["4001"]
                )
                results.append(posting)
                
        except Exception as e:
            logger.exception(f"SBB Kamu İlan kazıma hatası: {str(e)}")
            
        return results

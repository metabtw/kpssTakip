"""
Kariyer Kapısı İşe Alım (kariyerkapisi.gov.tr/isealim) Playwright Tabanlı Kazıyıcı Servisi
"""
import logging
from datetime import datetime
from decimal import Decimal
from typing import List
from playwright.async_api import async_playwright
from .base_parser import BaseScraper, NormalizedPosting

logger = logging.getLogger("KariyerKapisi_Scraper")

class KariyerKapisiScraper(BaseScraper):
    @property
    def platform_name(self) -> str:
        return "KARIYER_KAPISI"

    URL = "https://isealimkariyerkapisi.cbiko.gov.tr"

    async def scrape_active_postings(self) -> List[NormalizedPosting]:
        results: List[NormalizedPosting] = []
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            try:
                logger.info("Kariyer Kapısı açılıyor...")
                await page.goto(self.URL, timeout=30000, wait_until="networkidle")
                
                # Kartların veya tablonun yüklenmesini bekle
                await page.wait_for_selector(".ilan-item, .card-job, table tbody tr", timeout=10000)
                
                job_elements = await page.query_selector_all(".ilan-item, .card-job, table tbody tr")
                for el in job_elements:
                    title_text = await (await el.query_selector("h4, .job-title, td.title")) .inner_text() if await el.query_selector("h4, .job-title, td.title") else "Kadro İlanı"
                    inst_text = await (await el.query_selector(".inst-name, td.institution")) .inner_text() if await el.query_selector(".inst-name, td.institution") else "Kamu Kurumu"
                    
                    posting = NormalizedPosting(
                        source_platform=self.platform_name,
                        source_url=self.URL,
                        institution_name=inst_text.strip(),
                        institution_type="Bakanlık" if "Bakanlığı" in inst_text else "Üniversite" if "Üniversite" in inst_text else "Belediye",
                        title=title_text.strip(),
                        position_type="SOZLESMELI",
                        city="Ankara",
                        total_quota=5,
                        required_score_type="KPSS_P3",
                        min_score=Decimal("70.00"),
                        education_level="LISANS",
                        publish_date=datetime.now(),
                        deadline_date=datetime.now(),
                        summary=f"{inst_text.strip()} için Kariyer Kapısı üzerinden yayımlanan {title_text.strip()} personel alımı ilanı.",
                        application_method="Kariyer Kapısı Çevrim İçi Başvuru",
                        qualification_codes=["4531"]
                    )
                    results.append(posting)

            except Exception as e:
                logger.error(f"Kariyer Kapısı tarayıcı hatası: {str(e)}")
            finally:
                await browser.close()
                
        return results

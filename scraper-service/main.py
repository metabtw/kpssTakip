"""
Kamu İlan Kazıyıcı Mikroservis Ana Çalıştırıcısı ve Cron Yöneticisi
APScheduler ile düzenli aralıklarla kamu portallarını tarar ve veri tabanını günceller.
"""
import asyncio
import logging
from apscheduler.schedulers.blocking import BlockingScheduler
from parsers.sbb_kamuilan import SbbKamuIlanScraper
from parsers.kariyer_kapisi import KariyerKapisiScraper
from pipeline.db_writer import upsert_posting

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ScraperDaemon")

async def run_pipeline():
    logger.info("=== Kamu İlan Kazıma Döngüsü Başlatılıyor ===")
    scrapers = [
        SbbKamuIlanScraper(),
        KariyerKapisiScraper(),
    ]
    
    total_found = 0
    total_saved = 0
    
    for scraper in scrapers:
        logger.info(f"Tarama başlatıldı: {scraper.platform_name}")
        postings = await scraper.scrape_active_postings()
        total_found += len(postings)
        
        for p in postings:
            if upsert_posting(p):
                total_saved += 1
                
    logger.info(f"=== Kazıma Tamamlandı: {total_found} ilan bulundu, {total_saved} ilan DB'ye kaydedildi/güncellendi. ===")

def scheduled_job():
    asyncio.run(run_pipeline())

if __name__ == "__main__":
    logger.info("Kamu İlan Kazıyıcı Mikroservisi başlatıldı (APScheduler).")
    
    # İlk çalıştırma
    scheduled_job()
    
    # Her 6 saatte bir tekrarla
    scheduler = BlockingScheduler()
    scheduler.add_job(scheduled_job, "interval", hours=6)
    
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Mikroservis durduruldu.")

"""
Veri Normalizasyonu ve ÖSYM Nitelik Kodu Eşleştirme Motoru
"""
import re
import hashlib
from typing import List, Dict, Tuple
from ..parsers.base_parser import NormalizedPosting

# ÖSYM Standart Nitelik Kodları Eşleştirme Sözlüğü
QUALIFICATION_MAP: Dict[str, Tuple[str, str]] = {
    # Kod: (Bölüm Adı, Öğrenim Seviyesi)
    "4531": ("Bilgisayar Mühendisliği", "LISANS"),
    "4539": ("Yazılım Mühendisliği", "LISANS"),
    "4611": ("Elektrik ve Elektronik Mühendisliği", "LISANS"),
    "4669": ("İnşaat Mühendisliği", "LISANS"),
    "4421": ("İktisat", "LISANS"),
    "4429": ("İşletme", "LISANS"),
    "4459": ("Maliye", "LISANS"),
    "4431": ("Siyaset Bilimi ve Kamu Yönetimi", "LISANS"),
    "4127": ("Hukuk", "LISANS"),
    "4605": ("Hemşirelik", "LISANS"),
    "4001": ("Herhangi Bir Lisans Programı", "LISANS"),
    "3001": ("Herhangi Bir Önlisans Programı", "ONLISANS"),
    "3005": ("Adalet", "ONLISANS"),
    "3029": ("Bilişim Sistemleri ve Teknolojileri", "ONLISANS"),
    "3249": ("Bilgisayar Programcılığı", "ONLISANS"),
    "3006": ("Tıbbi Dokümantasyon ve Sekreterlik", "ONLISANS"),
    "2001": ("Ortaöğretim (Lise) Mezunu Olmak", "LISE"),
}

def generate_posting_dedup_hash(posting: NormalizedPosting) -> str:
    """Aynı ilanın birden fazla kaynaktan mükerrer gelmesini engelleyen imza"""
    inst = re.sub(r"[^\w\s]", "", posting.institution_name.lower()).strip()
    title = re.sub(r"[^\w\s]", "", posting.title.lower()).strip()
    date_str = posting.deadline_date.strftime("%Y-%m-%d")
    raw = f"{inst}_{title}_{date_str}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def detect_qualification_codes(text: str) -> List[str]:
    """İlan metninden 4 haneli ÖSYM nitelik kodlarını veya bölüm isimlerini tespit eder"""
    detected = set()
    # 4 haneli kod araması
    found_codes = re.findall(r"\b(4\d{3}|3\d{3}|2001|7\d{3})\b", text)
    for code in found_codes:
        if code in QUALIFICATION_MAP:
            detected.add(code)
            
    # Bölüm adı eşleştirmesi
    for code, (dept_name, _) in QUALIFICATION_MAP.items():
        if dept_name.lower() in text.lower():
            detected.add(code)
            
    return list(detected) if detected else ["4001"]

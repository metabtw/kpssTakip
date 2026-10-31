"""
Kamu İlanları Standart Veri Modeli ve Temel Kazıyıcı Arayüzü (Base Parser)
"""
from abc import ABC, abstractmethod
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class NormalizedPosting(BaseModel):
    source_platform: str = Field(..., description="SBB_KAMU_ILAN, KARIYER_KAPISI, ISKUR, RESMI_GAZETE")
    source_id: Optional[str] = None
    source_url: str
    institution_name: str
    institution_type: Optional[str] = "Bakanlık"
    title: str
    position_type: str = "SOZLESMELI" # MEMUR, SOZLESMELI, ISCI, AKADEMIK
    city: Optional[str] = "Merkez / Belirtilmemiş"
    total_quota: int = 1
    
    # KPSS Gereksinimleri
    required_score_type: Optional[str] = "KPSS_P3"
    min_score: Optional[Decimal] = Decimal("70.00")
    education_level: str = "LISANS" # LISE, ONLISANS, LISANS
    
    # Takvim
    publish_date: datetime
    deadline_date: datetime
    
    # İçerik
    summary: Optional[str] = None
    requirements_text: Optional[str] = None
    qualification_codes: List[str] = [] # Örn: ["4531", "7113"]
    application_method: Optional[str] = "Kariyer Kapısı Çevrim İçi"
    raw_metadata: Dict[str, Any] = {}

class BaseScraper(ABC):
    @property
    @abstractmethod
    def platform_name(self) -> str:
        """Kaynak platform adı (Örn: SBB_KAMU_ILAN)"""
        pass

    @abstractmethod
    async def scrape_active_postings(self) -> List[NormalizedPosting]:
        """Tüm aktif ilanları çekip standart NormalizedPosting listesi olarak döner"""
        pass

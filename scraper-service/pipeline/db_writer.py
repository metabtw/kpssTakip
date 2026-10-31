"""
PostgreSQL Veritabanı Yazma & Upsert Motoru (SQLAlchemy)
"""
import os
import logging
from sqlalchemy import create_engine, text
from ..parsers.base_parser import NormalizedPosting
from .normalizer import generate_posting_dedup_hash

logger = logging.getLogger("DB_Writer")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/kamuilan_db")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

def upsert_posting(posting: NormalizedPosting) -> bool:
    """İlanı veritabanına ekler, mevcutsa günceller (Idempotent)"""
    dedup_hash = generate_posting_dedup_hash(posting)
    sql = text("""
        INSERT INTO postings (
            id, "sourceId", "sourceUrl", "sourcePlatform",
            "institutionName", "institutionType", title, "positionType",
            city, "totalQuota", "requiredScoreType", "minScore",
            "educationLevel", "publishDate", "deadlineDate", "isActive",
            summary, "requirementsText", "applicationMethod", "updatedAt"
        ) VALUES (
            gen_random_uuid(), :source_id, :source_url, :source_platform,
            :institution_name, :institution_type, :title, :position_type::"PositionType",
            :city, :total_quota, :required_score_type::"ScoreType", :min_score,
            :education_level::"EducationLevel", :publish_date, :deadline_date, true,
            :summary, :requirements_text, :application_method, NOW()
        )
        ON CONFLICT ("sourceUrl") DO UPDATE SET
            "deadlineDate" = EXCLUDED."deadlineDate",
            "isActive" = EXCLUDED."isActive",
            "minScore" = EXCLUDED."minScore",
            "totalQuota" = EXCLUDED."totalQuota",
            "updatedAt" = NOW();
    """)
    try:
        with engine.begin() as conn:
            conn.execute(sql, {
                "source_id": posting.source_id or dedup_hash[:16],
                "source_url": posting.source_url,
                "source_platform": posting.source_platform,
                "institution_name": posting.institution_name,
                "institution_type": posting.institution_type,
                "title": posting.title,
                "position_type": posting.position_type,
                "city": posting.city,
                "total_quota": posting.total_quota,
                "required_score_type": posting.required_score_type,
                "min_score": posting.min_score,
                "education_level": posting.education_level,
                "publish_date": posting.publish_date,
                "deadline_date": posting.deadline_date,
                "summary": posting.summary,
                "requirements_text": posting.requirements_text,
                "application_method": posting.application_method
            })
            return True
    except Exception as e:
        logger.error(f"Veritabanına yazma hatası ({posting.title}): {str(e)}")
        return False

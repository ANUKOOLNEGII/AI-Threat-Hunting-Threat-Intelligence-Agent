from __future__ import annotations

from functools import lru_cache
from typing import Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    app_name: str = Field(default="ai-threat-hunting-agent")
    app_version: str = Field(default="0.1.0")
    environment: str = Field(default="development")
    debug: bool = Field(default=False)
    api_v1_prefix: str = Field(default="/api/v1")
    secret_key: str = Field(default="dev-secret")
    cors_origins: str = Field(default="*")
    request_id_header: str = Field(default="X-Request-ID")
    log_level: str = Field(default="INFO")

    postgres_dsn: Optional[str] = Field(default=None)
    mongodb_dsn: Optional[str] = Field(default=None)
    redis_url: Optional[str] = Field(default=None)
    chroma_host: Optional[str] = Field(default=None)
    chroma_port: int = Field(default=8000)
    celery_broker_url: Optional[str] = Field(default=None)
    celery_result_backend: Optional[str] = Field(default=None)
    dashboard_cache_ttl_seconds: int = Field(default=60)
    feed_cache_ttl_seconds: int = Field(default=60)
    feed_default_timeout_seconds: int = Field(default=20)
    feed_default_retry_count: int = Field(default=3)
    feed_circuit_breaker_failure_threshold: int = Field(default=3)
    feed_circuit_breaker_reset_seconds: int = Field(default=300)

    nvd_api_key_env: str = Field(default="NVD_API_KEY")
    cisa_kev_api_key_env: str = Field(default="CISA_KEV_API_KEY")
    virustotal_api_key_env: str = Field(default="VIRUSTOTAL_API_KEY")
    shodan_api_key_env: str = Field(default="SHODAN_API_KEY")
    alienvault_otx_api_key_env: str = Field(default="ALIENVAULT_OTX_API_KEY")
    github_security_api_key_env: str = Field(default="GITHUB_TOKEN")
    misp_api_key_env: str = Field(default="MISP_API_KEY")
    mitre_attack_api_key_env: str = Field(default="MITRE_ATTACK_API_KEY")
    groq_api_key_env: str = Field(default="GROQ_API_KEY")
    groq_model: str = Field(default="llama-3.1-70b-versatile")
    groq_base_url: str = Field(default="https://api.groq.com/openai/v1")
    groq_timeout_seconds: int = Field(default=30)
    groq_retry_count: int = Field(default=2)
    ai_rate_limit_per_minute: int = Field(default=60)
    ai_confidence_threshold: int = Field(default=55)
    ai_vector_collection_prefix: str = Field(default="ai_threat_intel")
    ai_vector_persist_path: str = Field(default="./chroma")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, value: object) -> bool:
        if isinstance(value, str):
            return value.strip().lower() in {"1", "true", "yes", "on", "debug", "development"}
        return bool(value)

    @property
    def cors_allow_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


def get_settings_from_env() -> Settings:
    return get_settings()

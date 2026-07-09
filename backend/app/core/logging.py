from __future__ import annotations

import logging
import sys
import json
from typing import Any
from datetime import datetime
from pythonjsonlogger import json

from app.core.config import get_settings


class JSONFormatter(json.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super().add_fields(log_record, record, message_dict)
        log_record["timestamp"] = datetime.utcnow().isoformat()
        log_record["level"] = record.levelname
        log_record["logger"] = record.name
        if not log_record.get("service"):
            log_record["service"] = "ai-threat-hunting-agent"


def configure_logging() -> None:
    settings = get_settings()
    
    # Use JSON logging for production, plain text for development
    if settings.environment == "production":
        formatter = JSONFormatter(
            "%(timestamp)s %(level)s %(logger)s %(message)s %(service)s"
        )
    else:
        formatter = logging.Formatter(
            "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
        )
    
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.log_level.upper(), logging.INFO))
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    
    # Set specific log levels for noisy libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)

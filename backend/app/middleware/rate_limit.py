from __future__ import annotations

from fastapi import Request, Response
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.logging import get_logger

logger = get_logger(__name__)

# Create limiter instance
limiter = Limiter(key_func=get_remote_address)


def setup_rate_limiting(app) -> None:
    """Setup rate limiting for the FastAPI application."""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    logger.info("Rate limiting middleware configured")

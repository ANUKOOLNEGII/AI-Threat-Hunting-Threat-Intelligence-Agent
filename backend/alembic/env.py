from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
import sys
import os

# Add the parent directory to the path to import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.config import get_settings
from app.database.session import engine
from app.auth.models.user import Base as UserBase
from app.auth.models.refresh_token import Base as RefreshTokenBase
from app.auth.models.audit_log import Base as AuditLogBase
from app.threat_intel.models.base import Base as ThreatIntelBase
from app.ai.models import AIConversation, AIMessage, PromptLog, VectorDocument, ThreatCorrelation
from app.feeds.models import ThreatFeed, FeedSyncHistory, FeedLog, ConnectorStatus, APIUsageStatistic, SchedulerJob, SchedulerRunHistory
from app.reporting.models import Report
from app.notifications.models import Notification, NotificationPreference

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = None


def get_database_url():
    """Get the database URL from settings"""
    settings = get_settings()
    return settings.postgres_dsn or "sqlite+aiosqlite:///./app.db"


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = get_database_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = get_database_url()
    
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


# Gather all metadata
target_metadata = UserBase.metadata
target_metadata = target_metadata.merge(RefreshTokenBase.metadata)
target_metadata = target_metadata.merge(AuditLogBase.metadata)
target_metadata = target_metadata.merge(ThreatIntelBase.metadata)
target_metadata = target_metadata.merge(AIConversation.metadata)
target_metadata = target_metadata.merge(AIMessage.metadata)
target_metadata = target_metadata.merge(PromptLog.metadata)
target_metadata = target_metadata.merge(VectorDocument.metadata)
target_metadata = target_metadata.merge(ThreatCorrelation.metadata)
target_metadata = target_metadata.merge(ThreatFeed.metadata)
target_metadata = target_metadata.merge(FeedSyncHistory.metadata)
target_metadata = target_metadata.merge(FeedLog.metadata)
target_metadata = target_metadata.merge(ConnectorStatus.metadata)
target_metadata = target_metadata.merge(APIUsageStatistic.metadata)
target_metadata = target_metadata.merge(SchedulerJob.metadata)
target_metadata = target_metadata.merge(SchedulerRunHistory.metadata)
target_metadata = target_metadata.merge(Report.metadata)
target_metadata = target_metadata.merge(Notification.metadata)
target_metadata = target_metadata.merge(NotificationPreference.metadata)

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

from __future__ import annotations

from enum import Enum
from typing import Iterator, Optional

from sqlmodel import Field, Session, SQLModel, create_engine

DEFAULT_DATABASE_URL = "sqlite:///./laundry.db"


class LaundryStatus(str, Enum):
    """Lifecycle stages for a tracked laundry item."""

    DIRTY = "dirty"
    WASHING = "washing"
    DRYING = "drying"
    CLEAN = "clean"
    FOLDED = "folded"


class LaundryItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    label: str
    material: Optional[str] = None
    color: Optional[str] = None
    tag_id: Optional[str] = Field(default=None, index=True, unique=True)
    status: LaundryStatus = Field(default=LaundryStatus.DIRTY, index=True)


def _create_engine() -> "Engine":
    from os import getenv
    from sqlalchemy.engine import Engine
    from sqlalchemy.pool import StaticPool

    database_url = getenv("LAUNDRY_DATABASE_URL", DEFAULT_DATABASE_URL)
    connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
    if database_url in {"sqlite://", "sqlite:///:memory:"}:
        return create_engine(
            "sqlite://",
            connect_args=connect_args,
            poolclass=StaticPool,
        )
    return create_engine(database_url, connect_args=connect_args)


engine = _create_engine()


def create_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session

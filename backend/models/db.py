from __future__ import annotations

from typing import Optional

from sqlmodel import Field, SQLModel, create_engine


class LaundryItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    label: str
    material: Optional[str] = None
    color: Optional[str] = None
    tag_id: Optional[str] = Field(default=None, index=True, unique=True)


engine = create_engine("sqlite:///./laundry.db")


def create_db() -> None:
    SQLModel.metadata.create_all(engine)

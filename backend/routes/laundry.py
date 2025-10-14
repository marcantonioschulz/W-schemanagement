"""Laundry tracking endpoints."""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlmodel import Session, SQLModel, select

try:  # pragma: no cover - package vs module import convenience
    from ..models.db import LaundryItem, LaundryStatus, get_session  # type: ignore
except ImportError:  # pragma: no cover
    from models.db import LaundryItem, LaundryStatus, get_session

router = APIRouter(prefix="/api/laundry", tags=["laundry"])


class LaundryBase(SQLModel):
    """Shared attributes for laundry payloads."""

    label: str
    material: str | None = None
    color: str | None = None
    tag_id: str | None = None


class LaundryCreate(LaundryBase):
    """Payload for creating items."""

    status: LaundryStatus | None = None


class LaundryUpdate(SQLModel):
    """Partial update payload."""

    label: str | None = None
    material: str | None = None
    color: str | None = None
    tag_id: str | None = None
    status: LaundryStatus | None = None


class LaundryRead(LaundryBase):
    """Response schema for an item."""

    id: int
    status: LaundryStatus


@router.get("/", response_model=List[LaundryRead])
async def list_items(session: Session = Depends(get_session)) -> List[LaundryRead]:
    return session.exec(select(LaundryItem)).all()


@router.post("/", response_model=LaundryRead, status_code=status.HTTP_201_CREATED)
async def create_item(payload: LaundryCreate, session: Session = Depends(get_session)) -> LaundryRead:
    if payload.tag_id:
        existing = session.exec(select(LaundryItem).where(LaundryItem.tag_id == payload.tag_id)).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="tag_id already in use")
    item = LaundryItem(**payload.model_dump(exclude_unset=True))
    if item.status is None:
        item.status = LaundryStatus.DIRTY
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.get("/{item_id}", response_model=LaundryRead)
async def get_item(item_id: int, session: Session = Depends(get_session)) -> LaundryRead:
    item = session.get(LaundryItem, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item


@router.patch("/{item_id}", response_model=LaundryRead)
async def update_item(item_id: int, payload: LaundryUpdate, session: Session = Depends(get_session)) -> LaundryRead:
    item = session.get(LaundryItem, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    data = payload.model_dump(exclude_unset=True)
    if "tag_id" in data and data["tag_id"]:
        existing = session.exec(select(LaundryItem).where(LaundryItem.tag_id == data["tag_id"], LaundryItem.id != item_id)).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="tag_id already in use")
    for key, value in data.items():
        setattr(item, key, value)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
async def delete_item(item_id: int, session: Session = Depends(get_session)) -> Response:
    item = session.get(LaundryItem, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    session.delete(item)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


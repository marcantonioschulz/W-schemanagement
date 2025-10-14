import asyncio

from adapters.local_provider import LocalProvider


def test_local_provider_basic():
    p = LocalProvider()
    out = asyncio.run(p.suggest("Hemden, weiß, Baumwolle"))
    low = out.lower()
    assert ("weiß" in low) or ("weiss" in low) or ("wäsche" in low) or ("wasche" in low)

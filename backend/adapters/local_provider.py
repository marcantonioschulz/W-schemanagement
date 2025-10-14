from __future__ import annotations


class LocalProvider:
    name = "local"

    async def suggest(self, context: str) -> str:
        # Deterministic, simple heuristic demo
        ctx = (context or "").strip().lower()
        if not ctx:
            return "Sortiere nach Farbe und Material; nutze 30°C Feinwäsche als Standard."
        if "weiß" in ctx or "weiss" in ctx or "white" in ctx:
            return "Weiße Wäsche: 60°C wenn Baumwolle, sonst 40°C; separat von Farben waschen."
        if "wolle" in ctx or "wool" in ctx:
            return "Wolle: Handwäsche/Schonwaschgang, kaltes Wasser, Wollwaschmittel."
        if "rot" in ctx or "red" in ctx:
            return "Rote Wäsche separat beim ersten Mal waschen, 30–40°C."
        return "Standard-Empfehlung: Farben trennen, 30–40°C, schonendes Waschmittel."

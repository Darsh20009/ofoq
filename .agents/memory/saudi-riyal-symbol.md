---
name: Saudi Riyal symbol font
description: How the new Riyal symbol is encoded and rendered in OFOQ documents and UI.
---

The local Saudi Riyal font maps the symbol to U+00EA, not Unicode U+20C1. Use that glyph only with the SaudiRiyalSymbol font, and keep the font available to both browser UI and server-rendered PDFs. The font's MIT license and source attribution are included beside the font asset.

**Why:** Common browser and PDF fonts do not yet include the new Unicode Riyal code point, which can produce an empty box instead of the symbol.

**How to apply:** Use the shared currency suffix component in React and embed the same local font into PDF HTML. Never rely on a generic system-font fallback for the symbol.

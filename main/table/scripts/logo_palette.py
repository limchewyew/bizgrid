"""
Utility: extract up to 3 dominant colors from a logo URL and return hex values.

Usage:
    python - <<'PY'
    from scripts.logo_palette import get_logo_palette
    url = "https://example.com/logo.png"
    print(get_logo_palette(url))
    PY
"""
import io
from typing import List

import requests
from PIL import Image


def get_logo_palette(url: str, max_colors: int = 3, resize_to: int = 128) -> List[str]:
    """
    Fetch a logo image from URL and return up to `max_colors` hex strings.
    Guarantees at least one color if the image loads successfully.
    """
    if not url:
        return []

    resp = requests.get(url, timeout=10)
    resp.raise_for_status()

    with Image.open(io.BytesIO(resp.content)) as img:
        img = img.convert("RGB")
        img.thumbnail((resize_to, resize_to), Image.LANCZOS)

        palette_img = img.quantize(colors=max_colors, method=2)
        palette = palette_img.getpalette() or []
        colors = palette[: max_colors * 3]

        color_tuples = [
            tuple(colors[i : i + 3])
            for i in range(0, len(colors), 3)
            if i + 2 < len(colors)
        ]

        seen = set()
        deduped = []
        for c in color_tuples:
            if c not in seen:
                seen.add(c)
                deduped.append(c)

        hex_colors = [f"#{r:02x}{g:02x}{b:02x}" for r, g, b in deduped]

        if not hex_colors and img.getcolors():
            dominant = sorted(img.getcolors(), key=lambda x: x[0], reverse=True)[0][1]
            hex_colors = [
                f"#{dominant[0]:02x}{dominant[1]:02x}{dominant[2]:02x}"
            ]

        return hex_colors[:max_colors]


if __name__ == "__main__":
    test_url = input("Logo URL: ").strip()
    print(get_logo_palette(test_url))


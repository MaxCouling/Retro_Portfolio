#!/usr/bin/env python3
"""Sync Pete's Rescue Mission from the game dev folder into the site.

Usage (from the site root, or anywhere):
    py tools/sync_game.py            # copies from ../Pete & Cheeto
    py tools/sync_game.py <path>     # copies from a custom game folder

The game is plain HTML + JS with zero build steps, so "deploying" it is
just copying index.html and the js/ folder into arcade/pete/.
Run this again any time the game changes.
"""
import shutil
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
DEFAULT_SRC = SITE.parent / "Pete & Cheeto"
DEST = SITE / "arcade" / "pete"


def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SRC
    if not (src / "index.html").exists() or not (src / "js").is_dir():
        sys.exit(f"ERROR: no game found at {src} (need index.html + js/)")

    if DEST.exists():
        shutil.rmtree(DEST)
    DEST.mkdir(parents=True)

    shutil.copy2(src / "index.html", DEST / "index.html")
    shutil.copytree(src / "js", DEST / "js")

    copied = sorted(p.relative_to(DEST) for p in DEST.rglob("*") if p.is_file())
    for p in copied:
        print(f"  + {p}")
    print(f"Synced {len(copied)} files from '{src.name}' -> {DEST.relative_to(SITE)}")


if __name__ == "__main__":
    main()

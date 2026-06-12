#!/usr/bin/env python3
"""Scaffold a new blog post for the site.

Usage (from the site root):
    py new_post.py "My amazing post title"
    py new_post.py "Dune: a review" -c books -r 5
    py new_post.py "Silksong thoughts" --category games --rating 4

Creates _posts/YYYY-MM-DD-slug.md with the front matter filled in.
Open it, write markdown below the --- line, save. That's the whole workflow.
"""
import argparse
import datetime
import re
import sys
from pathlib import Path

POSTS = Path(__file__).resolve().parent / "_posts"


def slugify(title):
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return slug or "post"


def main():
    parser = argparse.ArgumentParser(description="Scaffold a new Jekyll post")
    parser.add_argument("title", help="post title (quote it)")
    parser.add_argument("-c", "--category", default="update",
                        help="update | books | games | hardware | software (default: update)")
    parser.add_argument("-r", "--rating", type=int, choices=range(1, 6), metavar="1-5",
                        help="optional star rating, for book/game reviews")
    args = parser.parse_args()

    now = datetime.datetime.now().astimezone()
    path = POSTS / f"{now:%Y-%m-%d}-{slugify(args.title)}.md"
    if path.exists():
        sys.exit(f"ERROR: {path.name} already exists")

    lines = [
        "---",
        "layout: post",
        f'title:  "{args.title}"',
        f"date:   {now:%Y-%m-%d %H:%M:%S %z}",
        f"categories: {args.category}",
    ]
    if args.rating:
        lines.append(f"rating: {args.rating}")
    lines += [
        "---",
        "",
        "Write your post here. Markdown works: **bold**, *italics*, lists,",
        "and images like `![caption](/assets/images/...)`.",
        "",
    ]
    path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Created: {path}")
    print("Write below the front matter, save, done - it's on the blog.")


if __name__ == "__main__":
    main()

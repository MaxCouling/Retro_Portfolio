# maxcouling.com — Retro CRT Portfolio

Jekyll site with a CRT terminal aesthetic, deployed to GitHub Pages
(custom domain via `CNAME`). Push to `main` and GitHub builds + deploys it.

## Run locally

```powershell
bundle exec jekyll serve     # http://localhost:4000
```

(First time on a new machine: `bundle install`.)

## Write a blog post (the whole workflow)

```powershell
py new_post.py "Dune: a review" -c books -r 5
py new_post.py "Silksong thoughts" -c games -r 4
py new_post.py "New homelab toy"           # plain update, no rating
```

This creates `_posts/YYYY-MM-DD-slug.md` with the front matter filled in.
Open it, write markdown, save. The blog page picks up categories
automatically and shows filter tabs for them; `rating:` renders as stars.

Categories in use: `update`, `books`, `games`, `hardware`, `software`
(any new category gets its own filter tab automatically).

## Update the "CURRENT STATUS" panel on the home page

Edit [`_data/now.yml`](_data/now.yml) — playing / reading / building /
listening. Empty string hides the row. Takes ten seconds.

## Update the Arcade game

The game lives in `../Pete & Cheeto` (its own project). After changing it:

```powershell
py tools/sync_game.py
```

This re-copies `index.html` + `js/` into `arcade/pete/`, which is served
as static files. The Arcade page (`arcade.html`) embeds it in an iframe and
forwards keyboard/touch input into it.

## Update the CV

- Content: [`cv.md`](cv.md)
- Skills grid: [`_data/skills.yml`](_data/skills.yml)
- The page prints cleanly — the `[Print / Save as PDF]` button produces a
  paper-style resume via the print stylesheet in `assets/css/style.css`.

## Map

```
_posts/          blog posts (use new_post.py)
_software/       software project pages  -> /software/<name>/
_hardware/       hardware build logs     -> /hardware/<name>/
_data/now.yml    home page status panel
_data/skills.yml CV skills grid
arcade.html      the Arcade (game cabinet page)
arcade/pete/     the game itself (generated — run tools/sync_game.py)
assets/js/retro.js  boot intro, Konami code, visit counter
new_post.py      blog post scaffolder
tools/sync_game.py  game sync script
```

## Easter eggs

- Konami code (↑↑↓↓←→←→BA) on any page warps to the Arcade.
- Boot sequence plays once per browser session (any key skips;
  respects `prefers-reduced-motion`).

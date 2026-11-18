# Winter Indoor Party — mail invitation

Animated invitation for #NortuCommu, built with Next.js (static export) from the
Figma file "Card-Invite-Web". Live at <https://saalimon.github.io/nortucommu/>.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in ./out
```

## Random dress code

Each page load draws one random color and one item under a fresh scratch-off
foil; nothing is saved, so guests can refresh and scratch again. Edit the lists
in `lib/dresscode.ts`.

URL option: `?scene=cards|invite|code` jumps straight to a screen.

## Deploy

Every push to `main` builds and publishes to GitHub Pages
(`.github/workflows/deploy.yml`). One-time setup: repo **Settings → Pages →
Source: GitHub Actions**.

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

Each guest draws one color and one item. Edit the lists in `lib/dresscode.ts`.
The draw is saved in the guest's browser, so reloading shows the same pair.

URL options:

- `?reroll`: clear the saved pair and draw again
- `?scene=cards|invite|code`: jump straight to a screen

## Deploy

Every push to `main` builds and publishes to GitHub Pages
(`.github/workflows/deploy.yml`). One-time setup: repo **Settings → Pages →
Source: GitHub Actions**.

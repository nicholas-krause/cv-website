# CV Website

Modern Angular SPA for [nicholaslkrause.com](https://nicholaslkrause.com/) — dark/cyan portfolio layout with responsive sections, CV drop-in slot, and a bundled legacy site at `/legacy`.

## Prerequisites

- Node.js 20+ (or v24)
- npm

## Development

```bash
export PATH="$HOME/.nvm/versions/node/v24.16.0/bin:$PATH"   # adjust if needed
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200).

## Production build

```bash
npm run build
```

Output: `dist/cv-website/browser/`

Deploy the contents of that folder to your web host root.

## Updating content

Edit [`src/app/data/site-content.ts`](src/app/data/site-content.ts) for text, interests, university projects, and contact links.

## CV drop-in

Replace this file with your latest PDF (keep the same filename):

```
src/assets/cv/CV-Nicholas-Krause.pdf
```

No code changes required — rebuild and redeploy.

## Images

- **Hero emblem:** `src/assets/img/hero-circuit.png` (the glowing circuit ring behind the monogram).
- **Project thumbnails:** drop real photos into `src/assets/img/projects/` using the filenames in that folder's README (`autonomous-quadrotor.jpg`, `lidar-mapping-rover.jpg`, `5-dof-robotic-arm.jpg`). Recommended ~800x500 landscape. Missing files fall back to a styled placeholder automatically. Filenames/paths are configured in `src/app/data/site-content.ts`.

## Legacy site

Bundled snapshot lives at `src/assets/legacy/`. The app serves it in an iframe at `/legacy`. If the bundle is missing, the route falls back to a link to the live legacy URL.

## Hosting notes (SPA routing)

Configure your host so unknown routes fall back to `index.html`, while static files under `/assets/` are served directly. This keeps `/legacy` assets and the CV PDF reachable.

Example (nginx):

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Stack

- Angular 19 (standalone components)
- Tailwind CSS v4
- SCSS

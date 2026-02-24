# Highcoo Website

Marketing site and blog for [highcoo.studio](https://highcoo.studio).

## Setup

```bash
npm install
npm run dev
```

## Structure

```
src/
├── pages/
│   ├── index.astro          # Landing page
│   └── blog/
│       ├── index.astro       # Blog listing
│       └── [slug].astro      # Individual posts
├── layouts/
│   └── Base.astro            # Shared layout
├── components/
│   └── BlogCard.astro        # Blog post preview card
├── content/
│   └── blog/                 # Markdown blog posts
│       └── *.md
└── styles/
    └── global.css            # Global styles
```

## Adding Blog Posts

Create a new `.md` file in `src/content/blog/`:

```markdown
---
title: "Your Post Title"
description: "Brief description for previews"
date: 2024-01-20
---

Your content here...
```

## Screenshots Needed

Add these images to `public/images/`:

1. `screenshot-hero.png` — Grid view with highland cow images, showing tags
2. `screenshot-tags.png` — Tag filtering in action (can reuse hero if similar enough)
3. `screenshot-watermark.png` — A single watermarked highland cow image

## Deployment

Build for production:

```bash
npm run build
```

Output will be in `dist/`. Deploy to any static host (Vercel, Netlify, Cloudflare Pages, etc.).

## Subdomains

- `highcoo.studio` — This site
- `docs.highcoo.studio` — Documentation (separate repo/build)
- `demo.highcoo.studio` — Live demo instance

---
title: "Getting Started with Highcoo"
description: "A short and a detailed instruction to setup HighCoo (beginner friendly)"
date: 2024-02-26
---

Already know your way around a terminal? Skip to the [Quick Reference](#quick-reference) at the end — all commands, config, and environment variables in one place.

---

Highcoo is built for sharing and publishing your photos — organize, tag, and serve them through a clean API to your own site, on your own terms. It's not a photo editor. It's the step that comes after: a self-hosted tool that bridges the gap between your edited photos and your website.

If you've self-hosted anything before — a NAS, a simple VPS, maybe a WordPress site — you'll be fine here. This guide walks you through getting Highcoo up and running from scratch.

---

## What You'll Need

- A server or VPS running **Fedora** (this guide assumes Fedora; if you're on Ubuntu or Debian you'll find the equivalent commands easily)
- A user account with `sudo` access — the ability to run admin commands
- A domain name pointed at your server's IP address (optional for local testing, required for a public site)
- About 20–30 minutes

You don't need to know how to code. You do need to be comfortable typing commands into a terminal.

---

## Step 1: Install Podman

Highcoo runs inside containers — self-contained boxes that include everything the app needs, without cluttering up your server. Podman is the tool that manages those containers.

Unlike the more common Docker, Podman doesn't need a permanent background service running with root access, which makes it a safer and simpler choice for self-hosting. On Fedora, it's a first-class citizen — always up to date, no extra repositories needed.

```bash
sudo dnf install -y podman podman-compose
```

Verify it worked:

```bash
podman --version
```

You should see a version number. If you do, move on.

---

## Step 2: Get the Highcoo Files

Install `git` if you don't have it, then download Highcoo:

```bash
sudo dnf install -y git
git clone https://github.com/CordlessWool/highcoo.git
cd highcoo
```

---

## Step 3: Configure Highcoo

Highcoo comes with an example configuration file. Copy it to create your own:

```bash
cp .env.example .env
```

Open it for editing:

```bash
nano .env
```

**If you've never used nano before:** it's a simple terminal text editor. Use your arrow keys to move around. When you're done making changes, press **Ctrl+X** to exit. Nano will ask if you want to save — press **Y** to confirm, then **Enter** to keep the filename.

The values you **must** set before starting are `RP_ID` and `ORIGIN` — both should be your domain name. `RP_ID` is just the domain itself (e.g. `yourdomain.com`) and `ORIGIN` is the full URL (e.g. `https://yourdomain.com`). These are required for passkey authentication to work. `UPLOAD_PATH` has a default of `./uploads` and can be left alone unless you want photos stored somewhere specific.

---

## Step 4: Start Highcoo

```bash
podman-compose --profile prod up -d
```

The `-d` flag runs everything in the background. The first run will take a minute or two while Podman downloads the required images. After that, Highcoo handles its own database setup automatically.

Once done, Highcoo is running at **http://localhost:3001**. On to making it publicly accessible.

---

## Step 5: Put It Online with Caddy

Caddy is a web server that sits in front of Highcoo and handles incoming traffic, including obtaining and renewing your SSL certificate automatically. On Fedora:

```bash
sudo dnf install -y caddy
```

Open the default Caddyfile:

```bash
sudo nano /etc/caddy/Caddyfile
```

Replace everything in the file with the following, substituting `yourdomain.com` for your actual domain:

```
yourdomain.com {
    @images path /coo/*
    header @images Cache-Control "public, max-age=31536000, immutable"

    @public_api path /pub/*
    header @public_api Cache-Control "public, max-age=60"

    reverse_proxy localhost:3001
}
```

Save and exit with **Ctrl+X**, then **Y**, then **Enter**.

The two `Cache-Control` lines tell browsers — and any CDN you put in front of your site — how long to hold onto responses. Images served at `/coo/` are permanent once published, so they can be cached for a full year. The public API at `/pub/` can change when you publish or update photos, so those get a short 60-second cache.

Now enable and start Caddy:

```bash
sudo systemctl enable --now caddy
```

Caddy will automatically obtain an SSL certificate for your domain. Within a minute, Highcoo should be live at `https://yourdomain.com`.

---

## Step 6: Consider Adding a CDN

For a personal portfolio this step is optional, but if you expect your photos to be viewed frequently — or if your visitors are spread across different countries — putting a CDN (Content Delivery Network) in front of Highcoo is worth doing.

A CDN caches your images and API responses at servers closer to your visitors, which means faster load times and far less traffic hitting your own server. The `Cache-Control` headers you already set in Caddy are exactly what CDNs use to decide what to cache and for how long — so no extra configuration is needed on the Highcoo side.

[Cloudflare](https://cloudflare.com) is the most practical choice: it has a free tier that covers most personal use cases, and setup is mostly a matter of pointing your domain's nameservers at Cloudflare. Their dashboard walks you through it. Once that's done, your images are cached at the edge automatically.

---

## Step 7: Log In

Highcoo uses **passkeys** for authentication — the same technology behind Face ID or Windows Hello. There's no username and password to manage.

On first launch, you'll be prompted to register your passkey. Your device handles the setup. From then on, logging in is a tap or a scan.

---

## First Steps After Install

### Upload your photos

Head to the upload section and drag in your files. Highcoo automatically skips duplicates — if you upload the same photo twice, it won't create a second copy. For large collections, upload in batches; processing happens in the background.

### Create tags

Tags are how Highcoo organizes everything. Rather than sorting photos into folders, you apply tags — and a single photo can have as many as you want. A tag can represent anything: a location, a subject, a client, a shoot date, whether rights have been cleared, whether something is ready to publish. Each tag can have a color assigned, which makes scanning a large library much faster.

Start simple: create a tag for the set you just uploaded, then select all the photos in the grid and apply it in bulk.

### Browse and select

The main grid is where you'll spend most of your time. Arrow keys move between photos, **Space** selects one, **Ctrl+A** grabs everything visible. Filters at the top narrow things down by tag or publish status.

With photos selected, a bulk action bar appears at the bottom. Use it to apply tags, change visibility, or move photos through the publish workflow.

### The publish workflow

Every photo has one of three states: **draft** (just imported, private), **unpublished** (organized but not live), or **published** (visible via the public API). Draft is the default when you upload. When you're happy with a selection, mark it as published and it'll appear on your website.

This staging process means you can import and organize freely without anything going live by accident.

---

## Connecting Your Website

Once photos are published, Highcoo's public API makes them available for any website to display — no authentication needed. The main endpoints:

- `GET /pub/tags` — all published tags
- `GET /pub/media` — all published photos
- `GET /pub/media/[slug]` — a single photo's metadata

To display an image at a specific size:

```
https://yourdomain.com/coo/[slug]/w/[width]
```

Common widths: `480` for thumbnails, `1080` for cards, `2048` for full-size. Any width up to 4096 works — Highcoo resizes on the fly. All list endpoints support `?cursor=` and `?limit=` for pagination.

---

## What's Next

Explore the live demo at [demo.highcoo.studio](https://demo.highcoo.studio) to get a feel for the interface before diving in — it's a real instance with sample photos.

Full documentation is at [docs.highcoo.studio](https://docs.highcoo.studio).

If something breaks or a step in this guide is unclear, [open an issue on GitHub](https://github.com/CordlessWool/highcoo/issues). Highcoo is early-stage and actively developed, and honest feedback directly shapes what gets fixed and built next.

Your photos deserve to be seen.

---

## Quick Reference

Everything you need in one place.

### Install & start

```bash
# Install dependencies
sudo dnf install -y git podman podman-compose caddy

# Get Highcoo
git clone https://github.com/CordlessWool/highcoo.git
cd highcoo
cp .env.example .env

# Edit .env — set RP_ID and ORIGIN to your domain
nano .env

# Start Highcoo
podman-compose --profile prod up -d

# Configure Caddy
sudo nano /etc/caddy/Caddyfile
sudo systemctl enable --now caddy
```

### Caddyfile

```
yourdomain.com {
    @images path /coo/*
    header @images Cache-Control "public, max-age=31536000, immutable"

    @public_api path /pub/*
    header @public_api Cache-Control "public, max-age=60"

    reverse_proxy localhost:3001
}
```

### Environment variables

| Variable          | Default     | Description                                                                                                                                                                         |
| ----------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`    | _(none)_    | Connection string for the PostgreSQL database. The Docker setup manages the database for you — only change this if you're connecting to an external database.                       |
| `UPLOAD_PATH`     | `./uploads` | Where uploaded photos are stored on disk. Change this to a path with plenty of space if needed, and make sure it's included as a Docker volume so files survive container restarts. |
| `BODY_SIZE_LIMIT` | _(none)_    | Maximum upload size per request. Leave unset for no limit, or set a value like `100mb` to cap it.                                                                                   |
| `RP_ID`           | _(none)_    | Your domain name, without `https://`. Required for passkey authentication. Example: `yourdomain.com`.                                                                               |
| `ORIGIN`          | _(none)_    | The full URL your instance is served from. Required for passkey authentication. Example: `https://yourdomain.com`.                                                                  |

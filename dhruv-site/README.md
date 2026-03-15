# Dhruv Bhatia — Personal Website

A modern, AI-inspired personal website built with Next.js 14, TailwindCSS, and Framer Motion.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Animations**: Framer Motion + CSS animations
- **Fonts**: Syne (display) + DM Mono (mono) + Inter (body)
- **Deployment**: Vercel (zero config)

## Project Structure

```
dhruv-site/
├── app/
│   ├── layout.tsx          # Root layout with SEO metadata
│   ├── page.tsx            # Main page — assembles all sections
│   └── globals.css         # Design tokens, animations, utilities
├── components/
│   ├── ui/
│   │   ├── Nav.tsx         # Fixed navigation with scroll detection
│   │   └── Footer.tsx      # Simple footer
│   └── sections/
│       ├── Hero.tsx        # Hero with live canvas network animation
│       ├── About.tsx       # Philosophy + career timeline
│       ├── Work.tsx        # Tabbed project showcase
│       ├── GenieDemo.tsx   # Interactive AI analytics chat demo
│       ├── Ideas.tsx       # Blog/ideas preview cards
│       ├── Stack.tsx       # Layered tech stack + skills
│       └── Contact.tsx     # CTA + contact info
├── public/                 # Static assets
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone or copy the project
cd dhruv-site

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build for Production

```bash
npm run build
npm start
```

## Deploying to Vercel

### Option 1: Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option 2: GitHub + Vercel Dashboard

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import the repo
4. Vercel auto-detects Next.js — click **Deploy**

No environment variables required for the base site.

## Customization

### Update personal info
- **Name/role/tagline**: `components/sections/Hero.tsx`
- **About text**: `components/sections/About.tsx`
- **Career timeline**: `components/sections/About.tsx` → `timeline` array
- **Projects**: `components/sections/Work.tsx` → `projects` array
- **Ideas/blog posts**: `components/sections/Ideas.tsx` → `ideas` array
- **Stack tools**: `components/sections/Stack.tsx` → `stackLayers` array
- **Contact email**: `components/sections/Contact.tsx`

### Colors & Design Tokens
All design tokens live in `app/globals.css` under `:root`:

```css
:root {
  --background: 220 13% 5%;     /* dark bg */
  --accent: 195 100% 50%;       /* cyan accent */
  ...
}
```

### Adding Blog Posts
The Ideas section is designed to connect to a CMS or markdown files. To add full blog capability:

1. Create `app/blog/page.tsx` for the blog index
2. Create `app/blog/[slug]/page.tsx` for individual posts
3. Use `lib/posts.ts` to read from markdown files in `/posts` directory
4. Use `next-mdx-remote` for MDX support

## SEO

SEO metadata is configured in `app/layout.tsx`. Update:
- `title`
- `description`
- `keywords`
- `openGraph` image (add a `/public/og-image.png`)

## Design System

The site uses a custom dark design system inspired by Vercel/Linear:

- **Background**: Near-black `#0d0f13`
- **Accent**: Cyan `#00d4ff`
- **Secondary**: Indigo `#818cf8`, Emerald `#34d399`, Amber `#f59e0b`
- **Display Font**: Syne (geometric, modern)
- **Mono Font**: DM Mono (clean, technical)
- **Body Font**: Inter (readable, neutral)

## Interactive Features

- **Canvas Network Animation**: Live WebGL-style node graph in the hero
- **Genie Chat Demo**: Simulated AI analytics assistant with canned responses
- **Scroll Animations**: IntersectionObserver-based fade-in for all sections
- **Project Tabs**: Interactive project switcher in the Work section

// lib/posts.ts
// Placeholder for blog/ideas post management
// Connect to markdown files, Notion, or a headless CMS

export type Post = {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  content?: string
}

// Hardcoded posts for now — replace with file system reads or CMS fetch
export const posts: Post[] = [
  {
    slug: 'dashboard-is-dead',
    title: 'The Dashboard is Dead. Long Live the Conversation.',
    date: '2025-03-01',
    excerpt:
      'Static dashboards are artifacts of a world where data was hard to access. In a world with LLMs, the interface is a question.',
    tags: ['AI Analytics', 'Future of BI'],
  },
  {
    slug: 'analytics-teams-wrong-things',
    title: 'Why Most Analytics Teams Are Building the Wrong Things',
    date: '2025-02-10',
    excerpt:
      'Teams obsess over beautiful visualizations and miss the point. Analytics value is in the decision it enables, not the dashboard it produces.',
    tags: ['Decision Intelligence', 'Analytics Strategy'],
  },
  {
    slug: 'prompt-engineering-is-analytics',
    title: 'Prompt Engineering is Analytics Engineering',
    date: '2025-01-20',
    excerpt:
      'The skills that make a great data analyst are exactly the skills that make a great prompt engineer.',
    tags: ['AI', 'Analytics Engineering'],
  },
  {
    slug: 'building-trusted-datasets',
    title: 'On Building Trusted Datasets',
    date: '2024-12-15',
    excerpt:
      "If the underlying data isn't trusted, your AI is just a confident liar. Data trust is the foundation everything else sits on.",
    tags: ['Data Quality', 'Data Modeling'],
  },
]

export function getAllPosts(): Post[] {
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug)
}

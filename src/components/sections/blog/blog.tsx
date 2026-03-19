import Link from "next/link"
import Image from "next/image"

interface Tag {
  slug: string
  name: string
}

interface Author {
  name: string
  avatar: string
  slug: string
}

interface Post {
  id: number
  slug: string
  title: string
  excerpt: string
  coverImage: string
  coverImageAlt: string
  publishedAt: string
  readingTime: number
  category: { name: string; slug: string }
  tags: Tag[]
  author: Author
  views: number
}

const POSTS: Post[] = [
  {
    id: 1,
    slug: "nextjs-14-app-router-complete-guide",
    title: "Next.js 14 App Router: The Complete Production Guide",
    excerpt:
      "Everything you need to ship a production Next.js 14 app — PPR, Server Actions, caching strategies, and deployment.",
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
    coverImageAlt: "Next.js code",
    publishedAt: "2024-03-10",
    readingTime: 14,
    category: { name: "Next.js", slug: "nextjs" },
    tags: [
      { slug: "nextjs", name: "Next.js" },
      { slug: "react", name: "React" },
    ],
    author: {
      name: "Alex Chen",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80",
      slug: "alex-chen",
    },
    views: 12400,
  },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatViews(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

function HeroPost({ post }: { post: Post }) {
  return (
    <article className="grid lg:grid-cols-2 gap-12 items-center border-b border-zinc-800 pb-16">

      <Link href={`/blog/${post.slug}`} className="relative block overflow-hidden rounded-2xl">
        {/* <Image
          src={post.coverImage}
          alt={post.coverImageAlt}
          width={900}
          height={600}
          className="w-full h-[420px] object-cover hover:scale-105 transition duration-500"
        /> */}
      </Link>

      <div className="space-y-6">

        <Link
          href={`/blog?category=${post.category.slug}`}
          className="text-sm text-cyan-400 uppercase tracking-widest"
        >
          {post.category.name}
        </Link>

        <h1 className="text-4xl font-bold leading-tight hover:text-cyan-400 transition">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h1>

        <p className="text-zinc-400 text-lg leading-relaxed">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between text-sm text-zinc-400">

          <div className="flex items-center gap-3">
            {/* <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={36}
              height={36}
              className="rounded-full"
            /> */}
            <span>{post.author.name}</span>
          </div>

          <div className="flex gap-3">
            <span>{post.readingTime} min read</span>
            <span>•</span>
            <span>{formatViews(post.views)} views</span>
            <span>•</span>
            <time>{formatDate(post.publishedAt)}</time>
          </div>
        </div>
      </div>
    </article>
  )
}

function PostCard({ post }: { post: Post }) {
  return (
    <article className="group flex gap-6 border-b border-zinc-800 py-8 hover:bg-zinc-900/40 transition">

      <Link
        href={`/blog/${post.slug}`}
        className="w-40 h-28 shrink-0 overflow-hidden rounded-lg"
      >
        {/* <Image
          src={post.coverImage}
          alt={post.coverImageAlt}
          width={300}
          height={200}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        /> */}
      </Link>

      <div className="flex flex-col gap-3 flex-1">

        <div className="flex items-center gap-3 text-xs text-zinc-400">

          <Link
            // href={`/blog?category=${post.category.slug}`}
            href={'/'}
            className="text-cyan-400 uppercase"
          >
            {post.category.name}
          </Link>

          <span>•</span>

          <span>{post.readingTime} min read</span>
        </div>

        <h3 className="text-xl font-semibold leading-snug group-hover:text-cyan-400 transition">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>

        <p className="text-zinc-400 text-sm line-clamp-2">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between text-xs text-zinc-500 pt-2">

          <div className="flex items-center gap-2">
            {/* <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={24}
              height={24}
              className="rounded-full"
            /> */}
            <span>{post.author.name}</span>
          </div>

          <div className="flex gap-2">
            <time>{formatDate(post.publishedAt)}</time>
            <span>•</span>
            <span>{formatViews(post.views)}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

interface PageProps {
  searchParams?: { category?: string; tag?: string; search?: string }
}

export default function BlogPage({ searchParams = {} }: PageProps) {
  const activeCategory = searchParams.category ?? ""
  const searchQuery = searchParams.search ?? ""

  const filtered = POSTS.filter((p) => {
    if (activeCategory && p.category.slug !== activeCategory) return false

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q)
      )
    }

    return true
  })

  const [hero, ...rest] = filtered

  return (
    <div className="min-h-screen bg-black text-white">

      <main className="max-w-5xl mx-auto px-6 py-16">

        {hero && <HeroPost post={hero} />}

        <div className="mt-12">

          {rest.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

        </div>

      </main>
    </div>
  )
}
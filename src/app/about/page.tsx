import Link from "next/link";
import { getSiteSettings } from "@/app/actions/setting-actions";
import { ArrowLeft, Sparkles, Compass, ShieldCheck, Cpu, Terminal, Users, Award } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `About Us — ${settings.siteName}`,
    description: settings.siteAbout,
  };
}

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const teamMembers = [
    {
      name: "Marcus Wan",
      role: "Editor-in-Chief & Principal Systems Architect",
      username: "admin",
      bio: "12+ years designing distributed backend clusters and high-throughput databases. Obsessed with typographical rhythm and zero-latency pipelines.",
      initial: "M",
    },
    {
      name: "Alex Dev",
      role: "Lead Full-Stack Engineer",
      username: "alex_dev",
      bio: "TypeScript purist and Next.js specialist. Dedicated to sub-millisecond edge hydration, Prisma ORM patterns, and strict typing.",
      initial: "A",
    },
    {
      name: "Elena Rostova",
      role: "Director of Digital Design",
      username: "elena_design",
      bio: "Pioneering high-density monochrome UI aesthetics, Swiss grid systems, and distraction-free editorial layouts for software publications.",
      initial: "E",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-12 font-sans">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to dispatches</span>
      </Link>

      {/* Hero Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
          <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
          <span>EDITORIAL MANIFESTO & ORIGINS</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
          About {settings.siteName}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed max-w-2xl">
          {settings.siteAbout}
        </p>
      </header>

      {/* 1. Brand Mission */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          <Compass className="w-4 h-4 text-black dark:text-white" />
          <span>Section 01 // Brand Mission</span>
        </div>
        <h2 className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
          Clarity Over Noise. Rigor Over Hype.
        </h2>
        <div className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-4">
          <p>
            In an era where tech media is saturated with speculative clickbait, synthetic listicles, and visually jarring gradients, WanBlog exists as an oasis of quiet authority. Our mission is to restore dignity and depth to technical reading.
          </p>
          <p>
            We reject distracting promotional popups, auto-playing video overlays, and manipulative dark patterns. Every article published under the WanBlog masthead is designed to be read deeply, dissected intellectually, and implemented in real-world production systems.
          </p>
        </div>
      </section>

      {/* 2. Our Story */}
      <section className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          <Terminal className="w-4 h-4 text-black dark:text-white" />
          <span>Section 02 // Our Story</span>
        </div>
        <h2 className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
          From an Engineering Lab to an Open Publication
        </h2>
        <div className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-4">
          <p>
            WanBlog began in late 2024 as an internal memo series between three systems engineers and a product designer frustrated with mainstream technical documentation. We were tired of reading articles that skimmed the surface of distributed databases or treated interface design as an afterthought.
          </p>
          <p>
            We set out to build an engine that honored both form and function: powered by the speed of Next.js 15, the structural reliability of Prisma ORM and local SQL, and governed by a strict black-and-white visual identity inspired by mid-century Swiss typography and high-end print monographs.
          </p>
        </div>
      </section>

      {/* 3. Editorial Values */}
      <section className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          <ShieldCheck className="w-4 h-4 text-black dark:text-white" />
          <span>Section 03 // Editorial Values</span>
        </div>
        <h2 className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
          What Guides Our Dispatches
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-2">
            <Cpu className="w-6 h-6 text-zinc-900 dark:text-zinc-100 mb-2" />
            <h3 className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
              01. Benchmark Grounding
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We test claims against verifiable execution metrics. When we praise an edge caching strategy or SQL indexing pattern, it is verified against real database latency numbers.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-2">
            <Award className="w-6 h-6 text-zinc-900 dark:text-zinc-100 mb-2" />
            <h3 className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
              02. Typographical Respect
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Reading is cognitive work. We maintain 65-character line lengths, proportional vertical rhythm, and pure contrast to keep eye fatigue at absolute zero.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-2">
            <ShieldCheck className="w-6 h-6 text-zinc-900 dark:text-zinc-100 mb-2" />
            <h3 className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
              03. Reader Sovereignty
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              No tracking cookies. No third-party data brokerage. Readers interact with our publication anonymously or as identified contributors with zero surveillance.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Team Overview */}
      <section className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          <Users className="w-4 h-4 text-black dark:text-white" />
          <span>Section 04 // Team Overview</span>
        </div>
        <h2 className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
          The Masthead
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.username}
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono font-bold flex items-center justify-center text-sm">
                  {member.initial}
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {member.name}
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-500">
                    @{member.username}
                  </p>
                </div>
              </div>
              <p className="text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200 pt-1">
                {member.role}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

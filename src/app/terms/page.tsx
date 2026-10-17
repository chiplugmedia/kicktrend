import Link from "next/link";
import { ArrowLeft, Scale, FileText, AlertTriangle, Copyright, Link2, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — WANBLOG",
  description: "Terms and conditions of using the WanBlog publication engine, commenting guidelines, and intellectual property terms.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10 font-sans">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to dispatches</span>
      </Link>

      <header className="border-b border-zinc-200 dark:border-zinc-800 pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
          <Scale className="w-3.5 h-3.5 text-black dark:text-white" />
          <span>EDITORIAL AGREEMENT & PLATFORM CODE</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
          Terms of Use
        </h1>
        <p className="text-sm font-mono text-zinc-500">
          Last Updated: October 2026 • Governing Rules for Readers & Contributors
        </p>
      </header>

      <div className="prose-reading space-y-8 text-zinc-800 dark:text-zinc-200 text-base leading-relaxed">
        <p>
          Welcome to <strong>WanBlog</strong>. By accessing our dispatches, registering an account, or interacting with discussion threads, you agree to abide by these terms of use. Please read them carefully.
        </p>

        {/* 1. Acceptable Use */}
        <section className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>1. Acceptable Use</span>
          </h2>
          <p>
            You agree to use WanBlog strictly for lawful, educational, and professional technical purposes. You must not:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li>Attempt to bypass authentication barriers or tamper with the administrative console.</li>
            <li>Deploy automated scrapers, denial-of-service stress tests, or malicious payloads against our APIs.</li>
            <li>Impersonate editorial authors, masthead members, or other registered users.</li>
          </ul>
        </section>

        {/* 2. Comment & Community Guidelines */}
        <section className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>2. Comment & Community Guidelines</span>
          </h2>
          <p>
            WanBlog fosters high-caliber engineering discussion. Comments containing ad hominem attacks, harassment, commercial spam, affiliate link drops, or harmful code exploits will be pruned without notice. Repeat violations will result in permanent username bans.
          </p>
        </section>

        {/* 3. Copyright & Intellectual Property */}
        <section className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Copyright className="w-4 h-4" />
            <span>3. Copyright & Intellectual Property</span>
          </h2>
          <p>
            All original editorial essays, architectural analyses, diagrams, and custom graphics published on WanBlog are protected by copyright. Code snippets embedded within technical dispatches are licensed under the MIT License unless explicitly designated otherwise. You may freely use the code snippets in your personal or commercial applications with attribution.
          </p>
        </section>

        {/* 4. External Links & Media Embeds */}
        <section className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            <span>4. External Links & Media Embeds</span>
          </h2>
          <p>
            Our dispatches may contain embedded videos (YouTube, Vimeo) or links to external open-source repositories and documentation. WanBlog has no editorial control over third-party domains and assumes no responsibility for external content or practices.
          </p>
        </section>

        {/* 5. Limitation of Liability & No Warranties */}
        <section className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>5. Limitation of Liability & No Warranties</span>
          </h2>
          <p>
            All editorial and architectural guidance on WanBlog is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis for educational purposes. We make no representations or warranties regarding system fitness for your specific infrastructure. Authors and publishers shall not be liable for any database disruptions, data losses, or operational downtime arising from the application of concepts discussed herein.
          </p>
        </section>
      </div>
    </div>
  );
}

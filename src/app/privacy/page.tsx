import Link from "next/link";
import { ArrowLeft, Shield, Lock, EyeOff, Database, UserCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — WANBLOG",
  description: "Comprehensive privacy policy, cookie practices, and user data rights for WanBlog readers and contributors.",
};

export default function PrivacyPage() {
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
          <Shield className="w-3.5 h-3.5 text-black dark:text-white" />
          <span>LEGAL STANDARDS & DATA SOVEREIGNTY</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
          Privacy Policy
        </h1>
        <p className="text-sm font-mono text-zinc-500">
          Effective Date: October 2026 • Version 2.0 • Applicable Worldwide
        </p>
      </header>

      <div className="prose-reading space-y-8 text-zinc-800 dark:text-zinc-200 text-base leading-relaxed">
        <p>
          At <strong>WanBlog</strong>, privacy is not treated as a legal compromise—it is engineered into our core architecture. We do not sell user data, track you across the web with cross-domain pixels, or monetize your digital footprint. This document describes precisely what data we process, why we process it, and how your rights are protected.
        </p>

        {/* 1. Information Collection */}
        <section className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span>1. Information Collection</span>
          </h2>
          <p>
            We strictly limit data collection to the minimum required to operate an authentic, interactive technical publication:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li>
              <strong>Account Credentials:</strong> If you register to participate in discussions, we collect your self-selected <code>username</code>, a verified email address, and an irreversibly salted cryptographic hash of your password generated via bcrypt. We never store raw passwords.
            </li>
            <li>
              <strong>User Contributions:</strong> Comments, article likes, and editorial posts that you explicitly publish to the platform.
            </li>
            <li>
              <strong>Technical Communication:</strong> Records of inquiries submitted via our contact desk.
            </li>
          </ul>
        </section>

        {/* 2. Cookies & Local Storage */}
        <section className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>2. Cookies & Local Storage</span>
          </h2>
          <p>
            WanBlog uses only first-party cookies necessary for site function:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li>
              <strong>Authentication Session Cookie:</strong> An HTTP-only, secure JWT token used exclusively to verify logged-in readers and maintain active admin sessions.
            </li>
            <li>
              <strong>Interface Preferences:</strong> Local storage is used locally on your device to persist your preference between Light Mode and Dark Mode.
            </li>
            <li>
              <strong>No Third-Party Tracker Cookies:</strong> We do not load Facebook Pixels, marketing beacons, or cross-site tracking scripts.
            </li>
          </ul>
        </section>

        {/* 3. User Data Protection & Retention */}
        <section className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>3. User Data Protection & Retention</span>
          </h2>
          <p>
            Data is stored securely within our local MySQL infrastructure managed through Prisma ORM. Access is restricted to authenticated server environments. We retain user account information for as long as your account remains active. If an account is deleted, all associated private identifiers are permanently wiped from the database.
          </p>
        </section>

        {/* 4. Analytics & Telemetry */}
        <section className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <EyeOff className="w-4 h-4" />
            <span>4. Analytics & Telemetry</span>
          </h2>
          <p>
            Our site visit telemetry is intentionally non-invasive. We increment simple integer counters for total site visits and article reads within our internal database. We do not fingerprint hardware, capture IP addresses, log geolocation coordinates, or build behavioral user dossiers.
          </p>
        </section>

        {/* 5. User Data Rights (GDPR & CCPA) */}
        <section className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            <span>5. User Data Rights</span>
          </h2>
          <p>
            Regardless of where you reside, you have full sovereignty over your data:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li><strong>Right to Access:</strong> You may request an export of all information linked to your username.</li>
            <li><strong>Right to Rectification:</strong> You may update your profile details and preferences at any time.</li>
            <li><strong>Right to Erasure (The Right to be Forgotten):</strong> You may request the permanent deletion of your account and comments by contacting <code>editorial@wanblog.internal</code>.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

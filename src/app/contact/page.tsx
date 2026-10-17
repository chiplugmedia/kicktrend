import Link from "next/link";
import { ArrowLeft, Mail, Clock, MessageSquare, MapPin } from "lucide-react";
import { ContactFormClient } from "./ContactFormClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — WANBLOG",
  description: "Get in touch with the WanBlog editorial, engineering, and syndication desks.",
};

export default function ContactPage() {
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
        <h1 className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
          Contact Editorial & Support
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Have an inquiry, article submission, technical correction, or partnership proposal? Reach our desk directly.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Contact Form */}
        <div className="lg:col-span-7">
          <ContactFormClient />
        </div>

        {/* Right Column: Direct Channels & Desk Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-6 space-y-5">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Direct Desks
            </h2>

            <div className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-zinc-400">Editorial & Submissions:</span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <span>editorial@wanblog.internal</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-400">Technical Corrections & Bug Bounty:</span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <span>engineering@wanblog.internal</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-400">Syndication & Press Inquiries:</span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <span>press@wanblog.internal</span>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-xs font-mono text-zinc-500">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Response window: Within 24-48 business hours</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>Headquarters: Distributed Engineering Collective</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

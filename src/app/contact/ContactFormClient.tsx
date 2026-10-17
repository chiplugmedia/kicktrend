"use client";

import * as React from "react";
import { submitContactFormAction } from "@/app/actions/contact-action";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function ContactFormClient() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await submitContactFormAction({ name, email, subject, message });
      if (res.success) {
        setFeedback({
          type: "success",
          text: res.message || "Message dispatched successfully.",
        });
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Failed to transmit message.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        text: "Network error occurred while sending message.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-xs space-y-6">
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-mono flex items-center gap-2.5 ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Your Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Morgan"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-sans focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-black"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@domain.com"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-sans focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Subject *
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Article Submission / Technical Inquiry"
            className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-sans focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-black"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Message *
          </label>
          <textarea
            rows={5}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your detailed inquiry, collaboration pitch, or feedback..."
            className="w-full p-3.5 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-sans focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-black resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Transmitting...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

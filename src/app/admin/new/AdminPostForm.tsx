"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createPostAction, updatePostAction } from "@/app/actions/post-actions";
import { VideoEmbed } from "@/components/VideoEmbed";
import { TiptapEditor } from "@/components/TiptapEditor";
import { ArticleContentRenderer } from "@/components/ArticleContentRenderer";
import { formatCoverImageUrl, extractCoverImageFilename } from "@/lib/imageHelper";
import {
  Send,
  Save,
  Eye,
  FileText,
  Image as ImageIcon,
  Video,
  Upload,
  Link as LinkIcon,
  Tag,
  Hash,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export interface InitialPostData {
  id?: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage?: string | null;
  videoUrl?: string | null;
  category: string;
  tags: string;
  hashtags: string;
  published?: boolean;
}

interface AdminPostFormProps {
  authorUsername: string;
  categories?: { id: number; name: string; slug: string }[];
  initialPost?: InitialPostData;
  isEditMode?: boolean;
  isAuthorMode?: boolean;
}

export function AdminPostForm({
  authorUsername,
  categories = [],
  initialPost,
  isEditMode = false,
  isAuthorMode = false,
}: AdminPostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [showPreview, setShowPreview] = React.useState(false);

  // Form State
  const [title, setTitle] = React.useState(initialPost?.title || "");
  const [slug, setSlug] = React.useState(initialPost?.slug || "");
  const [summary, setSummary] = React.useState(initialPost?.summary || "");
  const [content, setContent] = React.useState(initialPost?.content || "");
  const [coverImage, setCoverImage] = React.useState(initialPost?.coverImage || "");
  const [videoUrl, setVideoUrl] = React.useState(initialPost?.videoUrl || "");
  const [category, setCategory] = React.useState(
    initialPost?.category || (categories.length > 0 ? categories[0].name : "Engineering")
  );
  const [tags, setTags] = React.useState(initialPost?.tags || "");
  const [hashtags, setHashtags] = React.useState(initialPost?.hashtags || "");
  const [published, setPublished] = React.useState(initialPost?.published ?? true);

  // Video Mode: "embed" vs "upload"
  const [videoMode, setVideoMode] = React.useState<"embed" | "upload">("embed");
  const [isVideoUploading, setIsVideoUploading] = React.useState(false);
  const [videoUploadSuccess, setVideoUploadSuccess] = React.useState<string | null>(null);

  // Cover Image Mode: "url" vs "upload"
  const [imageMode, setImageMode] = React.useState<"url" | "upload">("url");
  const [isImageUploading, setIsImageUploading] = React.useState(false);
  const [imageUploadSuccess, setImageUploadSuccess] = React.useState<string | null>(null);

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVideoUploading(true);
    setErrorMsg(null);
    setVideoUploadSuccess(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setVideoUrl(data.url);
        setVideoUploadSuccess(`Video uploaded: ${data.url}`);
      } else {
        setErrorMsg(data.error || "Failed to upload video file.");
      }
    } catch {
      setErrorMsg("Error uploading video file to server.");
    } finally {
      setIsVideoUploading(false);
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageUploading(true);
    setErrorMsg(null);
    setImageUploadSuccess(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Save the renamed filename (e.g. "ybsbhjd.png") into state for database storage
        const storedFilename = data.filename || data.url;
        setCoverImage(storedFilename);
        setImageUploadSuccess(
          `Image uploaded! Renamed to: ${storedFilename} (Displayed as: ${data.url || formatCoverImageUrl(storedFilename)})`
        );
      } else {
        setErrorMsg(data.error || "Failed to upload image file.");
      }
    } catch {
      setErrorMsg("Error uploading image file to server.");
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim() || !summary.trim() || !content.trim()) {
      setErrorMsg("Title, summary, and content are required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && initialPost?.id) {
        const res = await updatePostAction(initialPost.id, {
          title,
          slug: slug.trim() || undefined,
          summary,
          content,
          coverImage: coverImage.trim() || undefined,
          videoUrl: videoUrl.trim() || undefined,
          category,
          tags,
          hashtags,
          published: isAuthorMode ? false : published,
        });

        if (!res.success || !res.post) {
          setErrorMsg(res.error || "Failed to update article");
        } else {
          setSuccessMsg(res.message || (isAuthorMode ? "Article resubmitted for review!" : "Article updated successfully!"));
          if (isAuthorMode) {
            router.push("/author");
          } else {
            router.push(`/posts/${res.post.slug}`);
          }
          router.refresh();
        }
      } else {
        const res = await createPostAction({
          title,
          slug: slug.trim() || undefined,
          summary,
          content,
          coverImage: coverImage.trim() || undefined,
          videoUrl: videoUrl.trim() || undefined,
          category,
          tags,
          hashtags,
          published: isAuthorMode ? false : true,
        });

        if (!res.success || !res.post) {
          setErrorMsg(res.error || "Failed to create post");
        } else {
          setSuccessMsg(res.message || (isAuthorMode ? "Article submitted for review!" : "Post published successfully!"));
          if (isAuthorMode) {
            router.push("/author");
          } else {
            router.push(`/posts/${res.post.slug}`);
          }
          router.refresh();
        }
      }
    } catch {
      setErrorMsg("An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Tab toggle: Editor vs Preview */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors ${
              !showPreview
                ? "bg-black dark:bg-white text-white dark:text-black"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors ${
              showPreview
                ? "bg-black dark:bg-white text-white dark:text-black"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
        </div>

        <span className="text-xs font-mono text-zinc-500">
          Author: <strong className="text-black dark:text-white">@{authorUsername}</strong>
        </span>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-red-500/40 text-red-600 dark:text-red-400 text-xs font-mono">
          {errorMsg}
        </div>
      )}

      {showPreview ? (
        <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
              {category}
            </span>
            <h2 className="text-3xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
              {title || "Untitled Dispatch"}
            </h2>
            <div
              className="text-zinc-600 dark:text-zinc-400 mt-2 text-base"
              dangerouslySetInnerHTML={{ __html: summary || "No summary provided." }}
            />
          </div>

          {/* Featured Cover Image */}
          {coverImage && (
            <div className="relative aspect-16/9 w-full rounded-lg overflow-hidden my-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <img
                src={formatCoverImageUrl(coverImage) || ""}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Featured Video Embed */}
          {videoUrl && (
            <div className="my-4">
              <VideoEmbed url={videoUrl} title={title} />
            </div>
          )}

          <div className="my-6">
            <ArticleContentRenderer content={content || "<p>No body content written yet.</p>"} />
          </div>

          <div className="text-xs font-mono text-zinc-500 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            Hashtags: {hashtags || "None"} | Tags: {tags || "None"}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Post Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architecting Zero-Latency Edge Functions"
              className="w-full px-3.5 py-2.5 text-base rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-black"
            />
          </div>

          {/* Slug & Dynamic Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Custom Slug (Optional)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="zero-latency-edge-functions"
                className="w-full px-3 py-2 text-sm rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Architecture">Architecture</option>
                    <option value="AI">AI</option>
                    <option value="Philosophy">Philosophy</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Rich Description / Summary */}
          <div>
            <label className="block text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Summary / Short Description * (Tiptap Rich Text)
            </label>
            <TiptapEditor
              mode="summary"
              value={summary}
              onChange={setSummary}
              placeholder="A brief 1-2 sentence synopsis..."
            />
          </div>

          {/* Featured Cover Image (URL vs Upload) */}
          <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Featured Cover Image</span>
              </label>

              <div className="flex items-center gap-1 p-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setImageMode("url")}
                  className={`px-2 py-0.5 rounded ${
                    imageMode === "url"
                      ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                      : "text-zinc-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("upload")}
                  className={`px-2 py-0.5 rounded ${
                    imageMode === "upload"
                      ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                      : "text-zinc-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            {imageMode === "url" ? (
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            ) : (
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 p-3 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                    {isImageUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading image...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Select image file to upload (PNG, JPG, WebP)</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                    disabled={isImageUploading}
                  />
                </label>
              </div>
            )}

            {coverImage && (
              <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="relative w-20 h-12 rounded overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <img
                      src={formatCoverImageUrl(coverImage) || ""}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Featured Cover Active</span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 mt-1 space-y-0.5">
                      <div className="truncate">
                        <span className="text-zinc-400">Displayed as: </span>
                        <code className="text-black dark:text-white font-semibold">
                          {formatCoverImageUrl(coverImage)}
                        </code>
                      </div>
                      <div className="truncate">
                        <span className="text-zinc-400">Stored in database as: </span>
                        <code className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {extractCoverImageFilename(coverImage)}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="px-2.5 py-1.5 rounded text-xs font-mono text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 border border-transparent hover:border-red-200 dark:hover:border-red-900 transition-colors shrink-0"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Dual Video Support: Embedded URL vs File Upload */}
          <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                <Video className="w-3.5 h-3.5" />
                <span>Dual Video Support</span>
              </label>

              <div className="flex items-center gap-1 p-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setVideoMode("embed")}
                  className={`px-2 py-0.5 rounded ${
                    videoMode === "embed"
                      ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                      : "text-zinc-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  Embed URL
                </button>
                <button
                  type="button"
                  onClick={() => setVideoMode("upload")}
                  className={`px-2 py-0.5 rounded ${
                    videoMode === "upload"
                      ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                      : "text-zinc-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  Upload Video File
                </button>
              </div>
            </div>

            {videoMode === "embed" ? (
              <div className="space-y-1">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                  className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
                <p className="text-[11px] font-mono text-zinc-500">
                  Supports YouTube, Vimeo, or direct public video streams.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block cursor-pointer">
                  <div className="flex items-center justify-center gap-2 p-3 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                    {isVideoUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading video file to server...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Select video file (.mp4, .webm, .mov, .ogg)</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileUpload}
                    className="hidden"
                    disabled={isVideoUploading}
                  />
                </label>
                <p className="text-[11px] font-mono text-zinc-500">
                  Directly saved to server storage and rendered with native HTML5 video player.
                </p>
              </div>
            )}

            {videoUrl && (
              <div className="text-[11px] font-mono text-zinc-500 truncate flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Active Video URL: {videoUrl}</span>
              </div>
            )}
          </div>

          {/* Tags & Hashtags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Tags (comma-separated)</span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="nextjs, prisma, performance"
                className="w-full px-3 py-2 text-sm rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                <Hash className="w-3.5 h-3.5" />
                <span>Hashtags</span>
              </label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#technology #design #code"
                className="w-full px-3 py-2 text-sm rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          {/* Content Body */}
          <div>
            <label className="block text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Full Content Body * (Tiptap Rich Text Editor)
            </label>
            <TiptapEditor
              mode="content"
              value={content}
              onChange={setContent}
              placeholder="Write your rich article body with headings, code blocks, and media..."
            />
          </div>

          {/* Published Status & Submit Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            {isAuthorMode ? (
              <div className="flex items-center gap-2 text-xs font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>
                  <strong>Editorial Review:</strong> This article will be submitted to administrators for review before going live.
                </span>
              </div>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-mono text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:ring-0"
                />
                <span className="font-semibold">Published & Publicly Visible</span>
              </label>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isVideoUploading || isImageUploading}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-md font-mono text-sm font-semibold transition-opacity disabled:opacity-50 ${
                isAuthorMode
                  ? "bg-violet-600 hover:bg-violet-700 text-white"
                  : "bg-black dark:bg-white text-white dark:text-black hover:opacity-90"
              }`}
            >
              {isEditMode ? <Save className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              <span>
                {isSubmitting
                  ? isEditMode
                    ? isAuthorMode
                      ? "Submitting Updates..."
                      : "Saving Changes..."
                    : isAuthorMode
                    ? "Submitting for Review..."
                    : "Publishing Dispatch..."
                  : isEditMode
                  ? isAuthorMode
                    ? "Save Changes & Resubmit"
                    : "Save Changes & Update Article"
                  : isAuthorMode
                  ? "Submit Article for Review"
                  : "Publish Post"}
              </span>
            </button>
          </div>
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

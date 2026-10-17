"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { CustomHtmlEmbed } from "./tiptap/CustomHtmlEmbed";
import { EmbeddedPostCard, type EmbeddedPostCardAttrs } from "./tiptap/EmbeddedPostCard";
import { SocialEmbed, type SocialEmbedAttrs } from "./tiptap/SocialEmbed";
import { CodeSnippetEmbed, type CodeSnippetAttrs } from "./tiptap/CodeSnippetEmbed";
import { EmbedHtmlModal } from "./tiptap/EmbedHtmlModal";
import { EmbedPostModal } from "./tiptap/EmbedPostModal";
import { EmbedSocialModal } from "./tiptap/EmbedSocialModal";
import { EmbedCodeSnippetModal } from "./tiptap/EmbedCodeSnippetModal";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Minus,
  FileCode2,
  Newspaper,
  CodeXml,
  Eye,
  Share2,
  Code2,
} from "lucide-react";

// Initialize syntax highlighter with common programming languages
const lowlight = createLowlight(common);

interface TiptapEditorProps {
  mode: "summary" | "content";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TiptapEditor({
  mode,
  value,
  onChange,
  placeholder,
}: TiptapEditorProps) {
  const isContentMode = mode === "content";

  // Modals and view toggle states
  const [isHtmlModalOpen, setIsHtmlModalOpen] = React.useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = React.useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = React.useState(false);
  const [isCodeSnippetModalOpen, setIsCodeSnippetModalOpen] = React.useState(false);
  const [isRawSourceMode, setIsRawSourceMode] = React.useState(false);
  const [rawSourceValue, setRawSourceValue] = React.useState(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: isContentMode ? { levels: [2, 3] } : false,
        bulletList: isContentMode ? {} : false,
        orderedList: isContentMode ? {} : false,
        blockquote: isContentMode ? {} : false,
        codeBlock: false, // Replaced by CodeBlockLowlight
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class:
            "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 p-4 font-mono text-xs sm:text-sm overflow-x-auto my-4 shadow-inner",
        },
      }),
      CustomHtmlEmbed,
      EmbeddedPostCard,
      SocialEmbed,
      CodeSnippetEmbed,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-black dark:text-white underline font-semibold",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class:
            "rounded-xl border border-zinc-200 dark:border-zinc-800 my-4 max-h-[500px] w-auto object-cover",
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: `focus:outline-none font-sans text-zinc-900 dark:text-zinc-100 ${
          isContentMode
            ? "min-h-[300px] p-4 text-base leading-relaxed prose-reading"
            : "min-h-[90px] p-3 text-sm leading-normal"
        }`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      setRawSourceValue(html);
    },
    immediatelyRender: false,
  });

  // Sync value if changed from outside
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
      setRawSourceValue(value);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="w-full h-32 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter destination URL:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Enter public Image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleInsertHtmlEmbed = (html: string) => {
    editor.commands.insertCustomHtmlEmbed({ html });
  };

  const handleInsertSocialEmbed = (attrs: SocialEmbedAttrs) => {
    editor.commands.insertSocialEmbed(attrs);
  };

  const handleInsertCodeSnippet = (attrs: CodeSnippetAttrs) => {
    editor.commands.insertCodeSnippetEmbed(attrs);
  };

  const handleInsertEmbeddedPost = (attrs: EmbeddedPostCardAttrs) => {
    editor.commands.insertEmbeddedPostCard(attrs);
  };

  const handleRawSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setRawSourceValue(newHtml);
    onChange(newHtml);
    editor.commands.setContent(newHtml);
  };

  return (
    <div className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs focus-within:ring-1 focus-within:ring-black dark:focus-within:ring-white transition-all">
      {/* Tiptap Minimalist Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 font-mono text-xs">
        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive("bold")
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          }`}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive("italic")
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          }`}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        {/* Link */}
        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive("link")
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          }`}
          title="Insert Link"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>

        {/* Extended Tools for Content Mode */}
        {isContentMode && (
          <>
            <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

            {/* H2 */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                editor.isActive("heading", { level: 2 })
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
              title="Heading 2"
            >
              H2
            </button>

            {/* H3 */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                editor.isActive("heading", { level: 3 })
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
              title="Heading 3"
            >
              H3
            </button>

            {/* Bullet List */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1.5 rounded transition-colors ${
                editor.isActive("bulletList")
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>

            {/* Ordered List */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-1.5 rounded transition-colors ${
                editor.isActive("orderedList")
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
              title="Ordered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>

            {/* Blockquote */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-1.5 rounded transition-colors ${
                editor.isActive("blockquote")
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
              title="Blockquote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            {/* Code Block with Syntax Highlighting */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-1.5 rounded transition-colors ${
                editor.isActive("codeBlock")
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
              title="Code Block (Syntax Highlighted)"
            >
              <Code className="w-3.5 h-3.5" />
            </button>

            {/* Divider */}
            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              title="Horizontal Divider"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* Insert Image */}
            <button
              type="button"
              onClick={addImage}
              className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              title="Embed Image URL"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

            {/* Embed Social Media (X/Twitter, Instagram, Facebook, YouTube, TikTok) */}
            <button
              type="button"
              onClick={() => setIsSocialModalOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-bold bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
              title="Embed Social Media (X/Twitter, YouTube, Instagram, Facebook, TikTok)"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Embed Social</span>
            </button>

            {/* Embed Custom Code Snippet (HTML, CSS, JS live runner or code block) */}
            <button
              type="button"
              onClick={() => setIsCodeSnippetModalOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-bold bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
              title="Embed Custom Code Snippet (HTML, CSS, JavaScript, or code block)"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Code Snippet</span>
            </button>

            {/* Embed Custom HTML Node */}
            <button
              type="button"
              onClick={() => setIsHtmlModalOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-bold bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
              title="Embed Raw HTML / Custom Markup"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Raw HTML</span>
            </button>

            {/* Embed Post Card */}
            <button
              type="button"
              onClick={() => setIsPostModalOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-bold bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
              title="Embed Another Post as a Preview Card"
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Embed Post</span>
            </button>
          </>
        )}

        <div className="ml-auto flex items-center gap-1">
          {/* Toggle HTML Source / Visual Mode (for full article body) */}
          {isContentMode && (
            <button
              type="button"
              onClick={() => setIsRawSourceMode(!isRawSourceMode)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-colors ${
                isRawSourceMode
                  ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
              title="Toggle HTML Source Code View"
            >
              {isRawSourceMode ? (
                <>
                  <Eye className="w-3 h-3" />
                  <span>Visual</span>
                </>
              ) : (
                <>
                  <CodeXml className="w-3 h-3" />
                  <span>HTML View</span>
                </>
              )}
            </button>
          )}

          {/* Undo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>

          {/* Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Content Box vs Raw HTML Source View */}
      {isRawSourceMode ? (
        <div className="p-4 bg-zinc-950">
          <div className="flex items-center justify-between pb-2 text-[11px] font-mono text-zinc-400">
            <span>Direct HTML Source Editor (Live Synced with Tiptap)</span>
            <span>{rawSourceValue.length} chars</span>
          </div>
          <textarea
            rows={14}
            value={rawSourceValue}
            onChange={handleRawSourceChange}
            className="w-full bg-black text-emerald-400 font-mono text-xs p-4 rounded-xl border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-y selection:bg-zinc-800"
            spellCheck={false}
          />
        </div>
      ) : (
        <EditorContent editor={editor} />
      )}

      {/* Insert HTML Embed Modal */}
      <EmbedHtmlModal
        isOpen={isHtmlModalOpen}
        onClose={() => setIsHtmlModalOpen(false)}
        onInsert={handleInsertHtmlEmbed}
      />

      {/* Insert Social Media Embed Modal */}
      <EmbedSocialModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        onInsert={handleInsertSocialEmbed}
      />

      {/* Insert Custom Code Snippet Modal */}
      <EmbedCodeSnippetModal
        isOpen={isCodeSnippetModalOpen}
        onClose={() => setIsCodeSnippetModalOpen(false)}
        onInsert={handleInsertCodeSnippet}
      />

      {/* Insert Embedded Post Card Modal */}
      <EmbedPostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onInsert={handleInsertEmbeddedPost}
      />
    </div>
  );
}

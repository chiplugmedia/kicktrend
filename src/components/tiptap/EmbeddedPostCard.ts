import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { EmbeddedPostCardView } from "./EmbeddedPostCardView";

export interface EmbeddedPostCardAttrs {
  slug: string;
  title: string;
  summary?: string;
  coverImage?: string;
  author?: string;
  category?: string;
  date?: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    embeddedPostCard: {
      /**
       * Insert an embedded post card into the document
       */
      insertEmbeddedPostCard: (options: EmbeddedPostCardAttrs) => ReturnType;
    };
  }
}

export const EmbeddedPostCard = Node.create({
  name: "embeddedPostCard",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      slug: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-slug") || "",
      },
      title: {
        default: "",
        parseHTML: (el) => {
          const raw = el.getAttribute("data-title");
          if (!raw) return "";
          try {
            return decodeURIComponent(raw);
          } catch {
            return raw;
          }
        },
      },
      summary: {
        default: "",
        parseHTML: (el) => {
          const raw = el.getAttribute("data-summary");
          if (!raw) return "";
          try {
            return decodeURIComponent(raw);
          } catch {
            return raw;
          }
        },
      },
      coverImage: {
        default: "",
        parseHTML: (el) => {
          const raw = el.getAttribute("data-cover");
          if (!raw) return "";
          try {
            return decodeURIComponent(raw);
          } catch {
            return raw;
          }
        },
      },
      author: {
        default: "",
        parseHTML: (el) => {
          const raw = el.getAttribute("data-author");
          if (!raw) return "";
          try {
            return decodeURIComponent(raw);
          } catch {
            return raw;
          }
        },
      },
      category: {
        default: "",
        parseHTML: (el) => {
          const raw = el.getAttribute("data-category");
          if (!raw) return "";
          try {
            return decodeURIComponent(raw);
          } catch {
            return raw;
          }
        },
      },
      date: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-date") || "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="embedded-post-card"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "embedded-post-card",
        "data-slug": node.attrs.slug || "",
        "data-title": encodeURIComponent(node.attrs.title || ""),
        "data-summary": encodeURIComponent(node.attrs.summary || ""),
        "data-cover": encodeURIComponent(node.attrs.coverImage || ""),
        "data-author": encodeURIComponent(node.attrs.author || ""),
        "data-category": encodeURIComponent(node.attrs.category || ""),
        "data-date": node.attrs.date || "",
        class: "embedded-post-card-container my-6",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbeddedPostCardView);
  },

  addCommands() {
    return {
      insertEmbeddedPostCard:
        (options: EmbeddedPostCardAttrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

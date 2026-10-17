import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { SocialEmbedView } from "./SocialEmbedView";
import type { SocialPlatform } from "@/lib/socialEmbedHelper";

export interface SocialEmbedAttrs {
  url: string;
  platform: SocialPlatform;
  html: string;
  caption?: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    socialEmbed: {
      /**
       * Insert a social media embed (YouTube, X/Twitter, Instagram, Facebook, TikTok)
       */
      insertSocialEmbed: (attrs: SocialEmbedAttrs) => ReturnType;
    };
  }
}

export const SocialEmbed = Node.create({
  name: "socialEmbed",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      url: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-url") || "",
        renderHTML: (attributes) => ({ "data-url": attributes.url || "" }),
      },
      platform: {
        default: "generic",
        parseHTML: (element) =>
          (element.getAttribute("data-platform") as SocialPlatform) || "generic",
        renderHTML: (attributes) => ({ "data-platform": attributes.platform || "generic" }),
      },
      html: {
        default: "",
        parseHTML: (element) => {
          const raw = element.getAttribute("data-embed-html");
          if (raw) {
            try {
              return decodeURIComponent(raw);
            } catch {
              return raw;
            }
          }
          return element.innerHTML || "";
        },
        renderHTML: (attributes) => ({
          "data-embed-html": encodeURIComponent(attributes.html || ""),
        }),
      },
      caption: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-caption") || "",
        renderHTML: (attributes) => ({
          "data-caption": attributes.caption || "",
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="social-embed"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "social-embed",
        "data-platform": node.attrs.platform || "generic",
        "data-url": node.attrs.url || "",
        "data-embed-html": encodeURIComponent(node.attrs.html || ""),
        "data-caption": node.attrs.caption || "",
        class: "social-media-embed-container my-6",
      }),
      node.attrs.html || "",
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SocialEmbedView);
  },

  addCommands() {
    return {
      insertSocialEmbed:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },
});

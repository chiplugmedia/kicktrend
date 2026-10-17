import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { HtmlEmbedView } from "./HtmlEmbedView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customHtmlEmbed: {
      /**
       * Insert a custom HTML embed block
       */
      insertCustomHtmlEmbed: (options?: { html?: string }) => ReturnType;
    };
  }
}

export const CustomHtmlEmbed = Node.create({
  name: "customHtmlEmbed",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      html: {
        default: "",
        parseHTML: (element) => {
          const raw = element.getAttribute("data-raw-html");
          if (raw) {
            try {
              return decodeURIComponent(raw);
            } catch {
              return raw;
            }
          }
          return element.innerHTML || "";
        },
        renderHTML: (attributes) => {
          return {
            "data-type": "custom-html-embed",
            "data-raw-html": encodeURIComponent(attributes.html || ""),
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="custom-html-embed"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "custom-html-embed",
        "data-raw-html": encodeURIComponent(node.attrs.html || ""),
        class: "custom-html-embed-block my-6",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(HtmlEmbedView);
  },

  addCommands() {
    return {
      insertCustomHtmlEmbed:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              html: options.html || "",
            },
          });
        },
    };
  },
});

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CodeSnippetView } from "./CodeSnippetView";

export interface CodeSnippetAttrs {
  title?: string;
  language?: string;
  code?: string;
  html?: string;
  css?: string;
  js?: string;
  mode: "executable" | "code-block";
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    codeSnippetEmbed: {
      /**
       * Insert a custom code snippet (HTML, CSS, JS live runner or code block)
       */
      insertCodeSnippetEmbed: (attrs: CodeSnippetAttrs) => ReturnType;
    };
  }
}

export const CodeSnippetEmbed = Node.create({
  name: "codeSnippetEmbed",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      title: {
        default: "Code Snippet",
        parseHTML: (element) => element.getAttribute("data-title") || "Code Snippet",
        renderHTML: (attributes) => ({ "data-title": attributes.title || "Code Snippet" }),
      },
      language: {
        default: "javascript",
        parseHTML: (element) => element.getAttribute("data-language") || "javascript",
        renderHTML: (attributes) => ({ "data-language": attributes.language || "javascript" }),
      },
      mode: {
        default: "executable",
        parseHTML: (element) =>
          (element.getAttribute("data-mode") as "executable" | "code-block") || "executable",
        renderHTML: (attributes) => ({ "data-mode": attributes.mode || "executable" }),
      },
      code: {
        default: "",
        parseHTML: (element) => {
          const raw = element.getAttribute("data-code");
          if (raw) {
            try {
              return decodeURIComponent(raw);
            } catch {
              return raw;
            }
          }
          return "";
        },
        renderHTML: (attributes) => ({
          "data-code": encodeURIComponent(attributes.code || ""),
        }),
      },
      html: {
        default: "",
        parseHTML: (element) => {
          const raw = element.getAttribute("data-html");
          if (raw) {
            try {
              return decodeURIComponent(raw);
            } catch {
              return raw;
            }
          }
          return "";
        },
        renderHTML: (attributes) => ({
          "data-html": encodeURIComponent(attributes.html || ""),
        }),
      },
      css: {
        default: "",
        parseHTML: (element) => {
          const raw = element.getAttribute("data-css");
          if (raw) {
            try {
              return decodeURIComponent(raw);
            } catch {
              return raw;
            }
          }
          return "";
        },
        renderHTML: (attributes) => ({
          "data-css": encodeURIComponent(attributes.css || ""),
        }),
      },
      js: {
        default: "",
        parseHTML: (element) => {
          const raw = element.getAttribute("data-js");
          if (raw) {
            try {
              return decodeURIComponent(raw);
            } catch {
              return raw;
            }
          }
          return "";
        },
        renderHTML: (attributes) => ({
          "data-js": encodeURIComponent(attributes.js || ""),
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="code-snippet-embed"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "code-snippet-embed",
        "data-title": node.attrs.title || "Code Snippet",
        "data-language": node.attrs.language || "javascript",
        "data-mode": node.attrs.mode || "executable",
        "data-code": encodeURIComponent(node.attrs.code || ""),
        "data-html": encodeURIComponent(node.attrs.html || ""),
        "data-css": encodeURIComponent(node.attrs.css || ""),
        "data-js": encodeURIComponent(node.attrs.js || ""),
        class: "custom-code-snippet-container my-6",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeSnippetView);
  },

  addCommands() {
    return {
      insertCodeSnippetEmbed:
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

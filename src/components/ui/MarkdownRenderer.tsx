import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * GitHub风格的Markdown渲染器
 * 支持GitHub Flavored Markdown的基本特性
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  return (
    <>
      <style>{`
        .markdown-body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
            "Noto Sans", Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: inherit;
        }

        .markdown-body h1,
        .markdown-body h2,
        .markdown-body h3,
        .markdown-body h4,
        .markdown-body h5,
        .markdown-body h6 {
          margin-top: 24px;
          margin-bottom: 16px;
          font-weight: 600;
          line-height: 1.25;
        }

        .markdown-body h1 {
          font-size: 2em;
          border-bottom: 1px solid #eaecef;
          padding-bottom: 0.3em;
        }

        .markdown-body h2 {
          font-size: 1.5em;
          border-bottom: 1px solid #eaecef;
          padding-bottom: 0.3em;
        }

        .markdown-body code {
          background-color: rgba(175, 184, 193, 0.2);
          padding: 0.2em 0.4em;
          border-radius: 6px;
          font-size: 85%;
        }

        .markdown-body pre {
          background-color: #f6f8fa;
          border-radius: 6px;
          padding: 16px;
          overflow: auto;
        }

        .markdown-body pre code {
          background-color: transparent;
          padding: 0;
        }

        .markdown-body blockquote {
          border-left: 0.25em solid #dfe2e5;
          padding: 0 1em;
          color: #6a737d;
        }

        .markdown-body table {
          border-collapse: collapse;
          width: 100%;
          margin: 16px 0;
        }

        .markdown-body table th,
        .markdown-body table td {
          border: 1px solid #dfe2e5;
          padding: 6px 13px;
        }

        .markdown-body table th {
          background-color: #f6f8fa;
          font-weight: 600;
        }

        .markdown-body ul,
        .markdown-body ol {
          padding-left: 2em;
        }

        .markdown-body li {
          margin: 0.25em 0;
        }

        .markdown-body a {
          color: #0366d6;
          text-decoration: none;
        }

        .markdown-body a:hover {
          text-decoration: underline;
        }

        .markdown-body p {
          margin: 16px 0;
        }

        /* 暗色主题 */
        .dark .markdown-body h1,
        .dark .markdown-body h2 {
          border-bottom-color: #30363d;
        }

        .dark .markdown-body code {
          background-color: rgba(110, 118, 129, 0.4);
        }

        .dark .markdown-body pre {
          background-color: #161b22;
        }

        .dark .markdown-body blockquote {
          border-left-color: #30363d;
          color: #8b949e;
        }

        .dark .markdown-body table th,
        .dark .markdown-body table td {
          border-color: #30363d;
        }

        .dark .markdown-body table th {
          background-color: #21262d;
        }

        .dark .markdown-body a {
          color: #58a6ff;
        }
      `}</style>

      <div className={`markdown-body ${className}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </>
  );
};

export default MarkdownRenderer;

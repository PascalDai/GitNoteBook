import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import "katex/dist/katex.min.css";
import { MermaidDiagram } from "./MermaidDiagram";

interface EnhancedMarkdownRendererProps {
  content: string;
  className?: string;
  isDarkMode?: boolean;
}

/**
 * 增强版GitHub风格的Markdown渲染器
 * 支持代码语法高亮、数学公式、表格等高级特性
 */
export const EnhancedMarkdownRenderer: React.FC<
  EnhancedMarkdownRendererProps
> = ({ content, className = "", isDarkMode = false }) => {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  /**
   * 复制代码到剪贴板
   */
  const copyToClipboard = async (code: string, language: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(`${language}-${code.slice(0, 50)}`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  /**
   * 自定义代码块组件
   */
  const CodeBlock = ({ children, className, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";
    const code = String(children).replace(/\n$/, "");
    const codeId = `${language}-${code.slice(0, 50)}`;
    const isCopied = copiedCode === codeId;

    // 处理Mermaid图表
    if (language === "mermaid") {
      return (
        <div className="my-4">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-md">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              MERMAID DIAGRAM
            </span>
            <button
              onClick={() => copyToClipboard(code, language)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors duration-200"
              title="复制代码"
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  复制
                </>
              )}
            </button>
          </div>
          <MermaidDiagram
            chart={code}
            isDarkMode={isDarkMode}
            className="border border-gray-200 dark:border-gray-700 border-t-0 rounded-b-md"
          />
        </div>
      );
    }

    if (match) {
      return (
        <div className="relative group">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-md">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {language.toUpperCase()}
            </span>
            <button
              onClick={() => copyToClipboard(code, language)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors duration-200"
              title="复制代码"
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  复制
                </>
              )}
            </button>
          </div>
          <SyntaxHighlighter
            style={isDarkMode ? oneDark : oneLight}
            language={language}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: "0.375rem",
              borderBottomRightRadius: "0.375rem",
            }}
            {...props}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
    }

    // 行内代码
    return (
      <code
        className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  };

  /**
   * 自定义表格组件
   */
  const Table = ({ children, ...props }: any) => (
    <div className="overflow-x-auto my-4">
      <table
        className="min-w-full border-collapse border border-gray-300 dark:border-gray-600"
        {...props}
      >
        {children}
      </table>
    </div>
  );

  const TableHead = ({ children, ...props }: any) => (
    <thead className="bg-gray-50 dark:bg-gray-800" {...props}>
      {children}
    </thead>
  );

  const TableRow = ({ children, ...props }: any) => (
    <tr className="border-b border-gray-200 dark:border-gray-700" {...props}>
      {children}
    </tr>
  );

  const TableCell = ({ children, ...props }: any) => (
    <td
      className="px-4 py-2 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
      {...props}
    >
      {children}
    </td>
  );

  const TableHeaderCell = ({ children, ...props }: any) => (
    <th
      className="px-4 py-2 border-r border-gray-200 dark:border-gray-700 last:border-r-0 text-left font-semibold"
      {...props}
    >
      {children}
    </th>
  );

  /**
   * 自定义链接组件
   */
  const Link = ({ children, href, ...props }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
      {...props}
    >
      {children}
    </a>
  );

  /**
   * 自定义引用组件
   */
  const Blockquote = ({ children, ...props }: any) => (
    <blockquote
      className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 my-4 bg-gray-50 dark:bg-gray-800/50 italic"
      {...props}
    >
      {children}
    </blockquote>
  );

  return (
    <>
      <style>{`
        .markdown-body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
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
        
        .markdown-body p {
          margin: 16px 0;
        }
        
        .markdown-body ul,
        .markdown-body ol {
          padding-left: 2em;
          margin: 16px 0;
        }
        
        .markdown-body li {
          margin: 0.25em 0;
        }
        
        .markdown-body li > p {
          margin: 0;
        }
        
        .markdown-body hr {
          height: 0.25em;
          padding: 0;
          margin: 24px 0;
          background-color: #e1e4e8;
          border: 0;
        }
        
        /* 任务列表样式 */
        .markdown-body .task-list-item {
          list-style-type: none;
        }
        
        .markdown-body .task-list-item input[type="checkbox"] {
          margin: 0 0.2em 0.25em -1.6em;
          vertical-align: middle;
        }
        
        /* 数学公式样式 */
        .katex {
          font-size: 1.1em;
        }
        
        .katex-display {
          margin: 1em 0;
          text-align: center;
        }
        
        /* 暗色主题 */
        .dark .markdown-body h1,
        .dark .markdown-body h2 {
          border-bottom-color: #30363d;
        }
        
        .dark .markdown-body hr {
          background-color: #30363d;
        }
      `}</style>

      <div className={`markdown-body ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
          rehypePlugins={[rehypeKatex]}
          components={{
            code: CodeBlock,
            table: Table,
            thead: TableHead,
            tbody: ({ children, ...props }) => (
              <tbody {...props}>{children}</tbody>
            ),
            tr: TableRow,
            td: TableCell,
            th: TableHeaderCell,
            a: Link,
            blockquote: Blockquote,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </>
  );
};

export default EnhancedMarkdownRenderer;

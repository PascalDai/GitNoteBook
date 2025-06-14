import React, { useState } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Heading1,
  Heading2,
  Heading3,
  Table,
  Calculator,
  FileCode,
  Strikethrough,
  Minus,
  CheckSquare,
  MoreHorizontal,
  BarChart3,
  GitBranch,
} from "lucide-react";
import Button from "./Button";

interface EnhancedMarkdownToolbarProps {
  onInsert: (text: string, cursorOffset?: number) => void;
  className?: string;
  compact?: boolean;
}

/**
 * 增强版Markdown编辑器工具栏
 * 提供代码块、数学公式、表格等高级Markdown格式化功能
 */
export const EnhancedMarkdownToolbar: React.FC<
  EnhancedMarkdownToolbarProps
> = ({ onInsert, className = "", compact = false }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  /**
   * 插入代码块
   */
  const insertCodeBlock = (language = "") => {
    const codeBlock = `\`\`\`${language}\n代码内容\n\`\`\`\n`;
    onInsert(codeBlock, language ? -7 : -6);
  };

  /**
   * 插入表格
   */
  const insertTable = () => {
    const table = `| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |

`;
    onInsert(table, 0);
  };

  /**
   * 插入数学公式
   */
  const insertMathFormula = (inline = false) => {
    if (inline) {
      onInsert("$公式$", -1);
    } else {
      onInsert("\n$$\n公式\n$$\n", -4);
    }
  };

  /**
   * 插入任务列表
   */
  const insertTaskList = () => {
    const taskList = `- [ ] 待完成任务
- [x] 已完成任务
- [ ] 另一个任务

`;
    onInsert(taskList, 0);
  };

  /**
   * 插入Mermaid图表
   */
  const insertMermaidChart = (type = "flowchart") => {
    const charts = {
      flowchart: `\`\`\`mermaid
graph TD
    A[开始] --> B{条件判断}
    B -->|是| C[执行操作1]
    B -->|否| D[执行操作2]
    C --> E[结束]
    D --> E
\`\`\`

`,
      sequence: `\`\`\`mermaid
sequenceDiagram
    participant A as 用户
    participant B as 系统
    A->>B: 发送请求
    B->>A: 返回响应
    A->>B: 确认收到
\`\`\`

`,
      gantt: `\`\`\`mermaid
gantt
    title 项目进度
    dateFormat  YYYY-MM-DD
    section 设计阶段
    需求分析      :done, des1, 2024-01-01, 2024-01-05
    界面设计      :done, des2, 2024-01-06, 2024-01-10
    section 开发阶段
    后端开发      :active, dev1, 2024-01-11, 2024-01-20
    前端开发      :dev2, 2024-01-15, 2024-01-25
\`\`\`

`,
      pie: `\`\`\`mermaid
pie title 数据分布
    "A类" : 42
    "B类" : 35
    "C类" : 23
\`\`\`

`,
      gitgraph: `\`\`\`mermaid
gitGraph
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit
\`\`\`

`,
    };

    onInsert(charts[type as keyof typeof charts] || charts.flowchart, 0);
  };

  const basicToolbarItems = [
    {
      icon: Heading1,
      title: "一级标题",
      action: () => onInsert("# ", 2),
    },
    {
      icon: Heading2,
      title: "二级标题",
      action: () => onInsert("## ", 3),
    },
    {
      icon: Heading3,
      title: "三级标题",
      action: () => onInsert("### ", 4),
    },
    { type: "divider" },
    {
      icon: Bold,
      title: "粗体 (Ctrl+B)",
      action: () => onInsert("**文本**", -2),
    },
    {
      icon: Italic,
      title: "斜体 (Ctrl+I)",
      action: () => onInsert("*文本*", -1),
    },
    {
      icon: Strikethrough,
      title: "删除线",
      action: () => onInsert("~~文本~~", -2),
    },
    {
      icon: Code,
      title: "行内代码",
      action: () => onInsert("`代码`", -1),
    },
    { type: "divider" },
    {
      icon: List,
      title: "无序列表",
      action: () => onInsert("- 列表项\n", 0),
    },
    {
      icon: ListOrdered,
      title: "有序列表",
      action: () => onInsert("1. 列表项\n", 0),
    },
    {
      icon: CheckSquare,
      title: "任务列表",
      action: insertTaskList,
    },
    {
      icon: Quote,
      title: "引用",
      action: () => onInsert("> 引用内容\n", 0),
    },
    { type: "divider" },
    {
      icon: Link,
      title: "链接 (Ctrl+K)",
      action: () => onInsert("[链接文本](URL)", -1),
    },
    {
      icon: Image,
      title: "图片",
      action: () => onInsert("![图片描述](图片URL)", -1),
    },
  ];

  const advancedToolbarItems = [
    {
      icon: Table,
      title: "表格",
      action: insertTable,
    },
    {
      icon: Minus,
      title: "分割线",
      action: () => onInsert("\n---\n", 0),
    },
  ];

  // 紧凑模式只显示常用工具
  const compactToolbarItems = [
    {
      icon: Bold,
      title: "粗体",
      action: () => onInsert("**文本**", -2),
    },
    {
      icon: Italic,
      title: "斜体",
      action: () => onInsert("*文本*", -1),
    },
    {
      icon: Code,
      title: "行内代码",
      action: () => onInsert("`代码`", -1),
    },
    { type: "divider" },
    {
      icon: List,
      title: "无序列表",
      action: () => onInsert("- 列表项\n", 0),
    },
    {
      icon: Link,
      title: "链接",
      action: () => onInsert("[链接文本](URL)", -1),
    },
    {
      icon: FileCode,
      title: "代码块",
      action: () => insertCodeBlock(),
    },
  ];

  const toolbarItems = compact ? compactToolbarItems : basicToolbarItems;

  /**
   * 代码块语言选择下拉菜单
   */
  const CodeBlockDropdown = () => {
    const languages = [
      { name: "JavaScript", value: "javascript" },
      { name: "TypeScript", value: "typescript" },
      { name: "Python", value: "python" },
      { name: "Java", value: "java" },
      { name: "C++", value: "cpp" },
      { name: "HTML", value: "html" },
      { name: "CSS", value: "css" },
      { name: "SQL", value: "sql" },
      { name: "Bash", value: "bash" },
      { name: "JSON", value: "json" },
    ];

    return (
      <div className="relative group">
        <button
          className="p-2 h-8 w-8 hover:bg-gray-200 dark:hover:bg-github-border rounded-md transition-colors duration-200 flex items-center justify-center"
          title="代码块"
        >
          <FileCode className="w-4 h-4 text-gray-600 dark:text-github-text-secondary" />
        </button>
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-github-surface border border-gray-200 dark:border-github-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-32">
          <button
            onClick={() => insertCodeBlock()}
            className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-github-border rounded-t-md"
          >
            普通代码块
          </button>
          <div className="border-t border-gray-200 dark:border-github-border"></div>
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => insertCodeBlock(lang.value)}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-github-border last:rounded-b-md"
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  /**
   * 数学公式下拉菜单
   */
  const MathDropdown = () => (
    <div className="relative group">
      <button
        className="p-2 h-8 w-8 hover:bg-gray-200 dark:hover:bg-github-border rounded-md transition-colors duration-200 flex items-center justify-center"
        title="数学公式"
      >
        <Calculator className="w-4 h-4 text-gray-600 dark:text-github-text-secondary" />
      </button>
      <div className="absolute top-full left-0 mt-1 bg-white dark:bg-github-surface border border-gray-200 dark:border-github-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-32">
        <button
          onClick={() => insertMathFormula(true)}
          className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-github-border rounded-t-md"
        >
          行内公式
        </button>
        <button
          onClick={() => insertMathFormula(false)}
          className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-github-border rounded-b-md"
        >
          块级公式
        </button>
      </div>
    </div>
  );

  /**
   * Mermaid图表下拉菜单
   */
  const MermaidDropdown = () => {
    const mermaidTypes = [
      { type: "flowchart", label: "流程图", icon: GitBranch },
      { type: "sequence", label: "时序图", icon: MoreHorizontal },
      { type: "gantt", label: "甘特图", icon: BarChart3 },
      { type: "pie", label: "饼图", icon: BarChart3 },
      { type: "gitgraph", label: "Git图", icon: GitBranch },
    ];

    return (
      <div className="relative group">
        <button
          className="p-2 h-8 w-8 hover:bg-gray-200 dark:hover:bg-github-border rounded-md transition-colors duration-200 flex items-center justify-center"
          title="Mermaid图表"
        >
          <BarChart3 className="w-4 h-4 text-gray-600 dark:text-github-text-secondary" />
        </button>
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-github-surface border border-gray-200 dark:border-github-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-32">
          {mermaidTypes.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => insertMermaidChart(type)}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-github-border first:rounded-t-md last:rounded-b-md flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`flex items-center gap-1 p-2 border-b border-gray-200 dark:border-github-border bg-gray-50 dark:bg-github-surface ${className}`}
    >
      {toolbarItems.map((item, index) => {
        if (item.type === "divider") {
          return (
            <div
              key={index}
              className="w-px h-6 bg-gray-300 dark:bg-github-border mx-1"
            />
          );
        }

        const Icon = item.icon!;
        return (
          <button
            key={index}
            onClick={item.action}
            title={item.title}
            className="p-2 h-8 w-8 hover:bg-gray-200 dark:hover:bg-github-border rounded-md transition-colors duration-200 flex items-center justify-center"
          >
            <Icon className="w-4 h-4 text-gray-600 dark:text-github-text-secondary" />
          </button>
        );
      })}

      {!compact && (
        <>
          <div className="w-px h-6 bg-gray-300 dark:bg-github-border mx-1" />

          <CodeBlockDropdown />
          <MermaidDropdown />
          <MathDropdown />

          {advancedToolbarItems.map((item, index) => {
            const Icon = item.icon!;
            return (
              <button
                key={`advanced-${index}`}
                onClick={item.action}
                title={item.title}
                className="p-2 h-8 w-8 hover:bg-gray-200 dark:hover:bg-github-border rounded-md transition-colors duration-200 flex items-center justify-center"
              >
                <Icon className="w-4 h-4 text-gray-600 dark:text-github-text-secondary" />
              </button>
            );
          })}
        </>
      )}

      {!compact && (
        <>
          <div className="flex-1" />
          <div className="text-xs text-gray-500 dark:text-github-text-secondary">
            支持 GitHub Flavored Markdown + 数学公式
          </div>
        </>
      )}
    </div>
  );
};

export default EnhancedMarkdownToolbar;

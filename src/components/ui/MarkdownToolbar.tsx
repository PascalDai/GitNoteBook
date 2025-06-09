import React from "react";
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
} from "lucide-react";
import Button from "./Button";

interface MarkdownToolbarProps {
  onInsert: (text: string, cursorOffset?: number) => void;
  className?: string;
  compact?: boolean;
}

/**
 * Markdown编辑器工具栏
 * 提供常用的Markdown格式化快捷操作
 */
export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  onInsert,
  className = "",
  compact = false,
}) => {
  const allToolbarItems = [
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
      icon: ListOrdered,
      title: "有序列表",
      action: () => onInsert("1. 列表项\n", 0),
    },
    {
      icon: Quote,
      title: "引用",
      action: () => onInsert("> 引用内容\n", 0),
    },
    { type: "divider" },
    {
      icon: Link,
      title: "链接",
      action: () => onInsert("[链接文本](URL)", -1),
    },
    {
      icon: Image,
      title: "图片",
      action: () => onInsert("![图片描述](图片URL)", -1),
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
  ];

  const toolbarItems = compact ? compactToolbarItems : allToolbarItems;

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
          <div className="flex-1" />
          <div className="text-xs text-gray-500 dark:text-github-text-secondary">
            支持 GitHub Flavored Markdown
          </div>
        </>
      )}
    </div>
  );
};

export default MarkdownToolbar;
 
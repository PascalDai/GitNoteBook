import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Replace,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import Button from "./Button";

interface FindReplaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onContentChange: (newContent: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

/**
 * 查找替换对话框组件
 * 提供文本搜索、替换、正则表达式等功能
 */
export const FindReplaceDialog: React.FC<FindReplaceDialogProps> = ({
  isOpen,
  onClose,
  content,
  onContentChange,
  textareaRef,
}) => {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [matches, setMatches] = useState<Array<{ start: number; end: number }>>(
    []
  );

  const findInputRef = useRef<HTMLInputElement>(null);

  // 当对话框打开时聚焦到查找输入框
  useEffect(() => {
    if (isOpen && findInputRef.current) {
      findInputRef.current.focus();
    }
  }, [isOpen]);

  // 查找匹配项
  useEffect(() => {
    if (!findText || !content) {
      setMatches([]);
      setTotalMatches(0);
      setCurrentMatch(0);
      return;
    }

    try {
      let searchPattern: RegExp;

      if (useRegex) {
        const flags = caseSensitive ? "g" : "gi";
        searchPattern = new RegExp(findText, flags);
      } else {
        let escapedText = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        if (wholeWord) {
          escapedText = `\\b${escapedText}\\b`;
        }

        const flags = caseSensitive ? "g" : "gi";
        searchPattern = new RegExp(escapedText, flags);
      }

      const foundMatches: Array<{ start: number; end: number }> = [];
      let match;

      while ((match = searchPattern.exec(content)) !== null) {
        foundMatches.push({
          start: match.index,
          end: match.index + match[0].length,
        });

        // 防止无限循环
        if (match[0].length === 0) {
          break;
        }
      }

      setMatches(foundMatches);
      setTotalMatches(foundMatches.length);
      setCurrentMatch(foundMatches.length > 0 ? 1 : 0);
    } catch (error) {
      // 正则表达式错误
      setMatches([]);
      setTotalMatches(0);
      setCurrentMatch(0);
    }
  }, [findText, content, caseSensitive, useRegex, wholeWord]);

  /**
   * 跳转到指定匹配项
   */
  const goToMatch = (matchIndex: number) => {
    if (!textareaRef.current || matches.length === 0) return;

    const match = matches[matchIndex];
    if (!match) return;

    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(match.start, match.end);
    textareaRef.current.scrollIntoView({ behavior: "smooth", block: "center" });

    setCurrentMatch(matchIndex + 1);
  };

  /**
   * 下一个匹配项
   */
  const findNext = () => {
    if (matches.length === 0) return;

    const nextIndex = currentMatch >= matches.length ? 0 : currentMatch;
    goToMatch(nextIndex);
  };

  /**
   * 上一个匹配项
   */
  const findPrevious = () => {
    if (matches.length === 0) return;

    const prevIndex = currentMatch <= 1 ? matches.length - 1 : currentMatch - 2;
    goToMatch(prevIndex);
  };

  /**
   * 替换当前匹配项
   */
  const replaceCurrent = () => {
    if (!textareaRef.current || matches.length === 0 || currentMatch === 0)
      return;

    const match = matches[currentMatch - 1];
    if (!match) return;

    const newContent =
      content.substring(0, match.start) +
      replaceText +
      content.substring(match.end);

    onContentChange(newContent);

    // 更新光标位置
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = match.start + replaceText.length;
        textareaRef.current.setSelectionRange(newPosition, newPosition);
        textareaRef.current.focus();
      }
    }, 0);
  };

  /**
   * 替换所有匹配项
   */
  const replaceAll = () => {
    if (!findText || matches.length === 0) return;

    try {
      let searchPattern: RegExp;

      if (useRegex) {
        const flags = caseSensitive ? "g" : "gi";
        searchPattern = new RegExp(findText, flags);
      } else {
        let escapedText = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        if (wholeWord) {
          escapedText = `\\b${escapedText}\\b`;
        }

        const flags = caseSensitive ? "g" : "gi";
        searchPattern = new RegExp(escapedText, flags);
      }

      const newContent = content.replace(searchPattern, replaceText);
      onContentChange(newContent);
    } catch (error) {
      console.error("替换失败:", error);
    }
  };

  /**
   * 处理键盘快捷键
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter") {
      if (e.shiftKey) {
        findPrevious();
      } else {
        findNext();
      }
    } else if (e.key === "F3") {
      e.preventDefault();
      if (e.shiftKey) {
        findPrevious();
      } else {
        findNext();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-github-surface border border-gray-300 dark:border-github-border rounded-lg shadow-xl w-96 max-w-full mx-4">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-github-border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-github-text">
            查找和替换
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-github-border rounded"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-github-text-secondary" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4 space-y-4" onKeyDown={handleKeyDown}>
          {/* 查找输入 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-github-text">
              查找
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={findInputRef}
                  type="text"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  placeholder="输入要查找的文本..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-github-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-github-surface text-gray-900 dark:text-github-text"
                />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={findPrevious}
                  disabled={matches.length === 0}
                  title="上一个 (Shift+Enter)"
                  className="px-2 py-1 border border-gray-300 dark:border-github-border rounded hover:bg-gray-100 dark:hover:bg-github-border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={findNext}
                  disabled={matches.length === 0}
                  title="下一个 (Enter)"
                  className="px-2 py-1 border border-gray-300 dark:border-github-border rounded hover:bg-gray-100 dark:hover:bg-github-border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 匹配计数 */}
            <div className="text-sm text-gray-500 dark:text-github-text-secondary">
              {totalMatches > 0
                ? `${currentMatch} / ${totalMatches} 个匹配项`
                : findText
                ? "未找到匹配项"
                : "输入文本开始搜索"}
            </div>
          </div>

          {/* 替换输入 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-github-text">
              替换为
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Replace className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder="输入替换文本..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-github-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-github-surface text-gray-900 dark:text-github-text"
                />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={replaceCurrent}
                  disabled={matches.length === 0 || currentMatch === 0}
                  title="替换当前"
                  className="px-2 py-1 border border-gray-300 dark:border-github-border rounded hover:bg-gray-100 dark:hover:bg-github-border disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  替换
                </button>
                <button
                  onClick={replaceAll}
                  disabled={matches.length === 0}
                  title="替换全部"
                  className="px-2 py-1 border border-gray-300 dark:border-github-border rounded hover:bg-gray-100 dark:hover:bg-github-border disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  全部
                </button>
              </div>
            </div>
          </div>

          {/* 选项 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-github-text">
              选项
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-github-text">
                  区分大小写
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={wholeWord}
                  onChange={(e) => setWholeWord(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-github-text">
                  全词匹配
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useRegex}
                  onChange={(e) => setUseRegex(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-github-text">
                  正则表达式
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-github-border">
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FindReplaceDialog;
 
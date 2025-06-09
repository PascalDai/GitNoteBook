import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "../../stores/appStore";
import { EnhancedMarkdownRenderer } from "../ui/EnhancedMarkdownRenderer";
import { EnhancedMarkdownToolbar } from "../ui/EnhancedMarkdownToolbar";
import { FindReplaceDialog } from "../ui/FindReplaceDialog";
import Button from "../ui/Button";
import { githubService } from "../../services/github";
import {
  Save,
  ArrowLeft,
  Eye,
  Edit,
  Columns,
  Search,
  Maximize,
  Minimize,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface EnhancedNoteEditorProps {
  noteId?: string;
  onBack?: () => void;
}

/**
 * 增强版笔记编辑器
 * 集成代码高亮、数学公式、查找替换、自动保存等高级功能
 */
export const EnhancedNoteEditor: React.FC<EnhancedNoteEditorProps> = ({
  noteId,
  onBack,
}) => {
  const { notes, selectedRepo, updateNote, isLoading, error, theme } =
    useAppStore();

  // 判断是否为深色模式
  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // 编辑器状态
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">(
    "edit"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);

  // 自动保存状态
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaveTimer, setAutoSaveTimer] = useState<number | null>(null);

  // 引用
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // 获取当前笔记
  const currentNote = noteId
    ? notes.find((note) => note.id.toString() === noteId)
    : null;
  const isNewNote = !noteId;

  // 初始化编辑器内容
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setTags(currentNote.tags || []);
      setHasUnsavedChanges(false);
      setLastSaved(new Date(currentNote.updatedAt));
    } else {
      setTitle("");
      setContent("");
      setTags([]);
      setHasUnsavedChanges(false);
      setLastSaved(null);
    }
  }, [currentNote]);

  // 监听内容变化
  useEffect(() => {
    if (currentNote) {
      const hasChanges =
        title !== currentNote.title ||
        content !== currentNote.content ||
        JSON.stringify(tags) !== JSON.stringify(currentNote.tags || []);

      setHasUnsavedChanges(hasChanges);

      // 自动保存逻辑
      if (hasChanges && autoSaveEnabled && !isNewNote) {
        if (autoSaveTimer) {
          clearTimeout(autoSaveTimer);
        }

        const timer = window.setTimeout(() => {
          handleAutoSave();
        }, 30000); // 30秒后自动保存

        setAutoSaveTimer(timer);
      }
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [title, content, tags, currentNote, autoSaveEnabled, isNewNote]);

  /**
   * 自动保存功能
   */
  const handleAutoSave = async () => {
    if (!currentNote || !hasUnsavedChanges || isSaving || !selectedRepo) return;

    try {
      setIsSaving(true);

      // 调用GitHub API更新Issue
      const [owner, repo] = selectedRepo.full_name.split("/");
      await githubService.updateIssue(
        owner,
        repo,
        currentNote.githubIssue.number,
        title.trim() || "无标题",
        content,
        tags
      );

      // 同时更新本地状态
      await updateNote(currentNote.id, {
        title: title.trim() || "无标题",
        content,
        tags,
        updatedAt: new Date().toISOString(),
      });

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("自动保存失败:", error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 手动保存
   */
  const handleSave = async () => {
    if (!selectedRepo || isSaving || !currentNote) return;

    try {
      setIsSaving(true);

      // 调用GitHub API更新Issue
      const [owner, repo] = selectedRepo.full_name.split("/");
      await githubService.updateIssue(
        owner,
        repo,
        currentNote.githubIssue.number,
        title.trim() || "无标题",
        content,
        tags // 使用tags作为标签
      );

      // 同时更新本地状态
      await updateNote(currentNote.id, {
        title: title.trim() || "无标题",
        content,
        tags,
        updatedAt: new Date().toISOString(),
      });

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("保存失败:", error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 添加标签
   */
  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  /**
   * 移除标签
   */
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  /**
   * 插入文本到编辑器
   */
  const handleInsertText = useCallback(
    (text: string, cursorOffset = 0) => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newContent =
        content.substring(0, start) + text + content.substring(end);

      setContent(newContent);

      // 设置光标位置
      setTimeout(() => {
        if (textarea) {
          const newPosition = start + text.length + cursorOffset;
          textarea.setSelectionRange(newPosition, newPosition);
          textarea.focus();
        }
      }, 0);
    },
    [content]
  );

  /**
   * 键盘快捷键处理
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "s":
          e.preventDefault();
          handleSave();
          break;
        case "f":
          e.preventDefault();
          setShowFindReplace(true);
          break;
        case "b":
          e.preventDefault();
          handleInsertText("**文本**", -2);
          break;
        case "i":
          e.preventDefault();
          handleInsertText("*文本*", -1);
          break;
        case "k":
          e.preventDefault();
          handleInsertText("[链接文本](URL)", -1);
          break;
      }
    }
  };

  /**
   * 同步滚动
   */
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLTextAreaElement>) => {
      if (viewMode !== "split" || !previewRef.current) return;

      const textarea = e.currentTarget;
      const preview = previewRef.current;

      const scrollPercentage =
        textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
      const targetScrollTop =
        scrollPercentage * (preview.scrollHeight - preview.clientHeight);

      preview.scrollTop = targetScrollTop;
    },
    [viewMode]
  );

  // 渲染保存状态
  const renderSaveStatus = () => {
    if (isSaving) {
      return (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <Clock className="w-4 h-4 animate-spin" />
          保存中...
        </div>
      );
    }

    if (hasUnsavedChanges) {
      return (
        <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
          <AlertCircle className="w-4 h-4" />
          有未保存的更改
        </div>
      );
    }

    if (lastSaved) {
      return (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle className="w-4 h-4" />
          已保存 {lastSaved.toLocaleTimeString()}
        </div>
      );
    }

    return null;
  };

  // 如果没有找到笔记，显示错误信息
  if (noteId && !currentNote) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-github-text mb-2">
            笔记未找到
          </h3>
          <p className="text-gray-500 dark:text-github-text-secondary mb-4">
            请检查笔记ID是否正确
          </p>
          {onBack && (
            <Button onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-full ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-white dark:bg-github-canvas-default"
          : ""
      }`}
    >
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-github-border bg-white dark:bg-github-surface">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("edit")}
              className={`p-2 rounded ${
                viewMode === "edit"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-github-border"
              }`}
              title="编辑模式"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`p-2 rounded ${
                viewMode === "preview"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-github-border"
              }`}
              title="预览模式"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`p-2 rounded ${
                viewMode === "split"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-github-border"
              }`}
              title="分屏模式"
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {renderSaveStatus()}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFindReplace(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-github-border rounded"
              title="查找替换 (Ctrl+F)"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-github-border rounded"
              title={isFullscreen ? "退出全屏" : "全屏"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>

            <Button
              onClick={handleSave}
              disabled={isSaving || (!hasUnsavedChanges && !isNewNote)}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      </div>

      {/* 标题和标签 */}
      <div className="p-4 border-b border-gray-200 dark:border-github-border bg-white dark:bg-github-surface">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入笔记标题..."
          className="w-full text-xl font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-github-text placeholder-gray-500 dark:placeholder-github-text-secondary"
        />

        <div className="flex items-center gap-2 mt-3">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="添加标签..."
            className="px-2 py-1 text-sm border border-gray-300 dark:border-github-border rounded bg-white dark:bg-github-surface text-gray-900 dark:text-github-text placeholder-gray-500 dark:placeholder-github-text-secondary"
          />
        </div>
      </div>

      {/* 编辑器内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 编辑模式 */}
        {viewMode === "edit" && (
          <div className="flex-1 flex flex-col">
            <EnhancedMarkdownToolbar onInsert={handleInsertText} />
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="开始编写你的笔记..."
              className="flex-1 p-4 resize-none border-none outline-none bg-white dark:bg-github-canvas-default text-gray-900 dark:text-github-text font-mono text-sm leading-relaxed"
            />
          </div>
        )}

        {/* 预览模式 */}
        {viewMode === "preview" && (
          <div className="flex-1 overflow-auto">
            <div className="p-4">
              <EnhancedMarkdownRenderer
                content={
                  content ||
                  "# 开始编写你的笔记\n\n在编辑模式下输入内容，然后切换到预览模式查看渲染效果。"
                }
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        )}

        {/* 分屏模式 */}
        {viewMode === "split" && (
          <>
            <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-github-border">
              <EnhancedMarkdownToolbar onInsert={handleInsertText} compact />
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                placeholder="开始编写你的笔记..."
                className="flex-1 p-4 resize-none border-none outline-none bg-white dark:bg-github-canvas-default text-gray-900 dark:text-github-text font-mono text-sm leading-relaxed"
              />
            </div>
            <div className="flex-1 overflow-auto" ref={previewRef}>
              <div className="p-4">
                <EnhancedMarkdownRenderer
                  content={
                    content ||
                    "# 开始编写你的笔记\n\n在左侧编辑器中输入内容，右侧会实时显示预览效果。"
                  }
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* 查找替换对话框 */}
      <FindReplaceDialog
        isOpen={showFindReplace}
        onClose={() => setShowFindReplace(false)}
        content={content}
        onContentChange={setContent}
        textareaRef={textareaRef}
      />

      {/* 错误提示 */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedNoteEditor;

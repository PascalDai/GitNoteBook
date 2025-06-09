import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Save,
  Eye,
  Edit3,
  Tag,
  Plus,
  X,
  CheckCircle,
  Loader2,
  AlertCircle,
  Settings,
  Clock,
  Columns,
} from "lucide-react";
import Button from "../ui/Button";
import { MarkdownRenderer } from "../ui/MarkdownRenderer";
import { MarkdownToolbar } from "../ui/MarkdownToolbar";
import { useAppStore } from "../../stores/appStore";
import { githubService } from "../../services/github";
import {
  isTokenError,
  isPermissionError,
  getErrorSuggestion,
} from "../../utils/errorHelpers";

/**
 * 笔记编辑器视图组件
 */
export const NoteEditorView: React.FC = () => {
  const {
    selectedRepo,
    currentNote,
    setCurrentNote,
    addNote,
    updateNote,
    setCurrentPage,
  } = useAppStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 文本区域引用，用于光标操作
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // 预览区域引用，用于同步滚动
  const previewRef = useRef<HTMLDivElement>(null);
  // 自动保存定时器引用
  const autoSaveTimerRef = useRef<number | null>(null);
  // 同步滚动标志，防止无限循环
  const isScrollSyncRef = useRef(false);

  // 初始化编辑器状态
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setLabels(currentNote.labels.map((label) => label.name));
      setLastSaved(new Date(currentNote.updatedAt));
    } else {
      setTitle("");
      setContent("");
      setLabels([]);
      setLastSaved(null);
    }
    setError(null);
    setSuccess(false);
    setHasUnsavedChanges(false);
  }, [currentNote]);

  // 监听内容变化，标记为有未保存的更改
  useEffect(() => {
    if (currentNote) {
      const hasChanges =
        title !== currentNote.title ||
        content !== currentNote.content ||
        JSON.stringify(labels) !==
          JSON.stringify(currentNote.labels.map((l) => l.name));
      setHasUnsavedChanges(hasChanges);
    } else {
      setHasUnsavedChanges(title.trim() !== "" || content.trim() !== "");
    }
  }, [title, content, labels, currentNote]);

  // 自动保存功能
  useEffect(() => {
    if (hasUnsavedChanges && currentNote && currentNote.id !== 0) {
      // 清除之前的定时器
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // 设置新的自动保存定时器（30秒）
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(true); // 传入true表示是自动保存
      }, 30000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges, title, content, labels, currentNote]);

  /**
   * 处理工具栏文本插入
   */
  const handleTextInsert = (text: string, cursorOffset = 0) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent =
      content.substring(0, start) + text + content.substring(end);

    setContent(newContent);

    // 设置新的光标位置
    setTimeout(() => {
      const newCursorPos = start + text.length + cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  /**
   * 处理键盘快捷键
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "s":
          e.preventDefault();
          handleSave();
          break;
        case "b":
          e.preventDefault();
          handleTextInsert("**文本**", -2);
          break;
        case "i":
          e.preventDefault();
          handleTextInsert("*文本*", -1);
          break;
        case "k":
          e.preventDefault();
          handleTextInsert("[链接文本](URL)", -1);
          break;
      }
    }
  };

  /**
   * 处理标签输入的键盘事件
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddLabel();
    }
  };

  /**
   * 处理编辑器滚动，同步到预览区域
   */
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (!isSplitView || isScrollSyncRef.current) return;

    const textarea = e.currentTarget;
    const preview = previewRef.current;
    if (!preview) return;

    isScrollSyncRef.current = true;

    // 计算滚动比例
    const scrollRatio =
      textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);

    // 同步到预览区域
    const previewScrollTop =
      scrollRatio * (preview.scrollHeight - preview.clientHeight);
    preview.scrollTop = previewScrollTop;

    setTimeout(() => {
      isScrollSyncRef.current = false;
    }, 100);
  };

  /**
   * 处理预览区域滚动，同步到编辑器
   */
  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!isSplitView || isScrollSyncRef.current) return;

    const preview = e.currentTarget;
    const textarea = textareaRef.current;
    if (!textarea) return;

    isScrollSyncRef.current = true;

    // 计算滚动比例
    const scrollRatio =
      preview.scrollTop / (preview.scrollHeight - preview.clientHeight);

    // 同步到编辑器
    const textareaScrollTop =
      scrollRatio * (textarea.scrollHeight - textarea.clientHeight);
    textarea.scrollTop = textareaScrollTop;

    setTimeout(() => {
      isScrollSyncRef.current = false;
    }, 100);
  };

  /**
   * 保存笔记
   */
  const handleSave = async (isAutoSave = false) => {
    if (!selectedRepo || !title.trim()) {
      if (!isAutoSave) {
        setError("请输入笔记标题");
      }
      return;
    }

    setIsSaving(true);
    if (!isAutoSave) {
      setError(null);
      setSuccess(false);
    }

    try {
      const [owner, repo] = selectedRepo.full_name.split("/");

      if (currentNote && currentNote.id !== 0 && currentNote.githubIssue) {
        // 更新现有笔记
        await githubService.updateIssue(
          owner,
          repo,
          currentNote.githubIssue.number,
          title.trim(),
          content.trim(),
          labels
        );

        // 更新本地状态
        updateNote(currentNote.id, {
          title: title.trim(),
          content: content.trim(),
          labels: labels.map((name) => ({
            id: 0,
            node_id: "",
            url: "",
            name,
            description: null,
            color: "",
            default: false,
          })),
          updatedAt: new Date().toISOString(),
        });
      } else {
        // 创建新笔记
        const newIssue = await githubService.createIssue(
          owner,
          repo,
          title.trim(),
          content.trim(),
          labels
        );

        // 添加到本地状态
        const newNote = {
          id: newIssue.id,
          title: newIssue.title,
          content: newIssue.body || "",
          labels: newIssue.labels,
          createdAt: newIssue.created_at,
          updatedAt: newIssue.updated_at,
          githubIssue: newIssue,
        };

        addNote(newNote);
        setCurrentNote(newNote);
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);

      if (!isAutoSave) {
        setSuccess(true);
        // 延迟显示成功消息，然后返回笔记列表
        setTimeout(() => {
          setSuccess(false);
          // 保存成功后返回笔记列表，这样用户可以看到新保存的笔记
          if (currentNote && currentNote.id === 0) {
            // 如果是新建笔记，返回列表查看
            setCurrentNote(null);
          }
        }, 1500);
      }
    } catch (err: any) {
      if (!isAutoSave) {
        setError(err.message || "保存失败");
      }
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 处理错误重试
   */
  const handleErrorAction = () => {
    if (error && (isTokenError(error) || isPermissionError(error))) {
      // Token或权限错误，跳转到设置页面
      setCurrentPage("settings");
    } else {
      // 其他错误，清除错误状态重试
      setError(null);
    }
  };

  /**
   * 添加标签
   */
  const handleAddLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel("");
    }
  };

  /**
   * 删除标签
   */
  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter((label) => label !== labelToRemove));
  };

  /**
   * 返回笔记列表
   */
  const handleBack = () => {
    setCurrentNote(null);
  };

  return (
    <div className="h-full bg-white dark:bg-github-bg flex flex-col">
      {/* 头部 */}
      <div className="border-b border-gray-200 dark:border-github-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回笔记列表
            </Button>

            <h1 className="text-xl font-semibold text-gray-900 dark:text-github-text">
              {currentNote ? "编辑笔记" : "新建笔记"}
            </h1>

            {/* 保存状态指示器 */}
            {lastSaved && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-github-text-secondary">
                <Clock className="w-4 h-4" />
                <span>
                  {hasUnsavedChanges
                    ? "有未保存的更改"
                    : `上次保存: ${lastSaved.toLocaleTimeString()}`}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                if (isSplitView) {
                  setIsSplitView(false);
                } else {
                  setIsPreview(!isPreview);
                }
              }}
              className="flex items-center gap-2"
            >
              {isPreview ? (
                <>
                  <Edit3 className="w-4 h-4" />
                  编辑
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  预览
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setIsSplitView(!isSplitView);
                setIsPreview(false);
              }}
              className={`flex items-center gap-2 ${
                isSplitView
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : ""
              }`}
            >
              <Columns className="w-4 h-4" />
              双栏
            </Button>

            <Button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  保存中...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  已保存
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  保存
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="flex-1 overflow-hidden">
        {/* 错误和成功提示 */}
        {error && (
          <div className="mx-6 mt-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                    保存失败
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400 mb-2">
                    {error}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                    {getErrorSuggestion(error)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleErrorAction}
                    className="text-red-700 dark:text-red-300 border-red-300 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    {isTokenError(error) || isPermissionError(error) ? (
                      <>
                        <Settings className="w-4 h-4 mr-2" />
                        前往设置
                      </>
                    ) : (
                      "重试"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-6">
            <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
              <p className="text-green-700 dark:text-green-400">
                笔记保存成功！
              </p>
            </div>
          </div>
        )}

        {/* 编辑器内容 */}
        <div className="flex-1 flex flex-col p-6">
          {/* 标题输入 */}
          <div className="mb-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入笔记标题..."
              className="w-full text-2xl font-bold border-none outline-none bg-transparent text-gray-900 dark:text-github-text placeholder-gray-400 dark:placeholder-github-text-secondary"
            />
          </div>

          {/* 标签管理 */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-3">
              {labels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                >
                  <Tag className="w-3 h-3" />
                  {label}
                  <button
                    onClick={() => handleRemoveLabel(label)}
                    className="ml-1 hover:text-blue-600 dark:hover:text-blue-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="添加标签..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-github-border rounded-md focus:outline-none focus:ring-2 focus:ring-github-accent-emphasis focus:border-github-accent-emphasis bg-white dark:bg-github-surface text-gray-900 dark:text-github-text placeholder-gray-400 dark:placeholder-github-text-secondary"
              />
              <Button
                variant="outline"
                onClick={handleAddLabel}
                disabled={!newLabel.trim()}
                className="px-4 py-2 text-sm"
              >
                添加
              </Button>
            </div>
          </div>

          {/* 编辑器主体 */}
          <div className="flex-1 flex gap-6 min-h-0">
            {/* 双栏布局 */}
            {isSplitView ? (
              <>
                {/* 编辑区域 */}
                <div className="flex-1 flex flex-col border border-gray-300 dark:border-github-border rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 dark:bg-github-surface border-b border-gray-200 dark:border-github-border text-sm text-gray-600 dark:text-github-text-secondary flex items-center justify-between">
                    <span>编辑器</span>
                    <MarkdownToolbar onInsert={handleTextInsert} compact />
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onScroll={handleEditorScroll}
                    placeholder="开始编写您的笔记内容...

支持Markdown语法：
# 标题
## 二级标题
**粗体** *斜体*
- 列表项
> 引用
`代码`
[链接](URL)

快捷键：
Ctrl+S: 保存
Ctrl+B: 粗体
Ctrl+I: 斜体
Ctrl+K: 链接"
                    className="flex-1 p-4 resize-none focus:outline-none bg-white dark:bg-github-surface text-gray-900 dark:text-github-text placeholder-gray-400 dark:placeholder-github-text-secondary font-mono text-sm leading-relaxed"
                  />
                </div>

                {/* 预览区域 */}
                <div className="flex-1 flex flex-col border border-gray-300 dark:border-github-border rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 dark:bg-github-surface border-b border-gray-200 dark:border-github-border text-sm text-gray-600 dark:text-github-text-secondary">
                    预览
                  </div>
                  <div
                    ref={previewRef}
                    className="flex-1 p-4 bg-white dark:bg-github-surface overflow-y-auto"
                    onScroll={handlePreviewScroll}
                  >
                    {content.trim() ? (
                      <MarkdownRenderer content={content} />
                    ) : (
                      <p className="text-gray-400 dark:text-github-text-secondary italic">
                        暂无内容预览
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* 单栏编辑区域 */}
                {!isPreview && (
                  <div className="flex-1 flex flex-col border border-gray-300 dark:border-github-border rounded-lg overflow-hidden">
                    <MarkdownToolbar onInsert={handleTextInsert} />
                    <textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="开始编写您的笔记内容...

支持Markdown语法：
# 标题
## 二级标题
**粗体** *斜体*
- 列表项
> 引用
`代码`
[链接](URL)

快捷键：
Ctrl+S: 保存
Ctrl+B: 粗体
Ctrl+I: 斜体
Ctrl+K: 链接"
                      className="flex-1 p-4 resize-none focus:outline-none bg-white dark:bg-github-surface text-gray-900 dark:text-github-text placeholder-gray-400 dark:placeholder-github-text-secondary font-mono text-sm leading-relaxed"
                    />
                  </div>
                )}

                {/* 单栏预览区域 */}
                {isPreview && (
                  <div className="flex-1 flex flex-col border border-gray-300 dark:border-github-border rounded-lg overflow-hidden">
                    <div className="px-4 py-2 bg-gray-50 dark:bg-github-surface border-b border-gray-200 dark:border-github-border text-sm text-gray-600 dark:text-github-text-secondary">
                      预览
                    </div>
                    <div className="flex-1 p-4 bg-white dark:bg-github-surface overflow-y-auto">
                      {content.trim() ? (
                        <MarkdownRenderer content={content} />
                      ) : (
                        <p className="text-gray-400 dark:text-github-text-secondary italic">
                          暂无内容预览
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
 
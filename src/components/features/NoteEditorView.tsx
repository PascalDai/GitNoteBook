import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import Button from "../ui/Button";
import { useAppStore } from "../../stores/appStore";
import { githubService } from "../../services/github";

/**
 * 笔记编辑器视图组件
 */
export const NoteEditorView: React.FC = () => {
  const { selectedRepo, currentNote, setCurrentNote, addNote, updateNote } =
    useAppStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 初始化编辑器状态
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setLabels(currentNote.labels.map((label) => label.name));
    } else {
      setTitle("");
      setContent("");
      setLabels([]);
    }
    setError(null);
    setSuccess(false);
  }, [currentNote]);

  /**
   * 保存笔记
   */
  const handleSave = async () => {
    if (!selectedRepo || !title.trim()) {
      setError("请输入笔记标题");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(false);

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

      setSuccess(true);

      // 延迟显示成功消息
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "保存失败");
    } finally {
      setIsSaving(false);
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
   * 处理键盘事件
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddLabel();
    }
  };

  /**
   * 返回笔记列表
   */
  const handleBack = () => {
    setCurrentNote(null);
  };

  /**
   * 简单的Markdown预览（基础实现）
   */
  const renderPreview = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^\* (.*$)/gim, "<li>$1</li>")
      .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*)\*/gim, "<em>$1</em>")
      .replace(/\n/gim, "<br>");
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
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsPreview(!isPreview)}
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
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-400">{error}</p>
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

        <div className="h-full bg-white dark:bg-github-surface m-6 rounded-lg shadow-sm border border-gray-200 dark:border-github-border flex flex-col">
          {/* 标题输入 */}
          <div className="p-6 border-b border-gray-200 dark:border-github-border">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入笔记标题..."
              className="w-full text-2xl font-semibold border-none outline-none bg-transparent text-gray-900 dark:text-github-text placeholder-gray-400 dark:placeholder-github-text-secondary"
            />
          </div>

          {/* 标签管理 */}
          <div className="p-6 border-b border-gray-200 dark:border-github-border">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-5 h-5 text-gray-400 dark:text-github-text-secondary" />
              <span className="text-sm font-medium text-gray-700 dark:text-github-text">
                标签
              </span>
            </div>

            {/* 现有标签 */}
            <div className="flex flex-wrap gap-2 mb-3">
              {labels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                >
                  {label}
                  <button
                    onClick={() => handleRemoveLabel(label)}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* 添加新标签 */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="添加标签..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-github-border rounded-md focus:outline-none focus:ring-2 focus:ring-github-accent-emphasis focus:border-github-accent-emphasis bg-white dark:bg-github-canvas-default text-gray-900 dark:text-github-text placeholder-gray-400 dark:placeholder-github-text-secondary"
              />
              <Button
                variant="outline"
                onClick={handleAddLabel}
                disabled={!newLabel.trim()}
                className="flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                添加
              </Button>
            </div>
          </div>

          {/* 内容编辑/预览区域 */}
          <div className="flex-1 overflow-hidden">
            {isPreview ? (
              <div className="h-full overflow-y-auto p-6">
                <div
                  className="prose prose-gray dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: renderPreview(content),
                  }}
                />
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="开始编写您的笔记内容...

支持Markdown语法：
# 标题
## 二级标题
**粗体** *斜体*
* 列表项"
                className="w-full h-full p-6 border-none outline-none resize-none bg-transparent text-gray-900 dark:text-github-text placeholder-gray-400 dark:placeholder-github-text-secondary font-mono text-sm leading-relaxed"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

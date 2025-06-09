import React, { useState, useEffect } from "react";
import {
  Save,
  ArrowLeft,
  Eye,
  Edit3,
  Trash2,
  Tag,
  Plus,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Button from "../ui/Button";
import { useAppStore } from "../../stores/appStore";
import { githubService } from "../../services/github";

export const EditorPage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { selectedRepo, currentNote, setCurrentPage, setCurrentNote } =
    useAppStore();

  /**
   * 初始化编辑器数据
   */
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setLabels(currentNote.labels.map((label) => label.name));
    } else {
      // 新建笔记
      setTitle("");
      setContent("");
      setLabels([]);
    }
  }, [currentNote]);

  /**
   * 保存笔记
   */
  const handleSave = async () => {
    if (!selectedRepo || !title.trim()) {
      setError("请输入笔记标题");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      const [owner, repo] = selectedRepo.full_name.split("/");

      if (currentNote) {
        // 更新现有笔记
        await githubService.updateIssue(
          owner,
          repo,
          currentNote.githubIssue.number,
          title.trim(),
          content.trim(),
          labels
        );
      } else {
        // 创建新笔记
        const newIssue = await githubService.createIssue(
          owner,
          repo,
          title.trim(),
          content.trim(),
          labels
        );

        // 更新当前笔记状态
        setCurrentNote({
          id: newIssue.id,
          title: newIssue.title,
          content: newIssue.body || "",
          labels: newIssue.labels,
          createdAt: newIssue.created_at,
          updatedAt: newIssue.updated_at,
          githubIssue: newIssue,
        });
      }

      setSuccess(true);

      // 延迟显示成功消息后回到笔记列表
      setTimeout(() => {
        setCurrentPage("notes");
      }, 1000);
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
    setCurrentPage("notes");
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

  if (!selectedRepo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-github-bg flex items-center justify-center">
        <div className="text-center">
          <Edit3 className="w-16 h-16 text-gray-400 dark:text-github-text-secondary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-github-text mb-2">
            未选择仓库
          </h2>
          <p className="text-gray-600 dark:text-github-text-secondary mb-4">
            请先选择一个仓库来存储您的笔记
          </p>
          <Button onClick={() => setCurrentPage("repos")}>选择仓库</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-github-bg">
      {/* 头部导航 */}
      <header className="bg-white dark:bg-github-surface border-b border-gray-200 dark:border-github-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
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
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 错误和成功提示 */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-6">
            <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
            <p className="text-green-700 dark:text-green-400">
              笔记保存成功！正在返回列表...
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-github-surface rounded-lg shadow-sm border border-gray-200 dark:border-github-border">
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

            <div className="flex flex-wrap gap-2 mb-3">
              {labels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                >
                  {label}
                  <button
                    onClick={() => handleRemoveLabel(label)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="添加标签..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-github-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-github-accent-emphasis bg-white dark:bg-github-surface text-gray-900 dark:text-github-text placeholder-gray-400 dark:placeholder-github-text-secondary"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddLabel}
                disabled={!newLabel.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 内容编辑/预览区域 */}
          <div className="p-6">
            {isPreview ? (
              <div className="min-h-[400px]">
                <div className="prose dark:prose-invert max-w-none">
                  {content ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: renderPreview(content),
                      }}
                    />
                  ) : (
                    <p className="text-gray-500 dark:text-github-text-secondary italic">
                      暂无内容预览
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="开始编写您的笔记内容... 支持Markdown语法"
                className="w-full h-[400px] border-none outline-none resize-none bg-transparent text-gray-900 dark:text-github-text placeholder-gray-400 dark:placeholder-github-text-secondary font-mono text-sm leading-relaxed"
              />
            )}
          </div>
        </div>

        {/* 快捷键提示 */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            快捷键提示
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <p>• Ctrl/Cmd + S: 保存笔记</p>
            <p>• Ctrl/Cmd + P: 切换预览模式</p>
            <p>• 支持标准 Markdown 语法：**粗体**、*斜体*、# 标题等</p>
          </div>
        </div>
      </main>
    </div>
  );
};
 
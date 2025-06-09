import React, { useState, useEffect } from "react";
import { useAppStore } from "../../stores/appStore";
import { EnhancedMarkdownRenderer } from "../ui/EnhancedMarkdownRenderer";
import Button from "../ui/Button";
import {
  ArrowLeft,
  Edit,
  MessageSquare,
  User,
  Calendar,
  Tag,
  ExternalLink,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { githubService } from "../../services/github";

interface Comment {
  id: number;
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  created_at: string;
  updated_at: string;
  body: string;
  html_url: string;
}

interface NoteDetailViewProps {
  noteId: string;
  onBack: () => void;
  onEdit: () => void;
}

/**
 * 笔记详情页组件
 * 模拟GitHub Issues的详情页体验，包含评论功能
 */
export const NoteDetailView: React.FC<NoteDetailViewProps> = ({
  noteId,
  onBack,
  onEdit,
}) => {
  const { notes, selectedRepo, theme, user } = useAppStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 判断是否为深色模式
  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // 获取当前笔记
  const currentNote = notes.find((note) => note.id.toString() === noteId);

  /**
   * 加载评论
   */
  const loadComments = async () => {
    if (!currentNote || !selectedRepo) return;

    try {
      setIsLoadingComments(true);
      setError(null);

      const response = await githubService.getIssueComments(
        selectedRepo.owner.login,
        selectedRepo.name,
        currentNote.githubIssue.number
      );

      setComments(response);
    } catch (error) {
      console.error("加载评论失败:", error);
      setError("加载评论失败，请稍后重试");
    } finally {
      setIsLoadingComments(false);
    }
  };

  /**
   * 发表评论
   */
  const postComment = async () => {
    if (!newComment.trim() || !currentNote || !selectedRepo) return;

    try {
      setIsPostingComment(true);
      setError(null);

      const comment = await githubService.createIssueComment(
        selectedRepo.owner.login,
        selectedRepo.name,
        currentNote.githubIssue.number,
        newComment
      );

      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (error) {
      console.error("发表评论失败:", error);
      setError("发表评论失败，请检查网络连接和权限");
    } finally {
      setIsPostingComment(false);
    }
  };

  /**
   * 处理键盘快捷键
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      postComment();
    }
  };

  /**
   * 格式化时间
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? "刚刚" : `${minutes}分钟前`;
      }
      return `${hours}小时前`;
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString("zh-CN");
    }
  };

  // 组件挂载时加载评论
  useEffect(() => {
    loadComments();
  }, [currentNote, selectedRepo]);

  if (!currentNote) {
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
          <Button onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-github-canvas-default">
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-github-border bg-white dark:bg-github-surface">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>

          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-github-text-secondary">
            <span>#{currentNote.githubIssue.number}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(currentNote.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={currentNote.githubIssue.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-100 dark:hover:bg-github-border rounded"
            title="在GitHub中查看"
          >
            <ExternalLink className="w-4 h-4 text-gray-600 dark:text-github-text-secondary" />
          </a>

          <Button onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            编辑
          </Button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* 笔记标题和元数据 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-github-text mb-4">
              {currentNote.title}
            </h1>

            {/* 标签 */}
            {currentNote.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {currentNote.labels.map((label) => (
                  <span
                    key={label.id}
                    className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-full"
                    style={{
                      backgroundColor: `#${label.color}20`,
                      color: `#${label.color}`,
                      border: `1px solid #${label.color}40`,
                    }}
                  >
                    <Tag className="w-3 h-3" />
                    {label.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-github-text-secondary">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>由 {currentNote.githubIssue.user.login} 创建</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>{comments.length} 条评论</span>
              </div>
            </div>
          </div>

          {/* 笔记内容 */}
          <div className="bg-gray-50 dark:bg-github-surface border border-gray-200 dark:border-github-border rounded-lg p-6 mb-6">
            <EnhancedMarkdownRenderer
              content={currentNote.content || "此笔记暂无内容"}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* 评论区域 */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-github-text flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              评论 ({comments.length})
            </h3>

            {/* 加载中状态 */}
            {isLoadingComments && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500 dark:text-github-text-secondary">
                  加载评论中...
                </span>
              </div>
            )}

            {/* 评论列表 */}
            {!isLoadingComments && comments.length > 0 && (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white dark:bg-github-surface border border-gray-200 dark:border-github-border rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={comment.user.avatar_url}
                        alt={comment.user.login}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <a
                            href={comment.user.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {comment.user.login}
                          </a>
                          <span className="text-sm text-gray-500 dark:text-github-text-secondary">
                            {formatDate(comment.created_at)}
                          </span>
                          {comment.created_at !== comment.updated_at && (
                            <span className="text-sm text-gray-400 dark:text-github-text-secondary">
                              (已编辑)
                            </span>
                          )}
                        </div>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <EnhancedMarkdownRenderer
                            content={comment.body}
                            isDarkMode={isDarkMode}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 无评论状态 */}
            {!isLoadingComments && comments.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-github-text-secondary">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>还没有评论，成为第一个评论的人吧！</p>
              </div>
            )}

            {/* 发表评论 */}
            {user && (
              <div className="bg-white dark:bg-github-surface border border-gray-200 dark:border-github-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={user.avatar_url}
                    alt={user.login}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="添加评论... (支持Markdown格式)"
                      className="w-full min-h-[100px] p-3 border border-gray-300 dark:border-github-border rounded-md resize-none bg-white dark:bg-github-canvas-default text-gray-900 dark:text-github-text placeholder-gray-500 dark:placeholder-github-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-gray-500 dark:text-github-text-secondary">
                        支持Markdown格式 • Ctrl+Enter 快速发送
                      </span>
                      <Button
                        onClick={postComment}
                        disabled={!newComment.trim() || isPostingComment}
                      >
                        {isPostingComment ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        {isPostingComment ? "发送中..." : "发表评论"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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

export default NoteDetailView;

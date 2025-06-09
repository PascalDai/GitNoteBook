import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Trash2,
  Calendar,
  MessageCircle,
  Tag,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  AlertCircle,
  FileText,
  ArrowLeft,
} from "lucide-react";
import Button from "../ui/Button";
import { useAppStore } from "../../stores/appStore";
import { githubService } from "../../services/github";
import { isTokenError, getRetryButtonText } from "../../utils/errorHelpers";
import type { GitHubIssue } from "../../types";

export const NotesPage: React.FC = () => {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<GitHubIssue[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<"all" | "open" | "closed">(
    "all"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { user, selectedRepo, setCurrentPage, currentNote, setCurrentNote } =
    useAppStore();

  /**
   * 加载Issues列表
   */
  const loadIssues = async () => {
    if (!selectedRepo) return;

    try {
      setIsLoading(true);
      setError(null);

      const [owner, repo] = selectedRepo.full_name.split("/");
      const repoIssues = await githubService.getRepoIssues(owner, repo);

      setIssues(repoIssues);
      setFilteredIssues(repoIssues);
    } catch (err: any) {
      setError(err.message || "加载笔记失败");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 搜索和筛选Issues
   */
  const applyFilters = () => {
    let filtered = issues;

    // 按状态筛选
    if (filterState !== "all") {
      filtered = filtered.filter((issue) => issue.state === filterState);
    }

    // 按搜索关键词筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(query) ||
          (issue.body && issue.body.toLowerCase().includes(query)) ||
          issue.labels.some((label) => label.name.toLowerCase().includes(query))
      );
    }

    setFilteredIssues(filtered);
  };

  /**
   * 处理搜索
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  /**
   * 处理状态筛选
   */
  const handleFilterChange = (state: "all" | "open" | "closed") => {
    setFilterState(state);
  };

  /**
   * 选择笔记进入编辑模式
   */
  const handleNoteSelect = (issue: GitHubIssue) => {
    setCurrentNote({
      id: issue.id,
      title: issue.title,
      content: issue.body || "",
      labels: issue.labels,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      githubIssue: issue,
    });
    setCurrentPage("editor");
  };

  /**
   * 创建新笔记
   */
  const handleCreateNote = () => {
    setCurrentNote(null);
    setCurrentPage("editor");
  };

  /**
   * 格式化日期
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "今天";
    } else if (diffDays === 1) {
      return "昨天";
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  /**
   * 获取标签颜色
   */
  const getLabelColor = (color: string) => {
    return color.startsWith("#") ? color : `#${color}`;
  };

  /**
   * 返回仓库选择页面
   */
  const handleBackToRepos = () => {
    setCurrentPage("repos");
  };

  /**
   * 智能重试逻辑
   */
  const handleRetry = () => {
    // 检查是否是Token相关错误
    if (error && isTokenError(error)) {
      // Token相关错误，跳转到认证页面
      setCurrentPage("auth");
    } else {
      // 其他错误，重新尝试加载
      loadIssues();
    }
  };

  // 监听搜索和筛选变化
  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterState, issues]);

  // 组件挂载时加载Issues
  useEffect(() => {
    loadIssues();
  }, [selectedRepo]);

  // 如果没有选择仓库，跳转到仓库选择页面
  if (!selectedRepo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-github-bg flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 dark:text-github-text-secondary mx-auto mb-4" />
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
                onClick={handleBackToRepos}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                选择其他仓库
              </Button>

              <div className="flex items-center space-x-3">
                {user?.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt={user.name || user.login}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-github-text">
                    {selectedRepo.name}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-github-text-secondary">
                    {selectedRepo.description || "笔记仓库"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={loadIssues}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                刷新
              </Button>

              <Button
                onClick={handleCreateNote}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新建笔记
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 搜索和筛选栏 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-github-text-secondary w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="搜索笔记标题、内容或标签..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-github-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-github-accent-emphasis focus:border-github-accent-emphasis bg-white dark:bg-github-surface text-gray-900 dark:text-github-text placeholder-gray-400 dark:placeholder-github-text-secondary"
            />
          </div>

          {/* 状态筛选 */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400 dark:text-github-text-secondary" />
            <select
              value={filterState}
              onChange={(e) =>
                handleFilterChange(e.target.value as "all" | "open" | "closed")
              }
              className="px-3 py-2 border border-gray-300 dark:border-github-border rounded-lg bg-white dark:bg-github-surface text-gray-900 dark:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent-emphasis"
            >
              <option value="all">全部状态</option>
              <option value="open">进行中</option>
              <option value="closed">已完成</option>
            </select>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-github-text-secondary">
            <span>共 {issues.length} 条笔记</span>
            <span>
              进行中 {issues.filter((i) => i.state === "open").length}
            </span>
            <span>
              已完成 {issues.filter((i) => i.state === "closed").length}
            </span>
            {searchQuery && <span>筛选结果 {filteredIssues.length}</span>}
          </div>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-github-accent" />
              <span className="text-gray-600 dark:text-github-text-secondary">
                正在加载笔记...
              </span>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700 dark:text-red-400 font-medium">
                加载失败
              </p>
              <p className="text-red-600 dark:text-red-500 text-sm">{error}</p>
              {isTokenError(error) && (
                <p className="text-red-600 dark:text-red-500 text-xs mt-1">
                  请检查您的GitHub Token是否有效
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleRetry}
              className="ml-auto flex items-center gap-2"
            >
              {isTokenError(error) ? (
                <>
                  <ArrowLeft className="w-4 h-4" />
                  {getRetryButtonText(error)}
                </>
              ) : (
                getRetryButtonText(error)
              )}
            </Button>
          </div>
        )}

        {/* 笔记列表 */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 dark:text-github-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-github-text mb-2">
                  {searchQuery ? "未找到匹配的笔记" : "还没有笔记"}
                </h3>
                <p className="text-gray-600 dark:text-github-text-secondary mb-4">
                  {searchQuery
                    ? "请尝试其他搜索关键词"
                    : "开始创建您的第一条笔记吧"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={handleCreateNote}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    创建第一条笔记
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => handleNoteSelect(issue)}
                    className="p-6 bg-white dark:bg-github-surface border border-gray-200 dark:border-github-border rounded-lg hover:shadow-md hover:border-gray-300 dark:hover:border-github-border-hover cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* 标题和状态 */}
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-github-text truncate">
                            {issue.title}
                          </h3>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                issue.state === "open"
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                  : "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                              }`}
                            >
                              {issue.state === "open" ? "进行中" : "已完成"}
                            </span>
                          </div>
                        </div>

                        {/* 笔记预览 */}
                        {issue.body && (
                          <p className="text-gray-600 dark:text-github-text-secondary mb-3 line-clamp-2">
                            {issue.body.length > 150
                              ? `${issue.body.substring(0, 150)}...`
                              : issue.body}
                          </p>
                        )}

                        {/* 标签 */}
                        {issue.labels.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {issue.labels.slice(0, 5).map((label) => (
                              <span
                                key={label.id}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full"
                                style={{
                                  backgroundColor: `${getLabelColor(
                                    label.color
                                  )}20`,
                                  color: getLabelColor(label.color),
                                  borderColor: `${getLabelColor(
                                    label.color
                                  )}40`,
                                  borderWidth: "1px",
                                }}
                              >
                                <Tag className="w-3 h-3" />
                                {label.name}
                              </span>
                            ))}
                            {issue.labels.length > 5 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                                +{issue.labels.length - 5}
                              </span>
                            )}
                          </div>
                        )}

                        {/* 元信息 */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-github-text-secondary">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>创建于 {formatDate(issue.created_at)}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Edit3 className="w-4 h-4" />
                            <span>更新于 {formatDate(issue.updated_at)}</span>
                          </div>

                          {issue.comments > 0 && (
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{issue.comments} 评论</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 dark:text-github-text-secondary dark:hover:text-github-text transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNoteSelect(issue);
                          }}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
 
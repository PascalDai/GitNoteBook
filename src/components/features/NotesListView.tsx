import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  FileText,
  Tag,
  Calendar,
  Edit3,
  MessageCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Button from "../ui/Button";
import { useAppStore } from "../../stores/appStore";
import { githubService } from "../../services/github";
import { isTokenError, getRetryButtonText } from "../../utils/errorHelpers";
import type { GitHubIssue, Note } from "../../types";

/**
 * 笔记列表视图组件
 */
export const NotesListView: React.FC = () => {
  const [filteredIssues, setFilteredIssues] = useState<GitHubIssue[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<"all" | "open" | "closed">(
    "all"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedRepo, notes, setNotes, setCurrentNote, setCurrentPage } =
    useAppStore();

  /**
   * 加载仓库的Issues（笔记）
   */
  const loadIssues = async () => {
    if (!selectedRepo) return;

    try {
      setIsLoading(true);
      setError(null);

      const [owner, repo] = selectedRepo.full_name.split("/");
      const repoIssues = await githubService.getRepoIssues(owner, repo);

      // 转换为Note格式并保存到全局状态
      const notesFromIssues: Note[] = repoIssues.map((issue) => ({
        id: issue.id,
        title: issue.title,
        content: issue.body || "",
        labels: issue.labels,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        githubIssue: issue,
      }));

      setNotes(notesFromIssues);
    } catch (err: any) {
      setError(err.message || "加载笔记失败");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 应用搜索和筛选
   */
  const applyFilters = () => {
    // 从notes转换为issues进行筛选
    const issues = notes
      .map((note) => note.githubIssue)
      .filter(Boolean) as GitHubIssue[];
    let filtered = issues;

    // 状态筛选
    if (filterState !== "all") {
      filtered = filtered.filter((issue) => issue.state === filterState);
    }

    // 搜索筛选
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
    // 从全局状态中找到对应的note
    const note = notes.find((n) => n.id === issue.id);
    if (note) {
      setCurrentNote(note);
    } else {
      // 如果没找到，创建一个临时的note对象
      setCurrentNote({
        id: issue.id,
        title: issue.title,
        content: issue.body || "",
        labels: issue.labels,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        githubIssue: issue,
      });
    }
  };

  /**
   * 创建新笔记
   */
  const handleCreateNote = () => {
    // 创建一个临时的新笔记对象来触发编辑器
    setCurrentNote({
      id: 0, // 临时ID，表示新笔记
      title: "",
      content: "",
      labels: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      githubIssue: null as any, // 新笔记还没有对应的GitHub Issue
    });
  };

  /**
   * 智能重试逻辑
   */
  const handleRetry = () => {
    if (error && isTokenError(error)) {
      setCurrentPage("auth");
    } else {
      loadIssues();
    }
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

  // 监听搜索和筛选变化，以及notes变化
  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterState, notes]);

  // 组件挂载时加载Issues
  useEffect(() => {
    loadIssues();
  }, [selectedRepo]);

  return (
    <div className="h-full bg-white dark:bg-github-bg flex flex-col">
      {/* 头部 */}
      <div className="border-b border-gray-200 dark:border-github-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-github-text">
              {selectedRepo?.name}
            </h1>
            <p className="text-gray-600 dark:text-github-text-secondary">
              {selectedRepo?.description || "笔记仓库"}
            </p>
          </div>

          <Button
            onClick={handleCreateNote}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新建笔记
          </Button>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-github-text-secondary w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="搜索笔记标题、内容或标签..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-github-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-github-accent-emphasis focus:border-github-accent-emphasis bg-white dark:bg-github-canvas-default text-gray-900 dark:text-github-text placeholder-gray-400 dark:placeholder-github-text-secondary"
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
              className="px-3 py-2 border border-gray-300 dark:border-github-border rounded-lg bg-white dark:bg-github-canvas-default text-gray-900 dark:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent-emphasis"
            >
              <option value="all">全部状态</option>
              <option value="open">进行中</option>
              <option value="closed">已完成</option>
            </select>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-github-text-secondary mt-4">
          <span>共 {notes.length} 条笔记</span>
          <span>
            进行中 {notes.filter((n) => n.githubIssue?.state === "open").length}
          </span>
          <span>
            已完成{" "}
            {notes.filter((n) => n.githubIssue?.state === "closed").length}
          </span>
          {searchQuery && <span>筛选结果 {filteredIssues.length}</span>}
        </div>
      </div>

      {/* 主要内容 */}
      <div className="flex-1 overflow-y-auto p-6">
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
      </div>
    </div>
  );
};

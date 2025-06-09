import React, { useState, useEffect } from "react";
import {
  Search,
  GitBranch,
  Star,
  GitFork,
  Lock,
  Unlock,
  Calendar,
  CheckCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import Button from "../ui/Button";
import { useAppStore } from "../../stores/appStore";
import { githubService } from "../../services/github";
import { isTokenError, getRetryButtonText } from "../../utils/errorHelpers";
import type { GitHubRepo } from "../../types";

interface RepoSidebarProps {
  collapsed: boolean;
}

/**
 * 仓库侧边栏组件
 */
export const RepoSidebar: React.FC<RepoSidebarProps> = ({ collapsed }) => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    token,
    selectedRepo,
    setSelectedRepo,
    setCurrentPage,
    setNotes,
    setCurrentNote,
  } = useAppStore();

  /**
   * 加载用户的仓库列表
   */
  const loadRepos = async () => {
    if (!token) {
      setError("GitHub token not set");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 确保GitHub服务已设置Token
      githubService.setToken(token);

      const userRepos = await githubService.getUserRepos();
      setRepos(userRepos);
      setFilteredRepos(userRepos);
    } catch (err: any) {
      setError(err.message || "加载仓库列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 搜索仓库
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredRepos(repos);
      return;
    }

    const filtered = repos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(query.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(query.toLowerCase()) ||
        (repo.description &&
          repo.description.toLowerCase().includes(query.toLowerCase()))
    );

    setFilteredRepos(filtered);
  };

  /**
   * 选择仓库
   */
  const handleRepoSelect = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    // 清空当前笔记状态，准备加载新仓库的笔记
    setNotes([]);
    setCurrentNote(null);
  };

  /**
   * 智能重试逻辑
   */
  const handleRetry = () => {
    if (error && isTokenError(error)) {
      setCurrentPage("auth");
    } else {
      loadRepos();
    }
  };

  /**
   * 格式化日期
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // 组件挂载时加载仓库，当token变化时重新加载
  useEffect(() => {
    loadRepos();
  }, [token]);

  // 如果Sidebar折叠，只显示简化版本
  if (collapsed) {
    return (
      <div className="p-2">
        {selectedRepo && (
          <div className="mb-2">
            <div className="w-12 h-12 bg-github-accent-emphasis rounded-lg flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-white" />
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-github-accent" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 搜索栏 */}
      <div className="p-4 border-b border-gray-200 dark:border-github-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-github-text-secondary w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="搜索仓库..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-github-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-github-accent-emphasis focus:border-github-accent-emphasis bg-white dark:bg-github-canvas-default text-gray-900 dark:text-github-text placeholder-gray-400 dark:placeholder-github-text-secondary"
          />
        </div>
      </div>

      {/* 仓库列表 */}
      <div className="flex-1 overflow-y-auto">
        {/* 加载状态 */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-github-accent" />
              <span className="text-sm text-gray-600 dark:text-github-text-secondary">
                加载中...
              </span>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="p-4">
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                  加载失败
                </p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                  {error}
                </p>
                {isTokenError(error) && (
                  <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                    请检查您的GitHub Token是否有效
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleRetry}
              className="w-full mt-2 text-sm"
            >
              {isTokenError(error) ? (
                <>
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  {getRetryButtonText(error)}
                </>
              ) : (
                getRetryButtonText(error)
              )}
            </Button>
          </div>
        )}

        {/* 仓库列表 */}
        {!isLoading && !error && (
          <div className="p-2">
            {filteredRepos.length === 0 ? (
              <div className="text-center py-8">
                <GitBranch className="w-12 h-12 text-gray-400 dark:text-github-text-secondary mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-github-text-secondary">
                  {searchQuery ? "未找到匹配的仓库" : "暂无仓库"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    onClick={() => handleRepoSelect(repo)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
                      selectedRepo?.id === repo.id
                        ? "border-github-accent-emphasis bg-blue-50 dark:bg-blue-900/10"
                        : "border-gray-200 dark:border-github-border bg-white dark:bg-github-surface hover:border-gray-300 dark:hover:border-github-border-hover"
                    }`}
                  >
                    {/* 仓库名称和状态 */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        {repo.private ? (
                          <Lock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        ) : (
                          <Unlock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        )}
                        <h3 className="text-sm font-medium text-gray-900 dark:text-github-text truncate">
                          {repo.name}
                        </h3>
                      </div>

                      {selectedRepo?.id === repo.id && (
                        <CheckCircle className="w-4 h-4 text-github-accent-emphasis flex-shrink-0" />
                      )}
                    </div>

                    {/* 仓库描述 */}
                    {repo.description && (
                      <p className="text-xs text-gray-600 dark:text-github-text-secondary mb-2 line-clamp-2">
                        {repo.description}
                      </p>
                    )}

                    {/* 仓库统计信息 */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-github-text-secondary">
                      {repo.language && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span>{repo.language}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        <span>{repo.stargazers_count}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <GitFork className="w-3 h-3" />
                        <span>{repo.forks_count}</span>
                      </div>
                    </div>

                    {/* 更新时间 */}
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-github-text-secondary">
                      <Calendar className="w-3 h-3" />
                      <span>更新于 {formatDate(repo.updated_at)}</span>
                    </div>

                    {/* 仓库主题标签 */}
                    {repo.topics && repo.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {repo.topics.slice(0, 3).map((topic) => (
                          <span
                            key={topic}
                            className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded"
                          >
                            {topic}
                          </span>
                        ))}
                        {repo.topics.length > 3 && (
                          <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                            +{repo.topics.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部刷新按钮 */}
      {!collapsed && !isLoading && !error && (
        <div className="border-t border-gray-200 dark:border-github-border p-4">
          <Button
            variant="outline"
            onClick={loadRepos}
            className="w-full flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            刷新仓库列表
          </Button>
        </div>
      )}
    </div>
  );
};

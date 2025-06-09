import React, { useState, useEffect } from "react";
import {
  Search,
  GitBranch,
  Star,
  Eye,
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

export const RepoSelectionPage: React.FC = () => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);

  const { user, selectedRepo, setSelectedRepo, setCurrentPage } = useAppStore();

  /**
   * 加载用户的仓库列表
   */
  const loadRepos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userRepos = await githubService.getUserRepos();
      setRepos(userRepos);
      setFilteredRepos(userRepos);

      // 如果已经有选中的仓库，设置为选中状态
      if (selectedRepo) {
        setSelectedRepoId(selectedRepo.id);
      }
    } catch (err: any) {
      setError(err.message || "加载仓库列表失败");
    } finally {
      setIsLoading(false);
    }
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
      loadRepos();
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
    setSelectedRepoId(repo.id);
    setSelectedRepo(repo);
  };

  /**
   * 确认选择并进入笔记页面
   */
  const handleContinue = () => {
    if (selectedRepo) {
      setCurrentPage("notes");
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

  /**
   * 格式化文件大小
   */
  const formatSize = (sizeKB: number) => {
    if (sizeKB < 1024) return `${sizeKB} KB`;
    const sizeMB = sizeKB / 1024;
    if (sizeMB < 1024) return `${sizeMB.toFixed(1)} MB`;
    const sizeGB = sizeMB / 1024;
    return `${sizeGB.toFixed(1)} GB`;
  };

  // 组件挂载时加载仓库
  useEffect(() => {
    loadRepos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-github-bg">
      {/* 头部导航 */}
      <header className="bg-white dark:bg-github-surface border-b border-gray-200 dark:border-github-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentPage("home")}
                className="flex items-center gap-2 text-gray-600 dark:text-github-text-secondary hover:text-gray-900 dark:hover:text-github-text"
              >
                <ArrowLeft className="w-4 h-4" />
                返回首页
              </Button>
              <div className="flex items-center space-x-2">
                {user?.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt={user.name || user.login}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-github-text">
                    选择仓库
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-github-text-secondary">
                    选择一个仓库来存储您的笔记
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={loadRepos}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                刷新
              </Button>

              {selectedRepo && (
                <Button
                  onClick={handleContinue}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  继续
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* 搜索栏 */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-github-text-secondary w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="搜索仓库名称或描述..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-github-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-github-accent-emphasis focus:border-github-accent-emphasis bg-white dark:bg-github-surface text-gray-900 dark:text-github-text placeholder-gray-400 dark:placeholder-github-text-secondary"
            />
          </div>
        </div>

        {/* 当前选择的仓库 */}
        {selectedRepo && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-800 dark:text-green-300">
                已选择仓库
              </span>
            </div>
            <div className="flex items-center gap-3">
              {selectedRepo.private ? (
                <Lock className="w-4 h-4 text-gray-500" />
              ) : (
                <Unlock className="w-4 h-4 text-gray-500" />
              )}
              <span className="font-medium text-gray-900 dark:text-github-text">
                {selectedRepo.full_name}
              </span>
              {selectedRepo.description && (
                <span className="text-gray-600 dark:text-github-text-secondary">
                  - {selectedRepo.description}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-github-accent" />
              <span className="text-gray-600 dark:text-github-text-secondary">
                正在加载仓库列表...
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

        {/* 仓库列表 */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {filteredRepos.length === 0 ? (
              <div className="text-center py-12">
                <GitBranch className="w-16 h-16 text-gray-400 dark:text-github-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-github-text mb-2">
                  {searchQuery ? "未找到匹配的仓库" : "暂无仓库"}
                </h3>
                <p className="text-gray-600 dark:text-github-text-secondary">
                  {searchQuery
                    ? "请尝试其他搜索关键词"
                    : "您还没有任何仓库，请先在GitHub上创建一个仓库"}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600 dark:text-github-text-secondary">
                    找到 {filteredRepos.length} 个仓库
                  </span>
                </div>

                <div className="grid gap-4">
                  {filteredRepos.map((repo) => (
                    <div
                      key={repo.id}
                      onClick={() => handleRepoSelect(repo)}
                      className={`p-6 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedRepoId === repo.id
                          ? "border-github-accent-emphasis bg-blue-50 dark:bg-blue-900/10"
                          : "border-gray-200 dark:border-github-border bg-white dark:bg-github-surface hover:border-gray-300 dark:hover:border-github-border-hover"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {/* 仓库名称和状态 */}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              {repo.private ? (
                                <Lock className="w-4 h-4 text-gray-500" />
                              ) : (
                                <Unlock className="w-4 h-4 text-gray-500" />
                              )}
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-github-text truncate">
                                {repo.name}
                              </h3>
                              <span className="text-sm text-gray-500 dark:text-github-text-secondary">
                                {repo.private ? "Private" : "Public"}
                              </span>
                            </div>

                            {selectedRepoId === repo.id && (
                              <CheckCircle className="w-5 h-5 text-github-accent-emphasis flex-shrink-0" />
                            )}
                          </div>

                          {/* 仓库描述 */}
                          {repo.description && (
                            <p className="text-gray-600 dark:text-github-text-secondary mb-3 line-clamp-2">
                              {repo.description}
                            </p>
                          )}

                          {/* 仓库统计信息 */}
                          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-github-text-secondary">
                            {repo.language && (
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span>{repo.language}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              <span>{repo.stargazers_count}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <GitFork className="w-4 h-4" />
                              <span>{repo.forks_count}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>更新于 {formatDate(repo.updated_at)}</span>
                            </div>

                            {repo.size > 0 && (
                              <div className="flex items-center gap-1">
                                <span>{formatSize(repo.size)}</span>
                              </div>
                            )}
                          </div>

                          {/* 仓库主题标签 */}
                          {repo.topics && repo.topics.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {repo.topics.slice(0, 5).map((topic) => (
                                <span
                                  key={topic}
                                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
                                >
                                  {topic}
                                </span>
                              ))}
                              {repo.topics.length > 5 && (
                                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                                  +{repo.topics.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

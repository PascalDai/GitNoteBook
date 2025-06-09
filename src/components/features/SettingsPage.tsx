import React, { useState } from "react";
import {
  ArrowLeft,
  Key,
  Save,
  CheckCircle,
  Loader2,
  AlertCircle,
  Github,
  Settings,
} from "lucide-react";
import Button from "../ui/Button";
import { useAppStore } from "../../stores/appStore";
import { githubService } from "../../services/github";

/**
 * 设置页面组件
 */
export const SettingsPage: React.FC = () => {
  const {
    token: currentToken,
    user,
    setCurrentPage,
    setToken,
    setUser,
    setAuthenticated,
  } = useAppStore();

  const [newToken, setNewToken] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * 更新Token
   */
  const handleUpdateToken = async () => {
    if (!newToken.trim()) {
      setError("请输入新的GitHub Personal Access Token");
      return;
    }

    setIsValidating(true);
    setError(null);
    setSuccess(false);

    try {
      // 验证新Token
      githubService.setToken(newToken.trim());
      const newUser = await githubService.validateTokenAndGetUser();

      // 更新状态
      setToken(newToken.trim());
      setUser(newUser);
      setAuthenticated(true);
      setSuccess(true);
      setNewToken("");

      // 延迟显示成功消息
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Token验证失败，请检查Token是否正确");
      setSuccess(false);
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * 处理Enter键
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isValidating) {
      handleUpdateToken();
    }
  };

  /**
   * 返回主页面
   */
  const handleBack = () => {
    setCurrentPage("home");
  };

  return (
    <div className="h-full bg-white dark:bg-github-bg flex flex-col">
      {/* 头部 */}
      <div className="border-b border-gray-200 dark:border-github-border p-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>

          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-gray-600 dark:text-github-text-secondary" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-github-text">
              设置
            </h1>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* 当前用户信息 */}
          {user && (
            <div className="bg-white dark:bg-github-surface rounded-lg shadow-sm border border-gray-200 dark:border-github-border p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-github-text mb-4">
                当前用户
              </h2>

              <div className="flex items-center space-x-4">
                <img
                  src={user.avatar_url}
                  alt={user.name || user.login}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-github-text">
                    {user.name || user.login}
                  </h3>
                  <p className="text-gray-600 dark:text-github-text-secondary">
                    @{user.login}
                  </p>
                  {user.bio && (
                    <p className="text-sm text-gray-500 dark:text-github-text-secondary mt-1">
                      {user.bio}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-github-text">
                    {user.public_repos}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-github-text-secondary">
                    仓库
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-github-text">
                    {user.followers}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-github-text-secondary">
                    关注者
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-github-text">
                    {user.following}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-github-text-secondary">
                    关注中
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Token管理 */}
          <div className="bg-white dark:bg-github-surface rounded-lg shadow-sm border border-gray-200 dark:border-github-border p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-github-text mb-4">
              GitHub Token 管理
            </h2>

            {/* 当前Token状态 */}
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-300">
                  Token 已配置
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400">
                当前Token:{" "}
                {currentToken ? `${currentToken.substring(0, 8)}...` : "未设置"}
              </p>
            </div>

            {/* 更新Token */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="newToken"
                  className="block text-sm font-medium text-gray-700 dark:text-github-text mb-2"
                >
                  更新 GitHub Personal Access Token
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400 dark:text-github-text-secondary" />
                  </div>
                  <input
                    id="newToken"
                    type="password"
                    value={newToken}
                    onChange={(e) => setNewToken(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    disabled={isValidating}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-github-border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-github-text-secondary focus:outline-none focus:ring-2 focus:ring-github-accent-emphasis focus:border-github-accent-emphasis bg-white dark:bg-github-surface text-gray-900 dark:text-github-text disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* 错误信息 */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* 成功信息 */}
              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Token更新成功！
                  </p>
                </div>
              )}

              {/* 更新按钮 */}
              <Button
                onClick={handleUpdateToken}
                disabled={isValidating || !newToken.trim() || success}
                className="w-full flex items-center justify-center gap-2 py-3"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    验证中...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    更新成功
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    更新Token
                  </>
                )}
              </Button>
            </div>

            {/* 帮助信息 */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                如何获取新的 Personal Access Token？
              </h3>
              <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
                <li>
                  访问 GitHub Settings → Developer settings → Personal access
                  tokens
                </li>
                <li>点击 "Generate new token (classic)"</li>
                <li>设置过期时间（建议选择较长时间，如90天或无过期）</li>
                <li className="font-medium">
                  <strong>重要：</strong>必须勾选
                  <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded mx-1">
                    repo
                  </code>
                  权限（完整的仓库访问权限）
                </li>
                <li>复制生成的 Token 并粘贴到上方输入框</li>
              </ol>

              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <strong>常见问题：</strong>如果保存笔记时出现"Resource not
                  accessible"错误，
                  说明Token缺少Issues权限，请重新生成Token并确保勾选了repo权限。
                </p>
              </div>

              <div className="mt-3">
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <Github className="w-4 h-4" />
                  前往 GitHub 设置
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* 应用信息 */}
          <div className="bg-white dark:bg-github-surface rounded-lg shadow-sm border border-gray-200 dark:border-github-border p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-github-text mb-4">
              应用信息
            </h2>

            <div className="space-y-3 text-sm text-gray-600 dark:text-github-text-secondary">
              <div className="flex justify-between">
                <span>应用名称:</span>
                <span className="font-medium">GitNoteBook</span>
              </div>
              <div className="flex justify-between">
                <span>版本:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>技术栈:</span>
                <span className="font-medium">Tauri + React + TypeScript</span>
              </div>
              <div className="flex justify-between">
                <span>数据存储:</span>
                <span className="font-medium">GitHub Issues</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

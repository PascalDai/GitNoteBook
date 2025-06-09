import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Github,
  Key,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Button from "../ui/Button";
import { useAppStore } from "../../stores/appStore";
import { githubService } from "../../services/github";

export const AuthPage: React.FC = () => {
  const {
    token: storeToken,
    isAuthenticated,
    setCurrentPage,
    setAuthenticated,
    setToken: setStoreToken,
    setUser,
  } = useAppStore();

  const [token, setToken] = useState(storeToken || "");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 页面加载时自动检查已保存的Token
  useEffect(() => {
    if (storeToken && !isAuthenticated) {
      setToken(storeToken);
      // 自动验证已保存的Token
      handleAutoLogin(storeToken);
    }
  }, [storeToken, isAuthenticated]);

  /**
   * 自动验证已保存的Token
   */
  const handleAutoLogin = async (savedToken: string) => {
    if (!savedToken.trim()) return;

    setIsValidating(true);
    setError(null);
    setSuccess(false);

    try {
      // 设置Token并验证
      githubService.setToken(savedToken.trim());
      const user = await githubService.validateTokenAndGetUser();

      // 验证成功，保存认证信息
      setAuthenticated(true);
      setUser(user);
      setSuccess(true);

      // 延迟跳转到仓库选择页面
      setTimeout(() => {
        setCurrentPage("repos");
      }, 1500);
    } catch (err: any) {
      // 自动验证失败时，清除已保存的Token
      setStoreToken(null);
      setToken("");
      setError("已保存的Token已过期，请重新输入");
      setSuccess(false);
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * 手动Token验证和登录
   */
  const handleLogin = async () => {
    if (!token.trim()) {
      setError("请输入GitHub Personal Access Token");
      return;
    }

    setIsValidating(true);
    setError(null);
    setSuccess(false);

    try {
      // 设置Token并验证
      githubService.setToken(token.trim());
      const user = await githubService.validateTokenAndGetUser();

      // 验证成功，保存认证信息
      setAuthenticated(true);
      setStoreToken(token.trim());
      setUser(user);
      setSuccess(true);

      // 延迟跳转到仓库选择页面
      setTimeout(() => {
        setCurrentPage("repos");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "验证失败，请检查Token是否正确");
      setSuccess(false);
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * 处理Enter键登录
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isValidating) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-github-bg flex flex-col">
      {/* 头部导航 */}
      <header className="bg-white dark:bg-github-surface border-b border-gray-200 dark:border-github-border px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setCurrentPage("home")}
            className="flex items-center gap-2 text-gray-600 dark:text-github-text-secondary hover:text-gray-900 dark:hover:text-github-text"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-github-text">
            GitHub 认证
          </h1>
          <div className="w-20" /> {/* 占位符保持居中 */}
        </div>
      </header>

      {/* 主要内容 */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* 认证卡片 */}
          <div className="bg-white dark:bg-github-surface rounded-lg shadow-lg border border-gray-200 dark:border-github-border p-8">
            {/* 图标和标题 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-github-accent-emphasis rounded-full mb-4">
                <Github className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-github-text mb-2">
                连接 GitHub
              </h2>
              <p className="text-gray-600 dark:text-github-text-secondary">
                输入您的 Personal Access Token 来开始使用
              </p>
            </div>

            {/* Token输入表单 */}
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="token"
                  className="block text-sm font-medium text-gray-700 dark:text-github-text mb-2"
                >
                  GitHub Personal Access Token
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400 dark:text-github-text-secondary" />
                  </div>
                  <input
                    id="token"
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    disabled={isValidating}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-github-border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-github-text-secondary focus:outline-none focus:ring-2 focus:ring-github-accent-emphasis focus:border-github-accent-emphasis bg-white dark:bg-github-canvas-default text-gray-900 dark:text-github-text disabled:opacity-50 disabled:cursor-not-allowed"
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
                    验证成功！正在跳转到笔记页面...
                  </p>
                </div>
              )}

              {/* 登录按钮 */}
              <Button
                onClick={handleLogin}
                disabled={isValidating || !token.trim() || success}
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
                    验证成功
                  </>
                ) : (
                  "验证并登录"
                )}
              </Button>

              {/* 如果有已保存的Token，显示清除按钮 */}
              {storeToken && !success && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStoreToken(null);
                    setToken("");
                    setError(null);
                  }}
                  disabled={isValidating}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm"
                >
                  使用新的Token
                </Button>
              )}
            </div>
          </div>

          {/* 帮助信息 */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-3">
              如何获取 Personal Access Token？
            </h3>
            <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-2 list-decimal list-inside">
              <li>
                访问 GitHub Settings → Developer settings → Personal access
                tokens
              </li>
              <li>点击 "Generate new token (classic)"</li>
              <li>设置过期时间（建议选择较长时间，如90天或无过期）</li>
              <li className="font-medium text-blue-900 dark:text-blue-200">
                <strong>重要：</strong>在权限范围中，必须勾选以下权限：
                <ul className="mt-2 ml-4 space-y-1 list-disc list-inside">
                  <li>
                    <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                      repo
                    </code>{" "}
                    - 完整的仓库访问权限
                  </li>
                  <li>
                    <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                      repo:status
                    </code>{" "}
                    - 仓库状态访问
                  </li>
                  <li>
                    <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                      repo_deployment
                    </code>{" "}
                    - 仓库部署
                  </li>
                  <li>
                    <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                      public_repo
                    </code>{" "}
                    - 公共仓库访问
                  </li>
                </ul>
              </li>
              <li>复制生成的 Token 并粘贴到上方输入框</li>
            </ol>

            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>注意：</strong>如果您看到"Resource not accessible by
                personal access token"错误，
                说明您的Token缺少Issues权限。请重新生成Token并确保勾选了
                <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">
                  repo
                </code>
                权限。
              </p>
            </div>

            <div className="mt-4">
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
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
      </main>
    </div>
  );
};

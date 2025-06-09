import React from "react";
import { Github, Moon, Sun, Monitor } from "lucide-react";
import { useAppStore } from "../../stores/appStore";
import Button from "../ui/Button";

/**
 * 首页组件
 */
const HomePage: React.FC = () => {
  const { theme, setTheme, setCurrentPage, isAuthenticated } = useAppStore();

  /**
   * 主题切换
   */
  const cycleTheme = () => {
    const themes: Array<"light" | "dark" | "system"> = [
      "light",
      "dark",
      "system",
    ];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  /**
   * 获取主题图标
   */
  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-5 h-5" />;
      case "dark":
        return <Moon className="w-5 h-5" />;
      case "system":
        return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-github-bg text-gray-900 dark:text-github-text transition-colors duration-200">
      {/* 头部导航 */}
      <header className="border-b border-gray-200 dark:border-github-border bg-white dark:bg-github-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Github className="w-8 h-8 text-github-accent" />
              <h1 className="text-xl font-bold">GitNoteBook</h1>
            </div>

            {/* 主题切换按钮 */}
            <button
              onClick={cycleTheme}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-github-border transition-colors duration-200"
              title={`当前主题: ${theme}`}
            >
              {getThemeIcon()}
            </button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="mb-8">
            <Github className="w-24 h-24 text-github-accent mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">欢迎使用 GitNoteBook</h2>
            <p className="text-lg text-gray-600 dark:text-github-muted mb-8">
              基于GitHub Issues的智能笔记管理系统
            </p>
          </div>

          {/* 功能卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-github-surface rounded-lg shadow-sm border border-gray-200 dark:border-github-border p-6">
              <div className="w-12 h-12 bg-github-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                <Github className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">GitHub集成</h3>
              <p className="text-gray-600 dark:text-github-muted">
                直接连接GitHub仓库，将Issues作为笔记存储
              </p>
            </div>

            <div className="bg-white dark:bg-github-surface rounded-lg shadow-sm border border-gray-200 dark:border-github-border p-6">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Markdown编辑</h3>
              <p className="text-gray-600 dark:text-github-muted">
                强大的编辑器，支持实时预览和语法高亮
              </p>
            </div>

            <div className="bg-white dark:bg-github-surface rounded-lg shadow-sm border border-gray-200 dark:border-github-border p-6">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">跨平台同步</h3>
              <p className="text-gray-600 dark:text-github-muted">
                基于Tauri的桌面应用，数据自动同步到GitHub
              </p>
            </div>
          </div>

          {/* 开始使用按钮 */}
          <div className="space-y-4">
            <Button
              onClick={() => setCurrentPage(isAuthenticated ? "repos" : "auth")}
              size="lg"
              className="px-8 py-3 text-lg"
            >
              {isAuthenticated ? "选择仓库" : "开始使用"}
            </Button>
            <p className="text-sm text-gray-500 dark:text-github-muted">
              需要GitHub Personal Access Token
            </p>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-gray-200 dark:border-github-border bg-white dark:bg-github-surface mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-github-muted">
            <p>© 2024 GitNoteBook. 基于 Tauri + React + GitHub API 构建</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

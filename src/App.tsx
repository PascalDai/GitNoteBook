import { useState, useEffect } from "react";
import { Github, Moon, Sun, Monitor } from "lucide-react";

function App() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [isDark, setIsDark] = useState(false);

  // 主题切换逻辑
  useEffect(() => {
    const updateTheme = () => {
      if (theme === "system") {
        const systemDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setIsDark(systemDark);
        document.documentElement.classList.toggle("dark", systemDark);
      } else {
        const dark = theme === "dark";
        setIsDark(dark);
        document.documentElement.classList.toggle("dark", dark);
      }
    };

    updateTheme();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", updateTheme);
      return () => mediaQuery.removeEventListener("change", updateTheme);
    }
  }, [theme]);

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
      {/* 测试Tailwind CSS */}
      <div className="p-4 bg-red-100 border border-red-300 text-red-800 mb-4">
        <p className="font-bold">Tailwind CSS 测试</p>
        <p>如果您看到这个红色的框，说明Tailwind CSS正在工作！</p>
      </div>

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
            <div className="card p-6">
              <div className="w-12 h-12 bg-github-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                <Github className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">GitHub集成</h3>
              <p className="text-gray-600 dark:text-github-muted">
                直接连接GitHub仓库，将Issues作为笔记存储
              </p>
            </div>

            <div className="card p-6">
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
                强大的Markdown编辑器，支持实时预览
              </p>
            </div>

            <div className="card p-6">
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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">标签管理</h3>
              <p className="text-gray-600 dark:text-github-muted">
                使用GitHub标签系统组织和分类笔记
              </p>
            </div>
          </div>

          {/* 开始按钮 */}
          <div className="space-y-4">
            <button className="btn-primary text-lg px-8 py-3">开始使用</button>
            <p className="text-sm text-gray-500 dark:text-github-muted">
              需要GitHub Personal Access Token进行认证
            </p>
          </div>
        </div>

        {/* 状态信息 */}
        <div className="mt-12 p-4 bg-gray-50 dark:bg-github-surface rounded-lg">
          <h3 className="text-lg font-semibold mb-2">项目状态</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-github-muted">
                技术栈:
              </span>
              <p className="font-medium">Tauri + React + Tailwind</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-github-muted">
                当前主题:
              </span>
              <p className="font-medium capitalize">{theme}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-github-muted">
                深色模式:
              </span>
              <p className="font-medium">{isDark ? "已启用" : "已禁用"}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-github-muted">
                状态:
              </span>
              <p className="font-medium text-green-600">开发中</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

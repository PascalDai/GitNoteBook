import { useEffect } from "react";
import { useAppStore } from "./stores/appStore";
import { MainLayout } from "./components/layout/MainLayout";
import HomePage from "./components/features/HomePage";

/**
 * 主应用组件
 */
function App() {
  const { theme, currentPage, isAuthenticated } = useAppStore();

  // 主题切换逻辑
  useEffect(() => {
    const updateTheme = () => {
      if (theme === "system") {
        const systemDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        document.documentElement.classList.toggle("dark", systemDark);
      } else {
        const dark = theme === "dark";
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

  // 如果未认证且不在认证页面，显示首页
  if (!isAuthenticated && currentPage !== "auth") {
    return <HomePage />;
  }

  // 已认证用户或在认证页面时，使用MainLayout
  return <MainLayout />;
}

export default App;

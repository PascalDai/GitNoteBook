import React, { useState } from "react";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Home,
  RefreshCw,
  Key,
  LogOut,
  Settings,
  Github,
} from "lucide-react";
import Button from "../ui/Button";
import { useAppStore } from "../../stores/appStore";
import { RepoSidebar } from "./RepoSidebar";
import { MainContent } from "./MainContent";

/**
 * 主布局组件 - 包含Sidebar和主内容区
 */
export const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, token, isAuthenticated, setCurrentPage, logout } =
    useAppStore();

  /**
   * 切换Sidebar折叠状态
   */
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  /**
   * 处理用户菜单操作
   */
  const handleUserMenuAction = (action: string) => {
    setUserMenuOpen(false);

    switch (action) {
      case "home":
        setCurrentPage("home");
        break;
      case "refresh":
        // 触发仓库列表刷新 - 这里可以添加具体的刷新逻辑
        // 暂时重新设置当前页面来触发重新加载
        setCurrentPage("home");
        setTimeout(() => setCurrentPage("repos"), 100);
        break;
      case "changeToken":
        setCurrentPage("auth");
        break;
      case "logout":
        logout();
        setCurrentPage("home");
        break;
      case "settings":
        setCurrentPage("settings");
        break;
    }
  };

  // 如果未认证或没有token，不渲染MainLayout
  if (!isAuthenticated || !token) {
    return null;
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-github-bg flex overflow-hidden">
      {/* 左侧Sidebar */}
      <div
        className={`bg-white dark:bg-github-surface border-r border-gray-200 dark:border-github-border flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-80"
        }`}
      >
        {/* Sidebar头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-github-border">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <Github className="w-6 h-6 text-github-accent" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-github-text">
                GitNoteBook
              </h1>
            </div>
          )}

          <Button variant="ghost" onClick={toggleSidebar} className="p-2">
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* 仓库列表区域 */}
        <div className="flex-1 overflow-hidden">
          <RepoSidebar collapsed={sidebarCollapsed} />
        </div>

        {/* 用户信息区域 */}
        {!sidebarCollapsed && user && (
          <div className="border-t border-gray-200 dark:border-github-border p-4">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-github-border transition-colors duration-200"
              >
                <img
                  src={user.avatar_url}
                  alt={user.name || user.login}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-github-text">
                    {user.name || user.login}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-github-text-secondary">
                    @{user.login}
                  </p>
                </div>
                <Menu className="w-4 h-4 text-gray-400" />
              </button>

              {/* 用户下拉菜单 */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-github-surface border border-gray-200 dark:border-github-border rounded-lg shadow-lg py-2 z-50">
                  <button
                    onClick={() => handleUserMenuAction("home")}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-github-text hover:bg-gray-100 dark:hover:bg-github-border"
                  >
                    <Home className="w-4 h-4" />
                    <span>返回首页</span>
                  </button>

                  <button
                    onClick={() => handleUserMenuAction("changeToken")}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-github-text hover:bg-gray-100 dark:hover:bg-github-border"
                  >
                    <Key className="w-4 h-4" />
                    <span>更换Token</span>
                  </button>

                  <div className="border-t border-gray-200 dark:border-github-border my-1"></div>

                  <button
                    onClick={() => handleUserMenuAction("settings")}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-github-text hover:bg-gray-100 dark:hover:bg-github-border"
                  >
                    <Settings className="w-4 h-4" />
                    <span>设置</span>
                  </button>

                  <button
                    onClick={() => handleUserMenuAction("logout")}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 折叠状态下的用户头像 */}
        {sidebarCollapsed && user && (
          <div className="border-t border-gray-200 dark:border-github-border p-2">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-full flex justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-github-border transition-colors duration-200"
            >
              <img
                src={user.avatar_url}
                alt={user.name || user.login}
                className="w-8 h-8 rounded-full"
              />
            </button>
          </div>
        )}
      </div>

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <MainContent />
      </div>

      {/* 移动端遮罩层 */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
};
 
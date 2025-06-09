import React from "react";
import { useAppStore } from "../../stores/appStore";
import { WelcomePage } from "../features/WelcomePage";
import { NotesListView } from "../features/NotesListView";
import { NoteEditorView } from "../features/NoteEditorView";
import { AuthPage } from "../features/AuthPage";
import { SettingsPage } from "../features/SettingsPage";

/**
 * 主内容区组件 - 根据应用状态显示不同内容
 */
export const MainContent: React.FC = () => {
  const { currentPage, selectedRepo, currentNote, isAuthenticated } =
    useAppStore();

  // 如果未认证，显示认证页面
  if (!isAuthenticated || currentPage === "auth") {
    return <AuthPage />;
  }

  // 如果是设置页面
  if (currentPage === "settings") {
    return <SettingsPage />;
  }

  // 如果是首页
  if (currentPage === "home") {
    return <WelcomePage />;
  }

  // 如果没有选择仓库，显示欢迎页面
  if (!selectedRepo) {
    return <WelcomePage />;
  }

  // 如果选择了笔记，显示编辑器
  if (currentNote) {
    return <NoteEditorView />;
  }

  // 默认显示笔记列表
  return <NotesListView />;
};

import React from "react";
import { useAppStore } from "../../stores/appStore";
import { WelcomePage } from "../features/WelcomePage";
import { NotesListView } from "../features/NotesListView";
import { NoteDetailView } from "../features/NoteDetailView";
import { EnhancedNoteEditor } from "../features/EnhancedNoteEditor";
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

  // 如果是首页，显示欢迎页面
  if (currentPage === "home") {
    return <WelcomePage />;
  }

  // 如果没有选择仓库，显示欢迎页面
  if (!selectedRepo) {
    return <WelcomePage />;
  }

  // 如果是详情页面
  if (currentPage === "detail" && currentNote) {
    return (
      <NoteDetailView
        noteId={currentNote.id.toString()}
        onBack={() => {
          useAppStore.getState().setCurrentNote(null);
          useAppStore.getState().setCurrentPage("notes");
        }}
        onEdit={() => useAppStore.getState().setCurrentPage("editor")}
      />
    );
  }

  // 如果是编辑页面
  if (currentPage === "editor" && currentNote) {
    return (
      <EnhancedNoteEditor
        noteId={currentNote.id.toString()}
        onBack={() => useAppStore.getState().setCurrentPage("detail")}
      />
    );
  }

  // 如果选择了仓库，显示笔记列表
  return <NotesListView />;
};

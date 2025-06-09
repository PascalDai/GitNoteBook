import React from "react";
import { Github, BookOpen, Edit3, Zap } from "lucide-react";

/**
 * 欢迎页面组件 - 在未选择仓库时显示
 */
export const WelcomePage: React.FC = () => {
  return (
    <div className="h-full bg-white dark:bg-github-bg flex items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        {/* 主标题 */}
        <div className="mb-8">
          <Github className="w-20 h-20 text-github-accent mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-github-text mb-4">
            欢迎使用 GitNoteBook
          </h1>
          <p className="text-xl text-gray-600 dark:text-github-muted">
            基于GitHub Issues的智能笔记管理系统
          </p>
        </div>

        {/* 功能介绍 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-github-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Github className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-github-text mb-2">
              GitHub集成
            </h3>
            <p className="text-gray-600 dark:text-github-muted">
              直接连接GitHub仓库，将Issues作为笔记存储
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-github-text mb-2">
              Markdown编辑
            </h3>
            <p className="text-gray-600 dark:text-github-muted">
              强大的编辑器，支持实时预览和语法高亮
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-github-text mb-2">
              跨平台同步
            </h3>
            <p className="text-gray-600 dark:text-github-muted">
              基于Tauri的桌面应用，数据自动同步到GitHub
            </p>
          </div>
        </div>

        {/* 使用指南 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">
              开始使用
            </h3>
          </div>
          <div className="text-left space-y-2 text-blue-800 dark:text-blue-400">
            <p>1. 在左侧选择一个GitHub仓库</p>
            <p>2. 查看和管理该仓库的笔记（Issues）</p>
            <p>3. 创建、编辑和组织您的笔记</p>
            <p>4. 所有更改会自动同步到GitHub</p>
          </div>
        </div>
      </div>
    </div>
  );
};

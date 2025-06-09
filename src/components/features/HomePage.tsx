import React from "react";
import Button from "../ui/Button";
import { useAppStore } from "../../stores/appStore";

/**
 * 首页组件
 * 显示欢迎信息和登录按钮
 */
export const HomePage: React.FC = () => {
  const { setCurrentPage, isAuthenticated } = useAppStore();

  const handleGetStarted = () => {
    setCurrentPage(isAuthenticated ? "repos" : "auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            GitNoteBook
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            基于 GitHub Issues 的智能笔记管理系统
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
            将你的想法转化为结构化的笔记，支持 Markdown 和 Mermaid 图表
          </p>

          <Button
            onClick={handleGetStarted}
            size="lg"
            className="px-8 py-3 text-lg"
          >
            开始使用
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              智能笔记
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              支持 Markdown 语法，让你的笔记更加丰富和结构化
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              GitHub 集成
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              基于 GitHub Issues，数据安全可靠，支持版本控制
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              图表支持
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              内置 Mermaid 图表支持，轻松创建流程图和时序图
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
 
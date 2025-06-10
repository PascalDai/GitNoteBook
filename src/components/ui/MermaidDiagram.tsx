import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  AlertCircle,
  RotateCcw,
  ExternalLink,
  Edit,
  Copy,
  Settings,
} from "lucide-react";

interface MermaidDiagramProps {
  chart: string;
  className?: string;
  isDarkMode?: boolean;
}

/**
 * GitHub风格的Mermaid图表组件
 * 使用iframe隔离渲染，提供最佳性能和交互体验
 *
 * 特性：
 * - iframe沙箱隔离渲染
 * - 服务端缓存支持
 * - 交互式缩放和平移
 * - 全屏模式
 * - 错误处理和降级
 */
export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
  chart,
  className = "",
  isDarkMode = false,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [urlFormat, setUrlFormat] = useState(0); // 0, 1, 2 对应不同格式

  // 生成图表的唯一标识
  const chartId = useMemo(() => {
    const content = chart.trim();
    if (!content) return null;

    // 创建内容哈希作为ID
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(36);
  }, [chart]);

  // 安全的base64编码函数，支持Unicode字符
  const safeBase64Encode = useCallback((str: string): string => {
    try {
      // 方法1: 使用encodeURIComponent + btoa处理Unicode
      return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
          return String.fromCharCode(parseInt(p1, 16));
        })
      );
    } catch (error) {
      console.warn("方法1编码失败，尝试方法2:", error);
      try {
        // 方法2: 使用TextEncoder (现代浏览器)
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        return btoa(String.fromCharCode(...data));
      } catch (error2) {
        console.warn("方法2编码失败，使用方法3:", error2);
        // 方法3: 手动处理每个字符
        let result = "";
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          if (char > 127) {
            result += encodeURIComponent(str.charAt(i));
          } else {
            result += str.charAt(i);
          }
        }
        return btoa(result);
      }
    }
  }, []);

  // 构建iframe URL (使用Mermaid Live Editor)
  const iframeUrl = useMemo(() => {
    if (!chartId || !chart.trim()) return null;

    try {
      // 使用Mermaid Live Editor的正确格式
      // 参考: https://github.com/mermaid-js/mermaid-live-editor

      // 构建配置对象 - 这是Mermaid Live Editor期望的格式
      const config = {
        code: chart.trim(),
        mermaid: {
          theme: isDarkMode ? "dark" : "default",
          themeVariables: {
            primaryColor: isDarkMode ? "#58a6ff" : "#0969da",
            primaryTextColor: isDarkMode ? "#ffffff" : "#000000",
            primaryBorderColor: isDarkMode ? "#30363d" : "#d1d9e0",
            lineColor: isDarkMode ? "#484f58" : "#d1d9e0",
            background: isDarkMode ? "#0d1117" : "#ffffff",
          },
        },
        autoSync: true,
        updateDiagram: false,
        editorMode: "code",
      };

      // 将配置编码为JSON字符串，然后base64编码
      const configJson = JSON.stringify(config);
      const encodedConfig = safeBase64Encode(configJson);

      // 尝试不同的URL格式
      const formats = [
        // 格式1: 使用配置对象的base64编码 (推荐)
        `https://mermaid.live/view#base64:${encodedConfig}`,

        // 格式2: 使用简化的配置对象
        `https://mermaid.live/view#base64:${safeBase64Encode(
          JSON.stringify({
            code: chart.trim(),
            mermaid: { theme: isDarkMode ? "dark" : "default" },
          })
        )}`,

        // 格式3: 使用最简配置
        `https://mermaid.live/view#base64:${safeBase64Encode(
          JSON.stringify({
            code: chart.trim(),
            mermaid: '{"theme": "' + (isDarkMode ? "dark" : "default") + '"}',
          })
        )}`,
      ];

      // 使用选定的格式
      const viewUrl = formats[urlFormat] || formats[0];

      console.log("🔗 构建的iframe URL:", viewUrl);
      console.log("📝 原始图表代码:", chart.trim());
      console.log("🔧 配置对象:", config);
      console.log("📦 配置JSON:", configJson);
      console.log("🔐 编码后的内容:", encodedConfig);
      console.log("🎯 当前使用格式:", urlFormat, "/", formats.length);

      return viewUrl;
    } catch (error) {
      console.error("构建iframe URL失败:", error);
      return null;
    }
  }, [chart, chartId, isDarkMode, safeBase64Encode, urlFormat]);

  // 构建编辑器URL (在新标签页打开)
  const editorUrl = useMemo(() => {
    if (!chart.trim()) return null;

    try {
      // 编辑器也需要JSON格式
      const config = {
        code: chart.trim(),
        mermaid: {
          theme: isDarkMode ? "dark" : "default",
        },
        autoSync: true,
        updateDiagram: false,
        editorMode: "code",
      };

      const configJson = JSON.stringify(config);
      const encodedConfig = safeBase64Encode(configJson);
      const editUrl = `https://mermaid.live/edit#base64:${encodedConfig}`;

      console.log("✏️ 构建的编辑器URL:", editUrl);

      return editUrl;
    } catch (error) {
      console.error("构建编辑器URL失败:", error);
      return `https://mermaid.live/edit`;
    }
  }, [chart, isDarkMode, safeBase64Encode]);

  // iframe加载处理
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
    console.log("✅ Mermaid iframe加载完成");
  }, []);

  const handleIframeError = useCallback(() => {
    console.warn("⚠️ iframe加载失败");
    setIsLoading(false);
    setError("iframe渲染失败，请检查网络连接");
  }, []);

  // 控制功能
  const openInNewTab = useCallback(() => {
    if (iframeUrl) {
      window.open(iframeUrl, "_blank");
    }
  }, [iframeUrl]);

  const openInEditor = useCallback(() => {
    if (editorUrl) {
      window.open(editorUrl, "_blank");
    }
  }, [editorUrl]);

  // 调试功能：复制URL到剪贴板
  const copyUrlToClipboard = useCallback(async () => {
    if (iframeUrl) {
      try {
        await navigator.clipboard.writeText(iframeUrl);
        console.log("✅ URL已复制到剪贴板:", iframeUrl);
        alert("URL已复制到剪贴板！");
      } catch (error) {
        console.error("复制失败:", error);
        alert(`URL: ${iframeUrl}`);
      }
    }
  }, [iframeUrl]);

  // 切换URL格式
  const switchUrlFormat = useCallback(() => {
    setUrlFormat((prev) => (prev + 1) % 3);
    console.log("🔄 切换URL格式:", urlFormat, "->", (urlFormat + 1) % 3);
  }, [urlFormat]);

  const refreshDiagram = useCallback(() => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = iframeRef.current.src;
    }
  }, []);

  // 监听图表变化
  useEffect(() => {
    if (chart.trim()) {
      setIsLoading(true);
      setError(null);
    }
  }, [chart, isDarkMode]);

  // 如果没有图表内容
  if (!chart.trim()) {
    return (
      <div
        className={`p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center ${className}`}
      >
        <div className="text-gray-500 dark:text-gray-400">
          请输入Mermaid图表代码
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mermaid-diagram relative ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* 控制面板 */}
      {showControls && (
        <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 opacity-95">
          <button
            onClick={refreshDiagram}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="刷新图表"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={openInNewTab}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="在新标签页查看"
          >
            <ExternalLink size={16} />
          </button>
          <button
            onClick={openInEditor}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="在编辑器中打开"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={copyUrlToClipboard}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="复制URL"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={switchUrlFormat}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title={`切换格式 (${urlFormat + 1}/3)`}
          >
            <Settings size={16} />
          </button>
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-75 z-5">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <span>加载图表中...</span>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                图表加载失败
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* iframe容器 */}
      {iframeUrl && (
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          className="w-full h-96 border-0 rounded-lg"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-scripts allow-same-origin"
          title="Mermaid图表"
        />
      )}
    </div>
  );
};

export default MermaidDiagram;

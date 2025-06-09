import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useLayoutEffect,
} from "react";
import mermaid from "mermaid";
import { AlertCircle } from "lucide-react";

interface MermaidDiagramProps {
  chart: string;
  className?: string;
  isDarkMode?: boolean;
}

// SVG缓存 - 全局缓存，避免重复渲染相同内容
const svgCache = new Map<string, string>();

/**
 * Mermaid图表组件
 * 支持流程图、时序图、甘特图等多种图表类型
 * 性能优化：缓存机制 + 智能初始化
 */
export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
  chart,
  className = "",
  isDarkMode = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // 缓存key，包含图表内容和主题
  const cacheKey = useMemo(() => {
    return `${chart.trim()}_${isDarkMode}`;
  }, [chart, isDarkMode]);

  // 只在必要时初始化Mermaid
  useEffect(() => {
    if (isInitialized) return;

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        securityLevel: "loose",
        logLevel: "error",
        fontFamily: "trebuchet ms, verdana, arial, sans-serif",
        // 使用deterministicIds提高缓存效率
        deterministicIds: true,
        deterministicIDSeed: "gitnotebook",

        // 基础配置
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: "basis",
        },
        sequence: {
          useMaxWidth: true,
          wrap: true,
          width: 150,
          height: 65,
        },
        gantt: {
          useMaxWidth: true,
          leftPadding: 75,
          gridLineStartPadding: 35,
          fontSize: 11,
          sectionFontSize: 24,
          numberSectionStyles: 3,
        },
        pie: {
          useMaxWidth: true,
        },
        journey: {
          useMaxWidth: true,
        },
        gitGraph: {
          useMaxWidth: true,
        },

        // 动态主题变量
        themeVariables: isDarkMode
          ? {
              primaryColor: "#58a6ff",
              primaryTextColor: "#f0f6fc",
              primaryBorderColor: "#30363d",
              lineColor: "#8b949e",
              secondaryColor: "#21262d",
              tertiaryColor: "#0d1117",
              background: "#0d1117",
              mainBkg: "#21262d",
              secondBkg: "#30363d",
              tertiaryTextColor: "#f0f6fc",
            }
          : {
              primaryColor: "#0969da",
              primaryTextColor: "#24292f",
              primaryBorderColor: "#d0d7de",
              lineColor: "#656d76",
              secondaryColor: "#f6f8fa",
              tertiaryColor: "#ffffff",
              background: "#ffffff",
              mainBkg: "#ffffff",
              secondBkg: "#f6f8fa",
              tertiaryTextColor: "#656d76",
            },
      });

      setIsInitialized(true);
      console.log("🎨 Mermaid初始化完成");
    } catch (error) {
      console.error("Mermaid初始化失败:", error);
      setError("图表组件初始化失败");
    }
  }, [isDarkMode]); // 主题变化时重新初始化

  // 使用useLayoutEffect确保在DOM更新后立即执行
  useLayoutEffect(() => {
    // 只有在所有条件满足时才渲染
    if (!isInitialized || !chart.trim() || !containerRef.current) {
      if (!isInitialized || !chart.trim()) {
        setIsLoading(false);
      }
      return;
    }

    const renderDiagram = async () => {
      try {
        setError(null);
        setIsLoading(true);

        // 🚀 检查缓存
        if (svgCache.has(cacheKey)) {
          const cachedSvg = svgCache.get(cacheKey);
          if (cachedSvg && containerRef.current) {
            containerRef.current.innerHTML = cachedSvg;
            // 应用样式优化
            const svgElement = containerRef.current.querySelector("svg");
            if (svgElement) {
              svgElement.style.cssText = `
                width: 100%;
                height: auto;
                max-width: 100%;
                display: block;
                margin: 0 auto;
              `;
            }
            console.log("⚡ 使用缓存的SVG");
            setIsLoading(false);
            return;
          }
        }

        console.log("🎨 渲染新图表:", cacheKey.substring(0, 50) + "...");

        // 清空容器
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }

        // 渲染图表
        const id = `mermaid-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const result = await mermaid.render(id, chart);
        const renderedSvg = typeof result === "string" ? result : result.svg;

        // 检查渲染结果
        if (!renderedSvg || renderedSvg.trim() === "") {
          throw new Error("Mermaid渲染返回空结果");
        }

        // 存入缓存（限制缓存大小）
        if (svgCache.size > 50) {
          const firstKey = svgCache.keys().next().value;
          if (firstKey) {
            svgCache.delete(firstKey);
          }
        }
        svgCache.set(cacheKey, renderedSvg);

        // 插入SVG
        if (containerRef.current) {
          containerRef.current.innerHTML = renderedSvg;
          // 优化SVG显示
          const svgElement = containerRef.current.querySelector("svg");
          if (svgElement) {
            svgElement.style.cssText = `
              width: 100%;
              height: auto;
              max-width: 100%;
              display: block;
              margin: 0 auto;
            `;
          }
          console.log("✅ 图表渲染完成");
        }
      } catch (err: any) {
        console.error("Mermaid渲染错误:", err);
        setError(err.message || `图表渲染失败: ${err.toString()}`);
      } finally {
        setIsLoading(false);
      }
    };

    // 立即渲染，不需要额外延迟
    renderDiagram();
  }, [chart, cacheKey, isInitialized]); // 保持必要的依赖

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}
      >
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span>渲染图表中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}
      >
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
              图表渲染失败
            </h4>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <details className="mt-2">
              <summary className="text-xs text-red-600 dark:text-red-500 cursor-pointer hover:text-red-800 dark:hover:text-red-300">
                查看原始代码
              </summary>
              <pre className="mt-1 p-2 bg-red-100 dark:bg-red-900/40 rounded text-xs text-red-800 dark:text-red-300 overflow-x-auto">
                {chart}
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`mermaid-container overflow-x-auto ${className}`}
      style={{
        textAlign: "center",
        backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
        borderRadius: "0.5rem",
        padding: "1rem",
        minHeight: "200px",
      }}
    />
  );
};

export default MermaidDiagram;

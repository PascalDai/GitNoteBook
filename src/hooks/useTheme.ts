import { useAppStore } from '../stores/appStore';

/**
 * 主题管理Hook
 * 提供主题状态和切换功能
 */
export const useTheme = () => {
  const { theme } = useAppStore();
  
  // 判断是否为深色模式
  const isDarkMode = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  return {
    theme,
    isDarkMode,
  };
}; 
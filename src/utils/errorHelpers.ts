/**
 * 错误处理工具函数
 */

/**
 * 检查是否是Token相关错误
 */
export const isTokenError = (error: string): boolean => {
  const tokenErrorKeywords = [
    'token',
    'unauthorized',
    'authentication',
    'GitHub token not set',
    'Invalid GitHub token',
    'auth'
  ];
  
  const lowerError = error.toLowerCase();
  return tokenErrorKeywords.some(keyword => 
    lowerError.includes(keyword.toLowerCase())
  );
};

/**
 * 获取用户友好的错误消息
 */
export const getFriendlyErrorMessage = (error: string): string => {
  if (isTokenError(error)) {
    return '认证失败，请检查您的GitHub Token是否有效';
  }
  
  if (error.includes('network') || error.includes('fetch')) {
    return '网络连接失败，请检查网络连接后重试';
  }
  
  if (error.includes('rate limit')) {
    return 'API调用频率超限，请稍后再试';
  }
  
  return error;
};

/**
 * 获取重试按钮文本
 */
export const getRetryButtonText = (error: string): string => {
  return isTokenError(error) ? '重新认证' : '重试';
}; 
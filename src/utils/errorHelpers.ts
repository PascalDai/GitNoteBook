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
 * 检查是否是权限相关错误
 */
export const isPermissionError = (error: string): boolean => {
  const permissionErrorKeywords = [
    'resource not accessible',
    'permission',
    'forbidden',
    'access denied',
    'insufficient privileges',
    'not accessible by personal access token'
  ];
  
  const lowerError = error.toLowerCase();
  return permissionErrorKeywords.some(keyword => 
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
  if (isTokenError(error)) {
    return "重新设置Token";
  } else if (isPermissionError(error)) {
    return "检查Token权限";
  } else {
    return "重试";
  }
};

/**
 * 获取错误建议
 */
export const getErrorSuggestion = (error: string): string => {
  if (isTokenError(error)) {
    return "请检查您的GitHub Personal Access Token是否正确";
  } else if (isPermissionError(error)) {
    return "您的Token缺少必要权限。请重新生成Token并确保勾选了'repo'权限（完整的仓库访问权限）";
  } else {
    return "请稍后重试，或检查网络连接";
  }
}; 
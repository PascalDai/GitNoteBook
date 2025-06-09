import { isTokenError, getFriendlyErrorMessage, getRetryButtonText } from '../errorHelpers';

describe('errorHelpers', () => {
  describe('isTokenError', () => {
    it('应该识别Token相关错误', () => {
      expect(isTokenError('GitHub token not set')).toBe(true);
      expect(isTokenError('Invalid GitHub token')).toBe(true);
      expect(isTokenError('unauthorized')).toBe(true);
      expect(isTokenError('authentication failed')).toBe(true);
      expect(isTokenError('Token expired')).toBe(true);
    });

    it('应该识别非Token错误', () => {
      expect(isTokenError('Network error')).toBe(false);
      expect(isTokenError('Failed to fetch repositories')).toBe(false);
      expect(isTokenError('Rate limit exceeded')).toBe(false);
    });

    it('应该不区分大小写', () => {
      expect(isTokenError('GITHUB TOKEN NOT SET')).toBe(true);
      expect(isTokenError('Unauthorized')).toBe(true);
      expect(isTokenError('AUTHENTICATION FAILED')).toBe(true);
    });
  });

  describe('getFriendlyErrorMessage', () => {
    it('应该为Token错误返回友好消息', () => {
      const message = getFriendlyErrorMessage('GitHub token not set');
      expect(message).toBe('认证失败，请检查您的GitHub Token是否有效');
    });

    it('应该为网络错误返回友好消息', () => {
      const message = getFriendlyErrorMessage('network error occurred');
      expect(message).toBe('网络连接失败，请检查网络连接后重试');
    });

    it('应该为未知错误返回原始消息', () => {
      const originalMessage = 'Something went wrong';
      const message = getFriendlyErrorMessage(originalMessage);
      expect(message).toBe(originalMessage);
    });
  });

  describe('getRetryButtonText', () => {
    it('应该为Token错误返回"重新认证"', () => {
      expect(getRetryButtonText('GitHub token not set')).toBe('重新认证');
      expect(getRetryButtonText('unauthorized')).toBe('重新认证');
    });

    it('应该为其他错误返回"重试"', () => {
      expect(getRetryButtonText('Network error')).toBe('重试');
      expect(getRetryButtonText('Failed to load')).toBe('重试');
    });
  });
}); 
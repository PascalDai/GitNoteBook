import { Octokit } from '@octokit/rest';
import type { GitHubUser, GitHubRepo, GitHubIssue } from '../types';

export class GitHubService {
  private octokit: Octokit | null = null;
  private token: string | null = null;

  /**
   * 设置GitHub Token并初始化Octokit实例
   */
  setToken(token: string) {
    this.token = token;
    this.octokit = new Octokit({
      auth: token,
    });
  }

  /**
   * 验证Token并获取用户信息
   */
  async validateTokenAndGetUser(): Promise<GitHubUser> {
    if (!this.octokit) {
      throw new Error('GitHub token not set');
    }

    try {
      const { data } = await this.octokit.rest.users.getAuthenticated();
      
      return {
        id: data.id,
        login: data.login,
        name: data.name || null,
        email: data.email || null,
        avatar_url: data.avatar_url,
        html_url: data.html_url,
        bio: data.bio || null,
        public_repos: data.public_repos,
        followers: data.followers,
        following: data.following,
        created_at: data.created_at,
      };
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('Invalid GitHub token. Please check your token and try again.');
      }
      throw new Error(`Failed to authenticate: ${error.message}`);
    }
  }

  /**
   * 获取用户的仓库列表（简化版本）
   */
  async getUserRepos(): Promise<GitHubRepo[]> {
    if (!this.octokit) {
      throw new Error('GitHub token not set');
    }

    try {
      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
      });

      return data.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description || null,
        private: repo.private,
        html_url: repo.html_url,
        clone_url: repo.clone_url,
        ssh_url: repo.ssh_url,
        default_branch: repo.default_branch,
        created_at: repo.created_at || '',
        updated_at: repo.updated_at || '',
        pushed_at: repo.pushed_at || '',
        size: repo.size,
        stargazers_count: repo.stargazers_count,
        watchers_count: repo.watchers_count,
        language: repo.language || null,
        forks_count: repo.forks_count,
        archived: repo.archived,
        disabled: repo.disabled,
        open_issues_count: repo.open_issues_count,
        license: repo.license ? {
          key: repo.license.key,
          name: repo.license.name,
          spdx_id: repo.license.spdx_id || '',
          url: repo.license.url || '',
        } : null,
        allow_forking: repo.allow_forking || false,
        is_template: repo.is_template || false,
        topics: repo.topics || [],
        visibility: (repo.visibility as 'public' | 'private') || 'public',
        forks: repo.forks,
        open_issues: repo.open_issues,
        watchers: repo.watchers,
        default_branch_ref: repo.default_branch,
      }));
    } catch (error: any) {
      throw new Error(`Failed to fetch repositories: ${error.message}`);
    }
  }

  /**
   * 获取仓库的Issues（作为笔记）- 简化版本
   */
  async getRepoIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
    if (!this.octokit) {
      throw new Error('GitHub token not set');
    }

    try {
      const { data } = await this.octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'all',
        sort: 'updated',
        per_page: 100,
      });

      return data.map(issue => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body || null,
        state: issue.state as 'open' | 'closed',
        locked: issue.locked,
        assignee: null, // 简化处理
        assignees: [], // 简化处理
        milestone: issue.milestone || null,
        comments: issue.comments,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        closed_at: issue.closed_at || null,
        author_association: issue.author_association,
        active_lock_reason: issue.active_lock_reason || null,
        draft: false,
        body_html: issue.body_html,
        body_text: issue.body_text,
        timeline_url: issue.timeline_url || '',
        repository_url: issue.repository_url || '',
        labels_url: issue.labels_url || '',
        comments_url: issue.comments_url || '',
        events_url: issue.events_url || '',
        html_url: issue.html_url,
        url: issue.url,
        node_id: issue.node_id,
        labels: issue.labels.map(label => {
          if (typeof label === 'string') {
            return {
              id: 0,
              node_id: '',
              url: '',
              name: label,
              description: null,
              color: '',
              default: false,
            };
          }
          return {
            id: label.id || 0,
            node_id: label.node_id || '',
            url: label.url || '',
            name: label.name || '',
            description: label.description || null,
            color: label.color || '',
            default: label.default || false,
          };
        }),
        user: {
          id: issue.user?.id || 0,
          login: issue.user?.login || '',
          name: issue.user?.name || null,
          email: issue.user?.email || null,
          avatar_url: issue.user?.avatar_url || '',
          html_url: issue.user?.html_url || '',
          bio: null,
          public_repos: 0,
          followers: 0,
          following: 0,
          created_at: '',
        },
      }));
    } catch (error: any) {
      throw new Error(`Failed to fetch issues: ${error.message}`);
    }
  }

  /**
   * 创建新的Issue（笔记）
   */
  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body: string,
    labels?: string[]
  ): Promise<GitHubIssue> {
    if (!this.octokit) {
      throw new Error('GitHub token not set');
    }

    try {
      const { data } = await this.octokit.rest.issues.create({
        owner,
        repo,
        title,
        body,
        labels,
      });

      // 返回简化的Issue对象
      return {
        id: data.id,
        number: data.number,
        title: data.title,
        body: data.body || null,
        state: data.state as 'open' | 'closed',
        locked: data.locked,
        assignee: null,
        assignees: [],
        milestone: data.milestone || null,
        comments: data.comments,
        created_at: data.created_at,
        updated_at: data.updated_at,
        closed_at: data.closed_at || null,
        author_association: data.author_association,
        active_lock_reason: data.active_lock_reason || null,
        draft: false,
        body_html: undefined,
        body_text: undefined,
        timeline_url: data.timeline_url || '',
        repository_url: data.repository_url,
        labels_url: data.labels_url,
        comments_url: data.comments_url,
        events_url: data.events_url,
        html_url: data.html_url,
        url: data.url,
        node_id: data.node_id,
        labels: [],
        user: {
          id: data.user?.id || 0,
          login: data.user?.login || '',
          name: data.user?.name || null,
          email: data.user?.email || null,
          avatar_url: data.user?.avatar_url || '',
          html_url: data.user?.html_url || '',
          bio: null,
          public_repos: 0,
          followers: 0,
          following: 0,
          created_at: '',
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to create issue: ${error.message}`);
    }
  }

  /**
   * 更新Issue
   */
  async updateIssue(
    owner: string,
    repo: string,
    issueNumber: number,
    title?: string,
    body?: string,
    labels?: string[]
  ): Promise<void> {
    if (!this.octokit) {
      throw new Error('GitHub token not set');
    }

    try {
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (body !== undefined) updateData.body = body;
      if (labels !== undefined) updateData.labels = labels;

      await this.octokit.rest.issues.update({
        owner,
        repo,
        issue_number: issueNumber,
        ...updateData,
      });
    } catch (error: any) {
      throw new Error(`Failed to update issue: ${error.message}`);
    }
  }
}

// 创建单例实例
export const githubService = new GitHubService(); 
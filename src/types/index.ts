// GitHub API相关类型
export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string;
  } | null;
  allow_forking: boolean;
  is_template: boolean;
  topics: string[];
  visibility: 'public' | 'private';
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch_ref: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  locked: boolean;
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
  milestone: any | null;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  author_association: string;
  active_lock_reason: string | null;
  draft: boolean;
  pull_request?: any;
  body_html?: string;
  body_text?: string;
  timeline_url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  url: string;
  node_id: string;
  labels: GitHubLabel[];
  user: GitHubUser;
}

export interface GitHubLabel {
  id: number;
  node_id: string;
  url: string;
  name: string;
  description: string | null;
  color: string;
  default: boolean;
}

// 应用状态类型
export interface AppState {
  // 认证状态
  isAuthenticated: boolean;
  token: string | null;
  user: GitHubUser | null;
  
  // 当前页面
  currentPage: 'home' | 'auth' | 'repos' | 'notes' | 'editor' | 'settings';
  
  // 仓库和笔记
  selectedRepo: GitHubRepo | null;
  notes: Note[];
  currentNote: Note | null;
  
  // UI状态
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
}

// 笔记类型
export interface Note {
  id: number;
  title: string;
  content: string;
  labels: GitHubLabel[];
  createdAt: string;
  updatedAt: string;
  githubIssue: GitHubIssue;
}

// 编辑器配置
export interface EditorConfig {
  theme: 'vs-light' | 'vs-dark' | 'hc-black';
  fontSize: number;
  wordWrap: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  minimap: boolean;
  lineNumbers: 'on' | 'off' | 'relative' | 'interval';
  language: string;
  automaticLayout: boolean;
  scrollBeyondLastLine: boolean;
  renderWhitespace: 'none' | 'boundary' | 'selection' | 'trailing' | 'all';
}

// API响应类型
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface AuthStatus {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  token: string | null;
}

// 错误类型
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// 设置类型
export interface AppSettings {
  sync: {
    onAppStart: boolean;
    intervalMinutes: number;
    autoSaveSeconds: number;
    networkAware: boolean;
  };
  editor: EditorConfig;
  ui: {
    theme: 'light' | 'dark' | 'system';
    language: 'zh-CN' | 'en-US';
    sidebarWidth: number;
  };
  github: {
    defaultRepo: string | null;
    issueTemplate: string;
    labelPrefix: string;
  };
}

// 组件Props类型
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: any;
  onClick?: () => void;
  className?: string;
}

export interface InputProps {
  type?: 'text' | 'password' | 'email' | 'url';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: any;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// 路由类型
export type PageType = 'home' | 'auth' | 'repos' | 'notes' | 'editor' | 'settings';

// 主题类型
export type ThemeType = 'light' | 'dark' | 'system'; 
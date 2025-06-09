# GitNoteBook

基于GitHub Issues的智能笔记管理系统，使用现代化技术栈构建的跨平台桌面应用。

## ✨ 特性

- 🔗 **GitHub集成**: 直接连接GitHub仓库，将Issues作为笔记存储
- 📝 **Markdown编辑**: 强大的Monaco编辑器，支持语法高亮和实时预览
- 🏷️ **标签管理**: 使用GitHub标签系统组织和分类笔记
- 🌙 **主题切换**: 支持亮色/暗色/系统主题
- 💾 **本地存储**: 智能缓存，支持离线使用
- 🔄 **实时同步**: 与GitHub Issues保持同步
- 🎨 **现代UI**: 基于Tailwind CSS的美观界面

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **桌面框架**: Tauri 2.x
- **UI样式**: Tailwind CSS
- **状态管理**: Zustand
- **数据获取**: TanStack Query
- **编辑器**: Monaco Editor
- **图标**: Lucide React
- **GitHub API**: Octokit

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm
- Rust (用于Tauri)

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd git-notebook

# 安装依赖
pnpm install
```

### 开发模式

```bash
# 启动Web开发服务器
pnpm dev

# 启动Tauri开发模式
pnpm tauri dev
```

### 构建应用

```bash
# 构建Web应用
pnpm build

# 构建桌面应用
pnpm tauri build
```

## 📖 使用指南

### 1. GitHub认证

首次使用需要配置GitHub Personal Access Token：

1. 访问 [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. 创建新的token，需要以下权限：
   - `repo` - 访问仓库
   - `read:user` - 读取用户信息
3. 在应用中输入token进行认证

### 2. 选择仓库

认证成功后，选择要用作笔记存储的GitHub仓库。

### 3. 创建笔记

- 点击"新建笔记"按钮
- 输入标题和内容（支持Markdown）
- 添加标签进行分类
- 保存后自动同步到GitHub Issues

### 4. 管理笔记

- 在侧边栏浏览所有笔记
- 使用标签筛选笔记
- 支持搜索功能
- 编辑和删除笔记

## 🔧 配置

### 主题设置

应用支持三种主题模式：
- **亮色主题**: 适合白天使用
- **暗色主题**: 适合夜间使用  
- **系统主题**: 跟随系统设置

### 编辑器配置

可以自定义编辑器设置：
- 字体大小
- 主题样式
- 自动换行
- 小地图显示
- 行号显示

### 同步设置

- 自动同步间隔
- 启动时同步
- 网络感知同步

## 📁 项目结构

```
git-notebook/
├── src/
│   ├── components/          # React组件
│   │   ├── ui/             # 基础UI组件
│   │   ├── layout/         # 布局组件
│   │   └── features/       # 功能组件
│   ├── hooks/              # 自定义Hooks
│   ├── services/           # API服务
│   ├── stores/             # 状态管理
│   ├── types/              # TypeScript类型
│   └── utils/              # 工具函数
├── src-tauri/              # Tauri后端代码
├── public/                 # 静态资源
└── dist/                   # 构建输出
```

## 🤝 贡献

欢迎提交Issue和Pull Request！

### 开发流程

1. Fork项目
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交Pull Request

### 代码规范

- 使用TypeScript进行类型检查
- 遵循ESLint规则
- 组件使用函数式写法
- 使用自解释的变量和函数名

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Tauri](https://tauri.app/) - 跨平台桌面应用框架
- [React](https://reactjs.org/) - 用户界面库
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - 代码编辑器
- [GitHub API](https://docs.github.com/en/rest) - 数据存储

---

**GitNoteBook** - 让笔记管理更简单，让知识分享更便捷！

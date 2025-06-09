import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  AppState, 
  GitHubUser, 
  GitHubRepo, 
  Note, 
  PageType, 
  ThemeType 
} from '../types';

interface AppStore extends AppState {
  // 认证相关方法
  setAuthenticated: (isAuthenticated: boolean) => void;
  setToken: (token: string | null) => void;
  setUser: (user: GitHubUser | null) => void;
  logout: () => void;
  
  // 页面导航
  setCurrentPage: (page: PageType) => void;
  
  // 仓库和笔记管理
  setSelectedRepo: (repo: GitHubRepo | null) => void;
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: number, updates: Partial<Note>) => void;
  deleteNote: (id: number) => void;
  setCurrentNote: (note: Note | null) => void;
  
  // UI状态管理
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setTheme: (theme: ThemeType) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  
  // 重置状态
  reset: () => void;
}

// 初始状态
const initialState: AppState = {
  // 认证状态
  isAuthenticated: false,
  token: null,
  user: null,
  
  // 当前页面
  currentPage: 'home',
  
  // 仓库和笔记
  selectedRepo: null,
  notes: [],
  currentNote: null,
  
  // UI状态
  isLoading: false,
  error: null,
  theme: 'system',
  sidebarOpen: true,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,
      
      // 认证相关方法
      setAuthenticated: (isAuthenticated) => 
        set({ isAuthenticated }),
      
      setToken: (token) => 
        set({ token }),
      
      setUser: (user) => 
        set({ user }),
      
      logout: () => 
        set({
          isAuthenticated: false,
          token: null,
          user: null,
          selectedRepo: null,
          notes: [],
          currentNote: null,
          currentPage: 'home',
        }),
      
      // 页面导航
      setCurrentPage: (currentPage) => 
        set({ currentPage }),
      
      // 仓库和笔记管理
      setSelectedRepo: (selectedRepo) => 
        set({ selectedRepo }),
      
      setNotes: (notes) => 
        set({ notes }),
      
      addNote: (note) => 
        set((state) => ({ 
          notes: [...state.notes, note] 
        })),
      
      updateNote: (id, updates) => 
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates } : note
          ),
          currentNote: state.currentNote?.id === id 
            ? { ...state.currentNote, ...updates }
            : state.currentNote,
        })),
      
      deleteNote: (id) => 
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          currentNote: state.currentNote?.id === id ? null : state.currentNote,
        })),
      
      setCurrentNote: (currentNote) => 
        set({ currentNote }),
      
      // UI状态管理
      setLoading: (isLoading) => 
        set({ isLoading }),
      
      setError: (error) => 
        set({ error }),
      
      setTheme: (theme) => 
        set({ theme }),
      
      setSidebarOpen: (sidebarOpen) => 
        set({ sidebarOpen }),
      
      toggleSidebar: () => 
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      // 重置状态
      reset: () => 
        set(initialState),
    }),
    {
      name: 'git-notebook-store',
      // 只持久化部分状态
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        user: state.user,
        selectedRepo: state.selectedRepo,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// 选择器函数，用于优化性能
export const useAuth = () => useAppStore((state) => ({
  isAuthenticated: state.isAuthenticated,
  token: state.token,
  user: state.user,
  setAuthenticated: state.setAuthenticated,
  setToken: state.setToken,
  setUser: state.setUser,
  logout: state.logout,
}));

export const useNotes = () => useAppStore((state) => ({
  notes: state.notes,
  currentNote: state.currentNote,
  selectedRepo: state.selectedRepo,
  setNotes: state.setNotes,
  addNote: state.addNote,
  updateNote: state.updateNote,
  deleteNote: state.deleteNote,
  setCurrentNote: state.setCurrentNote,
  setSelectedRepo: state.setSelectedRepo,
}));

export const useUI = () => useAppStore((state) => ({
  currentPage: state.currentPage,
  isLoading: state.isLoading,
  error: state.error,
  theme: state.theme,
  sidebarOpen: state.sidebarOpen,
  setCurrentPage: state.setCurrentPage,
  setLoading: state.setLoading,
  setError: state.setError,
  setTheme: state.setTheme,
  setSidebarOpen: state.setSidebarOpen,
  toggleSidebar: state.toggleSidebar,
})); 
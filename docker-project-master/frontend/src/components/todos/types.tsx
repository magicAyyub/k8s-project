import { SortField } from "./TodoFilters";

export interface Todo {
    id: string;
    title: string;
    completed: boolean;
    priority: "urgent" | "high" | "medium" | "low";
    tags: string[];
    due_date?: Date;
    estimated_time?: number;
    starred: boolean;
    archived: boolean;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface NewTodoState {
    title: string;
    priority: "medium" | "low" | "high" | "urgent";
    tags: string[];
    current_tag: string;
    due_date: string;
    estimated_time: string;
  }
  export interface TodoFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    selectedPriorities: string[];
    setSelectedPriorities: (priorities: string[]) => void;
    sortBy: SortField;
    setSortBy: (sort: SortField) => void;
    hasActiveFilters: boolean;
    resetAllFilters: () => void;
  }
  
  export type ViewMode = "active" | "completed" | "all";
  
  export const priorityConfig = {
    urgent: { color: "bg-red-500", label: "Urgent", icon: "Zap" },
    high: { color: "bg-orange-500", label: "High", icon: "ArrowUp" },
    medium: { color: "bg-blue-500", label: "Medium", icon: "Target" },
    low: { color: "bg-green-500", label: "Low", icon: "ArrowDown" },
  };
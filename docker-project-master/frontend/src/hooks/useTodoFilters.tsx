import { useState, useMemo } from "react";
import { Todo, ViewMode } from "@/components/todos/types";

export function useTodoFilters(initialTodos: Todo[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"due_date" | "priority" | "created" | "updated">("due_date");
  const [viewMode, setViewMode] = useState<ViewMode>("active");

  const filteredTodos = useMemo(() => {
    const filtered = initialTodos.filter((todo) => {
      const matchesSearch =
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesPriority =
        selectedPriorities.length === 0 || selectedPriorities.includes(todo.priority);

      const matchesViewMode =
        viewMode === "all" ||
        (viewMode === "active" && !todo.completed && !todo.archived) ||
        (viewMode === "completed" && todo.completed);
        
      return matchesSearch && matchesPriority && matchesViewMode && !todo.archived;
    });

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "due_date":
          const aDate = a.due_date?.getTime() || Number.POSITIVE_INFINITY;
          const bDate = b.due_date?.getTime() || Number.POSITIVE_INFINITY;
          comparison = aDate - bDate;
          break;
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case "created":
          comparison = b.created_at.getTime() - a.created_at.getTime();
          break;
        case "updated":
          comparison = b.updated_at.getTime() - a.updated_at.getTime();
          break;
      }
      return comparison;
    });

    // Starred items first
    return filtered.sort((a, b) => {
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;
      return 0;
    });
  }, [initialTodos, searchTerm, selectedPriorities, sortBy, viewMode]);

  const hasActiveFilters = useMemo(
    () => searchTerm.length > 0 || selectedPriorities.length > 0 || viewMode !== "active",
    [searchTerm, selectedPriorities, viewMode]
  );

  const resetAllFilters = () => {
    setSearchTerm("");
    setSelectedPriorities([]);
    setViewMode("active");
  };

  return {
    filteredTodos,
    searchTerm,
    setSearchTerm,
    selectedPriorities,
    setSelectedPriorities,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    hasActiveFilters,
    resetAllFilters,
  };
}
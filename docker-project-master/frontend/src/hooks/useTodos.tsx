import { useState, useEffect, useMemo } from "react";
import { Todo } from "@/components/todos/types";
import { fetchTasks, createTask, updateTask, deleteTask } from "@/lib/api";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((prev) => prev + 1);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTasks();
        setTodos(data);
        setError(null);
      } catch (err) {
        setError("Failed to load todos");
        console.error("Error loading todos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodos();
  }, [refreshKey]);

  const handleAddTodo = async (todo: Omit<Todo, "id" | "created_at" | "updated_at">) => {
    try {
      setIsLoading(true);
      const createdTodo = await createTask(todo);
      await refresh(); // Attend le rafraîchissement
      return createdTodo;
    } catch (err) {
      setError("Failed to create todo");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      console.log("Updating task:", id, "with:", updates);
      
      // Mise à jour optimiste
      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, ...updates } : todo
      ));
  
      const updatedTodo = await updateTask(id, updates);
      return updatedTodo;
    } catch (err) {
      // Revert en cas d'erreur
      setTodos(prev => prev);
      console.error("Update failed:", err);
      throw err;
    }
  };

  const handleDeleteTodo = async (id: string) => {
    await deleteTask(id);
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const stats = useMemo(() => {
    const active = todos.filter((t) => !t.completed && !t.archived);
    const completed = todos.filter((t) => t.completed && !t.archived);
    const overdue = active.filter((t) => t.due_date && new Date() > t.due_date);
    const dueToday = active.filter((t) => {
      if (!t.due_date) return false;
      return new Date().toDateString() === t.due_date.toDateString();
    });

    return {
      active: active.length,
      completed: completed.length,
      overdue: overdue.length,
      dueToday: dueToday.length,
    };
  }, [todos]);

  return {
    todos,
    isLoading,
    error,
    stats,
    refresh,
    handleAddTodo,
    handleUpdateTodo,
    handleDeleteTodo,
  };
}
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTodos } from "@/hooks/useTodos";
import { useTodoFilters } from "@/hooks/useTodoFilters";
import { TodoList } from "@/components/todos/TodoList";
import { TodoFilters } from "@/components/todos/TodoFilters";
import { TodoStats } from "@/components/todos/TodoStats";
import { TodoForm } from "@/components/todos/TodoForm";
import { CustomModal } from "@/components/todos/CustomModal";
import { NewTodoState, Todo } from "@/types/todo";

export default function TodoApp() {
  const [selectedTodos, setSelectedTodos] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [newTodo, setNewTodo] = useState<NewTodoState>({
    title: "",
    priority: "medium",
    tags: [],
    current_tag: "",
    due_date: "",
    estimated_time: "",
  });

  const { todos, isLoading, error, stats, handleAddTodo, handleUpdateTodo, handleDeleteTodo, refresh } = useTodos();
  const { filteredTodos, ...filterProps } = useTodoFilters(todos);

  const handleTodoClick = (id: string, e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey) {
      setSelectedTodos((prev) =>
        prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
      );
    } else {
      setSelectedTodos((prev) => (prev.includes(id) ? [] : [id]));
    }
  };
  useEffect(() => {
    console.log("Todos:", todos);
    console.log("Filtered Todos:", filteredTodos);
  }, [todos, filteredTodos]);
  const handleSubmitTodo = async () => {
    try {
      if (editingTodo) {
        await handleUpdateTodo(editingTodo.id, {
          ...newTodo,
          due_date: newTodo.due_date ? new Date(newTodo.due_date) : undefined,
          estimated_time: newTodo.estimated_time ? parseInt(newTodo.estimated_time) : undefined,
        });
      } else {
        await handleAddTodo({
          ...newTodo,
          completed: false,
          starred: false,
          archived: false,
          due_date: newTodo.due_date ? new Date(newTodo.due_date) : undefined,
          estimated_time: newTodo.estimated_time ? parseInt(newTodo.estimated_time) : undefined,
        });
      } 
    }catch (err) {
      console.error("Error saving todo:", err);
      return; // Ne ferme pas le modal en cas d'erreur
    }
    setIsAddModalOpen(false);
    setEditingTodo(null);
    resetForm();
    refresh()
  };

  
  const resetForm = () => {
    setNewTodo({
      title: "",
      priority: "medium",
      tags: [],
      current_tag: "",
      due_date: "",
      estimated_time: "",
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-center mb-4">{error}</div>
        <Button onClick={refresh}>Try Again</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">
                Task Manager
              </h1>
              <p className="text-slate-600 mt-2">Simple and powerful task management</p>
            </div>
            <div className="flex items-center gap-3">
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCommandOpen(true)}
                className="hidden md:flex items-center gap-2"
              >
                <Command className="w-4 h-4" />
                <span className="text-xs">⌘K</span>
              </Button> */}
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
          <TodoStats {...stats} />
        </div>

        <TodoFilters {...filterProps} />

        <TodoList
          todos={filteredTodos}
          selectedTodos={selectedTodos}
          onTodoClick={handleTodoClick}
          onToggleTodo={(id) => handleUpdateTodo(id, { 
            completed: !todos.find(t => t.id === id)?.completed 
          })}
          
          // Pour marquer comme starred
          onStarTodo={(id) => handleUpdateTodo(id, { 
            starred: !todos.find(t => t.id === id)?.starred 
          })}
          onDeleteTodo={handleDeleteTodo}
          onEditTodo={(todo) => {
            setEditingTodo(todo);
            setNewTodo({
              title: todo.title,
              priority: todo.priority,
              tags: todo.tags,
              current_tag: "",
              due_date: todo.due_date?.toISOString().slice(0, 16) || "",
              estimated_time: todo.estimated_time?.toString() || "",
            });
            setIsAddModalOpen(true);
          }}
        />

        <CustomModal
          isOpen={isAddModalOpen || !!editingTodo}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingTodo(null);
            resetForm();
          }}
          title={editingTodo ? "Edit Task" : "Create New Task"}
        >
          <TodoForm
            newTodo={newTodo}
            setNewTodo={setNewTodo}
            onSubmit={handleSubmitTodo}
            onCancel={() => {
              setIsAddModalOpen(false);
              setEditingTodo(null);
              resetForm();
            }}
            isEditing={!!editingTodo}
          />
        </CustomModal>
      </div>
    </div>
  );
}
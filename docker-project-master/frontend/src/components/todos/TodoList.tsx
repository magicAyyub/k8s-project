import { Todo } from "./types";
import { TodoItem } from "./TodoItem";
import { Card } from "@/components/ui/card";
import {
    CheckCircle2,

  } from "lucide-react"

export function TodoList({
  todos,
  selectedTodos,
  onTodoClick,
  onToggleTodo,
  onStarTodo,
  onDeleteTodo,
  onEditTodo,
}: {
  todos: Todo[];
  selectedTodos: string[];
  onTodoClick: (id: string, e: React.MouseEvent) => void;
  onToggleTodo: (id: string) => void;
  onStarTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onEditTodo: (todo: Todo) => void;
}) {
  if (todos.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed border-2 border-slate-200 bg-white/50">
        <div className="text-slate-400">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2 text-slate-600">No tasks found</h3>
          <p className="text-slate-500 mb-4">
            Create your first task to get started
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isSelected={selectedTodos.includes(todo.id)}
          onClick={(e) => onTodoClick(todo.id, e)}
          onToggle={() => onToggleTodo(todo.id)}
          onStar={() => onStarTodo(todo.id)}
          onDelete={() => onDeleteTodo(todo.id)}
          onEdit={() => onEditTodo(todo)}
        />
      ))}
    </div>
  );
}
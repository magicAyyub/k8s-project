import { Todo } from "./types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Clock, Tag, Edit3, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";

const priorityConfig = {
  urgent: { color: "bg-red-500", label: "Urgent" },
  high: { color: "bg-orange-500", label: "High" },
  medium: { color: "bg-blue-500", label: "Medium" },
  low: { color: "bg-green-500", label: "Low" },
};

export function TodoItem({
  todo,
  onToggle,
  onStar,
  onDelete,
  onEdit,
  isSelected,
  onClick,
}: {
  todo: Todo;
  onToggle: () => void;
  onStar: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const isOverdue = todo.due_date && new Date() > new Date(todo.due_date);
  const isDueToday = todo.due_date && 
    new Date().toDateString() === new Date(todo.due_date).toDateString();

  const formatTimeEstimate = (minutes?: number) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Toggling star for task:", todo.id);
    onStar();
  };

  const handleToggleComplete = (checked: boolean) => {
    console.log("Toggling completion for task:", todo.id, checked);
    onToggle();
  };

  return (
    <Card
      className={`group transition-all duration-200 hover:shadow-md border-0 shadow-sm bg-white/80 backdrop-blur-sm cursor-pointer ${
        todo.completed ? "opacity-75" : ""
      } ${
        isSelected
          ? "ring-2 ring-blue-500 ring-opacity-50 shadow-lg transform scale-[1.02]"
          : "hover:transform hover:scale-[1.01]"
      }`}
      onClick={onClick}
      style={{
        borderLeft: `4px solid ${
          todo.starred
            ? "#f59e0b"
            : isOverdue
              ? "#ef4444"
              : isDueToday
                ? "#f97316"
                : priorityConfig[todo.priority].color.replace("bg-", "#")
        }`,
      }}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-3 mt-1">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={todo.completed}
                onCheckedChange={handleToggleComplete}
                className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 transition-all duration-200 hover:scale-110"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-start gap-2">
                  <h3
                    className={`font-semibold text-lg leading-tight transition-all duration-200 ${
                      todo.completed ? "line-through text-slate-500" : "text-slate-900"
                    }`}
                  >
                    {todo.title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStarClick}
                    className={`p-1 h-auto transition-all duration-200 hover:scale-110 ${
                      todo.starred ? "text-yellow-500" : "text-slate-400 hover:text-yellow-500"
                    }`}
                  >
                    <Star className={`w-4 h-4 ${todo.starred ? "fill-current" : ""}`} />
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${priorityConfig[todo.priority].color} transition-all duration-200`}
                    />
                    <span className="text-slate-600 font-medium">
                      {priorityConfig[todo.priority].label}
                    </span>
                  </div>

                  {todo.due_date && (
                    <div
                      className={`flex items-center gap-1 ${
                        isOverdue
                          ? "text-red-600"
                          : isDueToday
                            ? "text-orange-600"
                            : "text-slate-600"
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(todo.due_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          ...(new Date(todo.due_date).getFullYear() !== new Date().getFullYear() && {
                            year: "numeric",
                          }),
                        })}
                      </span>
                    </div>
                  )}

                  {todo.estimated_time && (
                    <div className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeEstimate(todo.estimated_time)}</span>
                    </div>
                  )}
                </div>

                {todo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {todo.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors duration-200"
                      >
                        <Tag className="w-2.5 h-2.5 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-slate-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onStar}>
                    <Star className="w-4 h-4 mr-2" />
                    {todo.starred ? "Unstar" : "Star"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
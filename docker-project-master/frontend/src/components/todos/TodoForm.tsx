import { NewTodoState } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tag, X } from "lucide-react";

export function TodoForm({
  newTodo,
  setNewTodo,
  onSubmit,
  onCancel,
  isEditing,
}: {
  newTodo: NewTodoState;
  setNewTodo: (todo: NewTodoState) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
}) {
  const handleAddTag = () => {
    if (newTodo.current_tag.trim()) {
      setNewTodo({
        ...newTodo,
        tags: [...newTodo.tags, newTodo.current_tag.trim()],
        current_tag: "",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={newTodo.title}
          onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
          placeholder="Enter task title..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={newTodo.priority}
            onValueChange={(value: "medium" | "low" | "high" | "urgent") => 
                setNewTodo({ ...newTodo, priority: value })
              }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Estimated Time (minutes)</Label>
          <Input
            type="number"
            value={newTodo.estimated_time}
            onChange={(e) => setNewTodo({ ...newTodo, estimated_time: e.target.value })}
            placeholder="60"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Due Date</Label>
        <Input
          type="datetime-local"
          value={newTodo.due_date}
          onChange={(e) => setNewTodo({ ...newTodo, due_date: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2">
          {newTodo.tags.map((tag, index) => (
            <Badge key={index} variant="secondary">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
              <button
                type="button"
                onClick={() =>
                  setNewTodo({
                    ...newTodo,
                    tags: newTodo.tags.filter((_, i) => i !== index),
                  })
                }
              >
                <X className="w-3 h-3 ml-1" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTodo.current_tag}
            onChange={(e) => setNewTodo({ ...newTodo, current_tag: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            placeholder="Add tag and press Enter"
          />
          <Button type="button" variant="outline" onClick={handleAddTag}>
            Add
          </Button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" onClick={onSubmit}>
          {isEditing ? "Update Task" : "Create Task"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
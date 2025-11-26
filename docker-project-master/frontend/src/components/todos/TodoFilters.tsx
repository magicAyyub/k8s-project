import { ViewMode } from "./types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { Zap, ArrowUp, Target, ArrowDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";

const priorityConfig = {
  urgent: { color: "bg-red-500", label: "Urgent", icon: Zap },
  high: { color: "bg-orange-500", label: "High", icon: ArrowUp },
  medium: { color: "bg-blue-500", label: "Medium", icon: Target },
  low: { color: "bg-green-500", label: "Low", icon: ArrowDown },
};

export type SortField = "due_date" | "priority" | "created" | "updated";

interface TodoFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedPriorities: string[];
  setSelectedPriorities: (priorities: string[]) => void;
  setSortBy: (sort: SortField) => void;
  hasActiveFilters: boolean;
  resetAllFilters: () => void;
}

export function TodoFilters({
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  selectedPriorities,
  setSelectedPriorities,
  setSortBy,
  hasActiveFilters,
  resetAllFilters,
}: TodoFiltersProps) {
  return (
    <Card className="p-6 mb-6 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
      {hasActiveFilters && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Filter className="w-4 h-4" />
            <span>Filters active</span>
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Search: &quot;{searchTerm}&quot;
              </Badge>
            )}
            {selectedPriorities.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedPriorities.length} priorities
              </Badge>
            )}
            {viewMode !== "active" && (
              <Badge variant="secondary" className="text-xs">
                View: {viewMode}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={resetAllFilters}
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-3 h-3 mr-1" />
            Clear all
          </Button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search tasks or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Priority
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              <DropdownMenuLabel>Priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(priorityConfig).map(([priority, config]) => (
                <DropdownMenuCheckboxItem
                  key={priority}
                  checked={selectedPriorities.includes(priority)}
                  onCheckedChange={(checked) => {
                    setSelectedPriorities(
                      checked
                        ? [...selectedPriorities, priority]
                        : selectedPriorities.filter((p) => p !== priority)
                    );
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${config.color}`} />
                    {config.label}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Sort</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy("due_date")}>
                Due Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("priority")}>
                Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("created")}>
                Created
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("updated")}>
                Updated
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
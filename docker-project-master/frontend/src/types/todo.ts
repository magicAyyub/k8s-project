export interface Todo {
    id: string;
    title: string;
    priority: "low" | "medium" | "high" | "urgent";
    tags: string[];
    created_at: Date;
    updated_at: Date;
    due_date?: Date;
    estimated_time?: number;
    starred: boolean;
    archived: boolean;
    completed: boolean;
}

export type NewTodoState = {
    title: string;
    priority: "low" | "medium" | "high" | "urgent";
    tags: string[];
    current_tag: string;
    due_date: string;
    estimated_time: string;
};
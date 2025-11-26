import { Todo } from "../types/todo";

export const fetchTasks = async (): Promise<Todo[]> => {
  const response = await fetch('/api/get_task');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  console.log("Fetched tasks:", data); // <--- Add this line
  return data.map((task: { due_date?: string, created_at: string, updated_at: string } & Omit<Todo, 'due_date' | 'created_at' | 'updated_at'>) => ({
    ...task,
    due_date: task.due_date ? new Date(task.due_date) : undefined,
    created_at: new Date(task.created_at),
    updated_at: new Date(task.updated_at),
  }));
};

export const createTask = async (taskData: Omit<Todo, 'id' | 'created_at' | 'updated_at'>): Promise<Todo> => {
  const response = await fetch('/api/create_task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const task = await response.json();
  console.log("created tasks:", task);
  return {
    ...task,
    due_date: task.due_date ? new Date(task.due_date) : undefined,
    created_at: new Date(task.created_at),
    updated_at: new Date(task.updated_at),
  };
};

export const updateTask = async (id: string, taskData: Partial<Todo>): Promise<Todo> => {
  const response = await fetch(`/api/task/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const task = await response.json();
  return {
    ...task,
    due_date: task.due_date ? new Date(task.due_date) : undefined,
    created_at: new Date(task.created_at),
    updated_at: new Date(task.updated_at),
  };
};

export const deleteTask = async (id: string): Promise<void> => {
  const response = await fetch(`/api/task/${id}`, {
      method: 'DELETE',
  });
  if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
  }
};
   
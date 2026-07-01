import { Injectable, signal, computed, effect } from '@angular/core';

export interface Task {
  id: number;
  title: string;
  done: boolean;
  reminderAt?: string;
}

const STORAGE_KEY = 'tasks';

function loadTasks(): Task[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return [
    { id: 1, title: 'Buy groceries', done: false },
    { id: 2, title: 'Walk the dog', done: false },
    { id: 3, title: 'Learn Angular', done: false },
  ];
}

@Injectable({ providedIn: 'root' })
export class TaskStore {
  tasks = signal<Task[]>(loadTasks());

  private nextId = Math.max(0, ...this.tasks().map(task => task.id)) + 1;

  remaining = computed(() => this.tasks().filter(task => !task.done).length);
  completedTasks = computed(() => this.tasks().filter(task => task.done));
  activeTasks = computed(() => this.tasks().filter(task => !task.done));

  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks()));
    });
  }

  addTask(title: string) {
    if (title.trim() === '') return;
    const newTask: Task = { id: this.nextId++, title, done: false };
    this.tasks.update(current => [...current, newTask]);
  }

  toggleTask(id: number) {
    this.tasks.update(current =>
      current.map(task => (task.id === id ? { ...task, done: !task.done } : task))
    );
  }

  editTask(id: number, newTitle: string) {
    if (newTitle.trim() === '') return;
    this.tasks.update(current =>
      current.map(task => (task.id === id ? { ...task, title: newTitle } : task))
    );
  }

  removeTask(id: number) {
    this.tasks.update(current => current.filter(task => task.id !== id));
  }

  setReminder(id: number, reminderAt: string | null) {
    this.tasks.update(current =>
      current.map(task =>
        task.id === id
          ? { ...task, reminderAt: reminderAt ?? undefined }
          : task
      )
    );
  }

  clearTasks() {
    this.tasks.set([]);
  }
}
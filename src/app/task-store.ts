import { Injectable, signal, computed, effect } from '@angular/core';

export interface Task {
  id: number;
  title: string;
  done: boolean;
  reminderEnabled?: boolean;
  reminderAt?: string;
}

export function isReminderEnabled(task: Task): boolean {
  if (task.reminderEnabled === true) {
    return true;
  }
  if (task.reminderEnabled === false) {
    return false;
  }
  return !!task.reminderAt;
}

const STORAGE_KEY = 'tasks';
const REMINDERS_MASTER_KEY = 'remindersMasterEnabled';

export interface ReminderSettings {
  enabled: boolean;
  reminderAt: string | null;
}

function loadRemindersMasterEnabled(): boolean {
  const saved = localStorage.getItem(REMINDERS_MASTER_KEY);
  if (saved === null) {
    return true;
  }
  return saved === 'true';
}

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
  remindersMasterEnabled = signal(loadRemindersMasterEnabled());

  private nextId = Math.max(0, ...this.tasks().map(task => task.id)) + 1;

  remaining = computed(() => this.tasks().filter(task => !task.done).length);
  completedTasks = computed(() => this.tasks().filter(task => task.done));
  activeTasks = computed(() => this.tasks().filter(task => !task.done));

  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks()));
    });
    effect(() => {
      localStorage.setItem(REMINDERS_MASTER_KEY, String(this.remindersMasterEnabled()));
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

  setReminder(id: number, settings: ReminderSettings) {
    this.tasks.update(current =>
      current.map(task =>
        task.id === id
          ? {
              ...task,
              reminderEnabled: settings.enabled,
              reminderAt: settings.reminderAt ?? undefined,
            }
          : task
      )
    );
  }

  toggleRemindersMaster() {
    this.remindersMasterEnabled.update(enabled => !enabled);
  }

  clearTasks() {
    this.tasks.set([]);
  }
}
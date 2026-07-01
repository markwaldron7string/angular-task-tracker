import { Component, input, output, signal } from '@angular/core';
import { Task } from '../task-store';

@Component({
  selector: 'app-task-item',
templateUrl: './task-item.html',
  styleUrl: './task-item.css',
})
export class TaskItem {
  task = input.required<Task>();
  position = input<number>();
  toggle = output<number>();
  remove = output<number>();
  edit = output<{ id: number; title: string }>();
  reminder = output<{ id: number; reminderAt: string | null }>();

  isEditing = signal(false);

  hasReminder(): boolean {
    return !!this.task().reminderAt;
  }

  reminderInputValue(): string {
    const reminderAt = this.task().reminderAt;
    if (!reminderAt) return '';

    const date = new Date(reminderAt);
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  onToggle() { this.toggle.emit(this.task().id); }
  onRemove() { this.remove.emit(this.task().id); }

  startEditing() { this.isEditing.set(true); }
  cancelEditing() { this.isEditing.set(false); }

  saveEdit(newTitle: string) {
    this.edit.emit({ id: this.task().id, title: newTitle });
    this.isEditing.set(false);
  }

  openReminderPicker(input: HTMLInputElement) {
    input.showPicker();
  }

  onReminderChange(value: string) {
    this.reminder.emit({
      id: this.task().id,
      reminderAt: value ? new Date(value).toISOString() : null,
    });
  }
}
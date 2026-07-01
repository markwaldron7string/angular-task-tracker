import { Component, computed, HostListener, input, output, signal } from '@angular/core';
import { isReminderEnabled, ReminderSettings, Task } from '../task-store';

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
  reminder = output<{ id: number } & ReminderSettings>();

  isEditing = signal(false);
  showReminderDialog = signal(false);
  draftEnabled = signal(false);
  draftReminderAt = signal('');

  bellActive = computed(() => {
    if (this.showReminderDialog()) {
      return this.draftEnabled();
    }
    return isReminderEnabled(this.task());
  });

  onToggle() { this.toggle.emit(this.task().id); }
  onRemove() { this.remove.emit(this.task().id); }

  startEditing() { this.isEditing.set(true); }
  cancelEditing() { this.isEditing.set(false); }

  saveEdit(newTitle: string) {
    this.edit.emit({ id: this.task().id, title: newTitle });
    this.isEditing.set(false);
  }

  openReminderDialog() {
    const currentTask = this.task();
    this.draftEnabled.set(isReminderEnabled(currentTask));
    this.draftReminderAt.set(
      this.toDatetimeLocalValue(currentTask.reminderAt) || this.defaultReminderAt()
    );
    this.showReminderDialog.set(true);
  }

  closeReminderDialog() {
    this.saveReminderSettings();
    this.showReminderDialog.set(false);
  }

  onDraftEnabledChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.draftEnabled.set(input.checked);
  }

  onDraftReminderAtChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.draftReminderAt.set(input.value);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.showReminderDialog()) {
      this.closeReminderDialog();
    }
  }

  private saveReminderSettings() {
    const reminderAt = this.draftReminderAt();
    this.reminder.emit({
      id: this.task().id,
      enabled: this.draftEnabled(),
      reminderAt: reminderAt ? new Date(reminderAt).toISOString() : null,
    });
  }

  private toDatetimeLocalValue(isoDate?: string): string {
    if (!isoDate) return '';

    const date = new Date(isoDate);
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private defaultReminderAt(): string {
    const date = new Date();
    date.setMinutes(0, 0, 0);
    date.setHours(date.getHours() + 1);
    return this.toDatetimeLocalValue(date.toISOString());
  }
}

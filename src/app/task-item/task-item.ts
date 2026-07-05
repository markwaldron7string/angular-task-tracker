import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Component, computed, effect, HostListener, inject, input, OnDestroy, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReminderDatetimePicker } from '../reminder-datetime-picker/reminder-datetime-picker';
import { Task, TaskStore } from '../task-store';

@Component({
  selector: 'app-task-item',
  imports: [FormsModule, ReminderDatetimePicker, CdkDragHandle],
  hostDirectives: [
    {
      directive: CdkDrag,
      inputs: ['cdkDragStartDelay: dragStartDelay', 'cdkDragBoundary: dragBoundary'],
    },
  ],
  host: {
    class: 'task-item',
    '[class.task-item-dragging]': 'isDragging()',
    '[class.task-item-pressing]': 'isPressing()',
  },
  templateUrl: './task-item.html',
  styleUrl: './task-item.css',
})
export class TaskItem implements OnDestroy {
  private store = inject(TaskStore);
  private drag = inject(CdkDrag);

  task = input.required<Task>();
  position = input<number>();
  dragStartDelay = input(0);
  readonly dragBoundary = '.task-list';
  toggle = output<number>();
  remove = output<number>();
  edit = output<{ id: number; title: string }>();

  isEditing = signal(false);
  showReminderDialog = signal(false);
  draftEnabled = signal(true);
  draftReminderAt = signal('');
  isDragging = signal(false);
  isPressing = signal(false);

  dragDisabled = computed(() => this.isEditing() || this.showReminderDialog());

  bellActive = computed(() => {
    if (this.showReminderDialog()) {
      return this.store.remindersMasterEnabled() && this.draftEnabled();
    }

    return this.store.isBellOn(this.task().id);
  });

  private pressTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly dragStartedSub = this.drag.started.subscribe(() => this.onDragStarted());
  private readonly dragEndedSub = this.drag.ended.subscribe(() => this.onDragEnded());

  constructor() {
    effect(() => {
      this.drag.disabled = this.dragDisabled();
    });
  }

  ngOnDestroy() {
    this.dragStartedSub.unsubscribe();
    this.dragEndedSub.unsubscribe();
    this.clearPressState();
  }

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
    this.draftEnabled.set(currentTask.reminderEnabled);
    this.draftReminderAt.set(
      this.toDatetimeLocalValue(currentTask.reminderAt) || this.defaultReminderAt()
    );
    this.showReminderDialog.set(true);
  }

  closeReminderDialog() {
    this.store.setReminder(this.task().id, {
      enabled: this.draftEnabled(),
      reminderAt: this.draftReminderAt()
        ? new Date(this.draftReminderAt()).toISOString()
        : null,
    });
    this.showReminderDialog.set(false);
  }

  onDraftEnabledChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.draftEnabled.set(input.checked);
  }

  onDraftReminderAtChange(value: string) {
    this.draftReminderAt.set(value);
  }

  onDragStarted() {
    this.isDragging.set(true);
    this.clearPressState();
  }

  onDragEnded() {
    this.isDragging.set(false);
    this.clearPressState();
  }

  onPressStart(event: PointerEvent) {
    if (this.dragDisabled() || event.pointerType === 'mouse') return;

    this.clearPressState();
    this.pressTimer = setTimeout(() => {
      this.isPressing.set(true);
    }, Math.max(0, this.dragStartDelay() - 80));
  }

  onPressEnd() {
    this.clearPressState();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.showReminderDialog()) {
      this.closeReminderDialog();
    }
  }

  private clearPressState() {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
    this.isPressing.set(false);
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

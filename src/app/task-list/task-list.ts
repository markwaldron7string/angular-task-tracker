import { Component, inject, signal } from '@angular/core';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { TaskItem } from '../task-item/task-item';
import { TaskSummary } from '../task-summary/task-summary';
import { TaskStore } from '../task-store';

@Component({
  selector: 'app-task-list',
  imports: [TaskItem, TaskSummary, DragDropModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList {
  store = inject(TaskStore);

  readonly dragStartDelay = signal(this.getDragStartDelay());

  onTaskDrop(event: CdkDragDrop<unknown>) {
    this.store.reorderTasks(event.previousIndex, event.currentIndex);
  }

  private getDragStartDelay(): number {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return 0;
    }

    return window.matchMedia('(pointer: coarse)').matches ? 450 : 0;
  }
}

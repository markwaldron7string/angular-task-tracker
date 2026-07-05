import { TestBed } from '@angular/core/testing';

import { TaskStore } from './task-store';

describe('TaskStore', () => {
  let service: TaskStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should reorder tasks', () => {
    const initial = service.tasks().map(task => task.id);
    service.reorderTasks(0, 2);

    expect(service.tasks().map(task => task.id)).toEqual([
      initial[1],
      initial[2],
      initial[0],
      ...initial.slice(3),
    ]);
  });
});

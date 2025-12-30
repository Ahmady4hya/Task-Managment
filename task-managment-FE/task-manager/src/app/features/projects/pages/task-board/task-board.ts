import { Component, computed, inject, resource, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { TaskService } from '../../../../core/services/task.service';
import { Task, TaskStatus } from '../../../projects/models/task.model';
import { SpinnerComponent } from '../../../../shared/ui-components/spinner/spinner';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './task-board.html',
  styleUrls: ['./task-board.scss']
})
export class TaskBoardComponent {
  private taskService = inject(TaskService);
  private router = inject(Router);

  TaskStatus = TaskStatus;

  tasksRes = resource({
    loader: () => firstValueFrom(this.taskService.getAllTasks())
  });

  
  tasks = computed(() => this.tasksRes.value() ?? []);
  loading = computed(() => this.tasksRes.isLoading());
  error = computed(() => this.tasksRes.error());

  
  grouped = computed(() => {
    const t = this.tasks();
    return {
      todo: t.filter(x => x.status === TaskStatus.TODO),
      inProgress: t.filter(x => x.status === TaskStatus.IN_PROGRESS),
      done: t.filter(x => x.status === TaskStatus.DONE),
    };
  });

  todoTasks = computed(() => this.grouped().todo);
  inProgressTasks = computed(() => this.grouped().inProgress);
  doneTasks = computed(() => this.grouped().done);

  counts = computed(() => ({
    todo: this.todoTasks().length,
    inProgress: this.inProgressTasks().length,
    done: this.doneTasks().length
  }));

  onCreateTask(): void {
    this.router.navigate(['/tasks', 'new']);
  }

  onViewTask(taskId: number): void {
    this.router.navigate(['/tasks', taskId]);
  }

  onEditTask(taskId: number): void {
    this.router.navigate(['/tasks', taskId, 'edit']);
  }

  onDeleteTask(taskId: number): void {
    if (!confirm('Are you sure you want to delete this task?')) return;

    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        this.tasksRes.reload();
      },
      error: (err) => {
        console.error('Error deleting task:', err);
      }
    });
  }

  onStatusChange(taskId: number, newStatus: TaskStatus): void {
    this.taskService.updateTaskStatus(taskId, newStatus).subscribe({
      next: () => {
        this.tasksRes.reload();
      },
      error: (err) => {
        console.error('Error updating task status:', err);
      }
    });
  }

  getStatusLabel(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO: return 'To Do';
      case TaskStatus.IN_PROGRESS: return 'In Progress';
      case TaskStatus.DONE: return 'Done';
      default: return status;
    }
  }
}

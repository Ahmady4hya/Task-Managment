import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
export class TaskBoardComponent implements OnInit {
  tasks: Task[] = [];
  loading = false;
  error: string | null = null;

  // Task columns for Kanban board
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];

  // Expose TaskStatus enum to template
  TaskStatus = TaskStatus;

  constructor(
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.error = null;

    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.organizeTasks();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load tasks. Please try again.';
        this.loading = false;
        console.error('Error loading tasks:', err);
      }
    });
  }

  organizeTasks(): void {
    this.todoTasks = this.tasks.filter(task => task.status === TaskStatus.TODO);
    this.inProgressTasks = this.tasks.filter(task => task.status === TaskStatus.IN_PROGRESS);
    this.doneTasks = this.tasks.filter(task => task.status === TaskStatus.DONE);
  }

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
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (err) => {
          this.error = 'Failed to delete task. Please try again.';
          console.error('Error deleting task:', err);
        }
      });
    }
  }

  onStatusChange(taskId: number, newStatus: TaskStatus): void {
    this.taskService.updateTaskStatus(taskId, newStatus).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: (err) => {
        this.error = 'Failed to update task status. Please try again.';
        console.error('Error updating task status:', err);
      }
    });
  }

  getStatusLabel(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
        return 'To Do';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.DONE:
        return 'Done';
      default:
        return status;
    }
  }

  getTaskCountByStatus(status: TaskStatus): number {
    return this.tasks.filter(task => task.status === status).length;
  }
}
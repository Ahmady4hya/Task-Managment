import { Component, effect, inject, signal, computed, resource } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../../../core/services/task.service';
import { ProjectService } from '../../../../core/services/project.service';
import { DeveloperService } from '../../../../core/services/developer.service';
import { Task, TaskStatus } from '../../models/task.model';
import { Project } from '../../models/project.model';
import { Developer } from '../../models/developer.model';
import { SpinnerComponent } from '../../../../shared/ui-components/spinner/spinner';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './task-form.html',
  styleUrls: ['./task-form.scss']
})
export class TaskFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);
  private developerService = inject(DeveloperService);

  error = signal<string | null>(null);
  submitting = signal(false);
  projects = signal<Project[]>([]);
  developers = signal<Developer[]>([]);

  taskStatuses = Object.values(TaskStatus);

  taskId = toSignal(
    this.route.paramMap.pipe(
      map(pm => {
        const raw = pm.get('id');
        if (!raw || raw === 'new') return null;
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
      })
    ),
    { initialValue: null }
  );

  isEditMode = signal(false);

  taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    status: [TaskStatus.TODO, Validators.required],
    projectId: ['', Validators.required],
    developerId: ['']
  });

  taskRes = resource({
    loader: () => {
      const id = this.taskId();
      if (id == null) return Promise.resolve(null);
      return firstValueFrom(this.taskService.getTaskById(id));
    }
  });

  constructor() {
    this.loadProjects();
    this.loadDevelopers();

    effect(() => {
      this.isEditMode.set(this.taskId() != null);
    });

    effect(() => {
      const task = this.taskRes.value();
      if (!task) return;

      this.taskForm.patchValue({
        title: task.title,
        description: task.description || '',
        status: task.status,
        projectId: task.projectId?.toString() || '',
        developerId: task.developerId?.toString() || ''
      });
    });

    effect(() => {
      if (this.taskRes.error()) {
        this.error.set('Failed to load task. Please try again.');
      }
    });
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects);
      },
      error: (err) => {
        console.error('Error loading projects:', err);
      }
    });
  }

  loadDevelopers(): void {
    this.developerService.getAllDevelopers().subscribe({
      next: (developers) => {
        this.developers.set(developers);
      },
      error: (err) => {
        console.error('Error loading developers:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const taskData: Task = {
      title: this.taskForm.value.title!,
      description: this.taskForm.value.description || undefined,
      status: this.taskForm.value.status!,
      projectId: +this.taskForm.value.projectId!,
      developerId: this.taskForm.value.developerId ? +this.taskForm.value.developerId : undefined
    };

    const id = this.taskId();
    const operation = id !== null
      ? this.taskService.updateTask(id, taskData)
      : this.taskService.createTask(taskData);

    operation.subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        this.error.set(
          id !== null
            ? 'Failed to update task. Please try again.'
            : 'Failed to create task. Please try again.'
        );
        this.submitting.set(false);
        console.error('Error saving task:', err);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }

  get pageTitle(): string {
    return this.isEditMode() ? 'Edit Task' : 'Create New Task';
  }

  get submitButtonText(): string {
    return this.submitting()
      ? (this.isEditMode() ? 'Updating...' : 'Creating...')
      : (this.isEditMode() ? 'Update Task' : 'Create Task');
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
}
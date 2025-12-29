import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../../../core/services/task.service';
import { ProjectService } from '../../../../core/services/project.service';
import { DeveloperService } from '../../../../core/services/developer.service';
import { Task, TaskStatus } from '../../../projects/models/task.model';
import { Project } from '../../../projects/models/project.model';
import { Developer } from '../../../projects/models/developer.model';
import { SpinnerComponent } from '../../../../shared/ui-components/spinner/spinner';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './task-form.html',
  styleUrls: ['./task-form.scss']
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode = false;
  taskId: number | null = null;
  loading = false;
  error: string | null = null;
  submitting = false;

  projects: Project[] = [];
  developers: Developer[] = [];
  taskStatuses = Object.values(TaskStatus);

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private projectService: ProjectService,
    private developerService: DeveloperService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      status: [TaskStatus.TODO, Validators.required],
      projectId: ['', Validators.required],
      developerId: ['']
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadDevelopers();

    this.route.params.subscribe(params => {
      if (params['id'] && params['id'] !== 'new') {
        this.isEditMode = true;
        this.taskId = +params['id'];
        this.loadTask(this.taskId);
      }
    });
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
      },
      error: (err) => {
        console.error('Error loading projects:', err);
      }
    });
  }

  loadDevelopers(): void {
    this.developerService.getAllDevelopers().subscribe({
      next: (developers) => {
        this.developers = developers;
      },
      error: (err) => {
        console.error('Error loading developers:', err);
      }
    });
  }

  loadTask(id: number): void {
    this.loading = true;
    this.error = null;

    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        this.taskForm.patchValue({
          title: task.title,
          description: task.description || '',
          status: task.status,
          projectId: task.projectId,
          developerId: task.developerId || ''
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load task. Please try again.';
        this.loading = false;
        console.error('Error loading task:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = null;

    const taskData: Task = {
      title: this.taskForm.value.title,
      description: this.taskForm.value.description || undefined,
      status: this.taskForm.value.status,
      projectId: +this.taskForm.value.projectId,
      developerId: this.taskForm.value.developerId ? +this.taskForm.value.developerId : undefined
    };

    const operation = this.isEditMode && this.taskId
      ? this.taskService.updateTask(this.taskId, taskData)
      : this.taskService.createTask(taskData);

    operation.subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        this.error = this.isEditMode
          ? 'Failed to update task. Please try again.'
          : 'Failed to create task. Please try again.';
        this.submitting = false;
        console.error('Error saving task:', err);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }

  get titleControl() {
    return this.taskForm.get('title');
  }

  get descriptionControl() {
    return this.taskForm.get('description');
  }

  get statusControl() {
    return this.taskForm.get('status');
  }

  get projectIdControl() {
    return this.taskForm.get('projectId');
  }

  get developerIdControl() {
    return this.taskForm.get('developerId');
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Edit Task' : 'Create New Task';
  }

  get submitButtonText(): string {
    return this.submitting
      ? (this.isEditMode ? 'Updating...' : 'Creating...')
      : (this.isEditMode ? 'Update Task' : 'Create Task');
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
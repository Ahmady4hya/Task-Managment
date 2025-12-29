import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../../../core/services/project.service';
import { Project } from '../../models/project.model';
import { SpinnerComponent } from '../../../../shared/ui-components/spinner/spinner';

@Component({
  selector: 'app-project-form',
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './project-form.html',
  styleUrl: './project-form.scss',
  standalone: true
})
export class ProjectFormComponent implements OnInit {
  projectForm: FormGroup;
  isEditMode: boolean = false;
  projectId: number | null = null;
  loading: boolean = false;
  error: string | null = null;
  submitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id'] && params['id'] !== 'new') {
        this.isEditMode = true;
        this.projectId = +params['id']; 
        this.loadProject(this.projectId);
      }
    });
  }

  loadProject(id: number): void {
    this.loading = true;
    this.error = null;

    this.projectService.getProjectById(id).subscribe({
      next: (project) => {
        this.projectForm.patchValue({
          name: project.name,
          description: project.description || ''
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load project. Please try again.';
        this.loading = false;
        console.error('Error loading project:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = null;

    const projectData: Project = {
      name: this.projectForm.value.name,
      description: this.projectForm.value.description || undefined
    };

    const operation = this.isEditMode && this.projectId
      ? this.projectService.updateProject(this.projectId, projectData)
      : this.projectService.createProject(projectData);

    operation.subscribe({
      next: (project) => {
        this.submitting = false;
        this.router.navigate(['/projects']);
      },
      error: (err) => {
        this.error = this.isEditMode
          ? 'Failed to update project. Please try again.'
          : 'Failed to create project. Please try again.';
        this.submitting = false;
        console.error('Error saving project:', err);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/projects']);
  }


  get nameControl() {
    return this.projectForm.get('name');
  }

  get descriptionControl() {
    return this.projectForm.get('description');
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Edit Project' : 'Create New Project';
  }

  get submitButtonText(): string {
    return this.submitting
      ? (this.isEditMode ? 'Updating...' : 'Creating...')
      : (this.isEditMode ? 'Update Project' : 'Create Project');
  }
}

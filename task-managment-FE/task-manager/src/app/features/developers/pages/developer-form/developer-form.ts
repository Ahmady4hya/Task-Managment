import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DeveloperService } from '../../../../core/services/developer.service';
import { Developer } from '../../../projects/models/developer.model';
import { SpinnerComponent } from '../../../../shared/ui-components/spinner/spinner';

@Component({
  selector: 'app-developer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './developer-form.html',
  styleUrls: ['./developer-form.scss']
})
export class DeveloperFormComponent implements OnInit {
  developerForm: FormGroup;
  isEditMode = false;
  developerId: number | null = null;
  loading = false;
  error: string | null = null;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private developerService: DeveloperService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.developerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      skills: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id'] && params['id'] !== 'new') {
        this.isEditMode = true;
        this.developerId = +params['id'];
        this.loadDeveloper(this.developerId);
      }
    });
  }

  loadDeveloper(id: number): void {
    this.loading = true;
    this.error = null;

    this.developerService.getDeveloperById(id).subscribe({
      next: (developer) => {
        this.developerForm.patchValue({
          name: developer.name,
          email: developer.email,
          skills: developer.skills || ''
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load developer. Please try again.';
        this.loading = false;
        console.error('Error loading developer:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.developerForm.invalid) {
      this.developerForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = null;

    const developerData: Developer = {
      name: this.developerForm.value.name,
      email: this.developerForm.value.email,
      skills: this.developerForm.value.skills || undefined
    };

    const operation = this.isEditMode && this.developerId
      ? this.developerService.updateDeveloper(this.developerId, developerData)
      : this.developerService.createDeveloper(developerData);

    operation.subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/developers']);
      },
      error: (err) => {
        this.error = this.isEditMode
          ? 'Failed to update developer. Please try again.'
          : 'Failed to create developer. Please try again.';
        this.submitting = false;
        console.error('Error saving developer:', err);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/developers']);
  }

  get nameControl() {
    return this.developerForm.get('name');
  }

  get emailControl() {
    return this.developerForm.get('email');
  }

  get skillsControl() {
    return this.developerForm.get('skills');
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Edit Developer' : 'Add New Developer';
  }

  get submitButtonText(): string {
    return this.submitting
      ? (this.isEditMode ? 'Updating...' : 'Creating...')
      : (this.isEditMode ? 'Update Developer' : 'Add Developer');
  }
}
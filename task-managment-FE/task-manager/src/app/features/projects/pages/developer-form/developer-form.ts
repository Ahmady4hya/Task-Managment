import { Component, effect, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DeveloperService } from '../../../../core/services/developer.service';
import { SpinnerComponent } from '../../../../shared/ui-components/spinner/spinner';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-developer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './developer-form.html',
  styleUrls: ['./developer-form.scss']
})
export class DeveloperFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private developerService = inject(DeveloperService);

  loading = signal(false);
  error = signal<string | null>(null);
  submitting = signal(false);

  developerId = toSignal(
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

  isEditMode = computed(() => this.developerId() !== null);

  developerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    skills: ['']
  });

  constructor() {
    effect(() => {
      const id = this.developerId();
      if (id !== null) {
        this.loadDeveloper(id);
      }
    });
  }

  loadDeveloper(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.developerService.getDeveloperById(id).subscribe({
      next: (developer) => {
        this.developerForm.patchValue({
          name: developer.name,
          email: developer.email,
          skills: developer.skills ?? ''
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load developer. Please try again.');
        this.loading.set(false);
        console.error('Error loading developer:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.developerForm.invalid) {
      this.developerForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const developerData = {
      name: this.developerForm.value.name!,
      email: this.developerForm.value.email!,
      skills: this.developerForm.value.skills || undefined
    };

    const id = this.developerId();
    const operation = id !== null
      ? this.developerService.updateDeveloper(id, developerData)
      : this.developerService.createDeveloper(developerData);

    operation.subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/developers']);
      },
      error: (err) => {
        this.error.set(
          id !== null
            ? 'Failed to update developer. Please try again.'
            : 'Failed to create developer. Please try again.'
        );
        this.submitting.set(false);
        console.error('Error saving developer:', err);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/developers']);
  }

  get pageTitle(): string {
    return this.isEditMode() ? 'Edit Developer' : 'Add New Developer';
  }

  get submitButtonText(): string {
    return this.submitting()
      ? (this.isEditMode() ? 'Updating...' : 'Creating...')
      : (this.isEditMode() ? 'Update Developer' : 'Add Developer');
  }
}

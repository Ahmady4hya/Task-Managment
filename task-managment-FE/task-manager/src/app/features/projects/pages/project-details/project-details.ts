import { Component, inject, resource, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom, map } from 'rxjs';
import { ProjectService } from '../../../../core/services/project.service';
import { Project } from '../../models/project.model';
import { SpinnerComponent } from '../../../../shared/ui-components/spinner/spinner';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent],
  templateUrl: './project-details.html',
  styleUrls: ['./project-details.scss']
})
export class ProjectDetailsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);

  projectId = toSignal(
    this.route.paramMap.pipe(map(pm => Number(pm.get('id')))),
    { initialValue: 0 }
  );

  projectResource = resource({
    loader: () => firstValueFrom(this.projectService.getProjectById(this.projectId())),
    });

  editProject(): void {
    this.router.navigate(['/projects', this.projectId(), 'edit']);
    
  }

  deleteProject(): void {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

    const id = this.projectId();
    this.projectService.deleteProject(id).subscribe({
      next: () => this.router.navigate(['/projects']),
      error: (err) => console.error('Error deleting project:', err),
    });
  }
  goBack(): void {
    this.router.navigate(['/projects']);
  }
}
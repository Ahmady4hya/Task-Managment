import { Component, resource, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProjectService } from '../../../../core/services/project.service';
import { Project } from '../../models/project.model';
import { ProjectCard } from '../../../../shared/ui-components/project-card/project-card';
import { SpinnerComponent } from '../../../../shared/ui-components/spinner/spinner';

@Component({
  selector: 'app-project-list',
  imports: [CommonModule, ProjectCard, SpinnerComponent],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss',
  standalone: true
})
export class ProjectListComponent {

  projectsResource = resource({
    loader: () => firstValueFrom(this.projectService.getAllProjects())
  });
  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}


  onViewDetails(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
  }

  onEditProject(projectId: number): void {
    this.router.navigate(['/projects', projectId, 'edit']);
  }

  onDeleteProject(projectId: number): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(projectId).subscribe({
        next: () => {
          this.projectsResource.reload()
        },
        error: (err) => {
          console.error('Error deleting project:', err);
        }
      });
    }
  }

  onCreateProject(): void {
    this.router.navigate(['/projects', 'new']);
  }
}

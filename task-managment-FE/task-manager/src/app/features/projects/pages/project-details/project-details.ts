import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../../../core/services/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project-details.html',
  styleUrls: ['./project-details.scss']
})
export class ProjectDetailsComponent implements OnInit {
  project: Project | null = null;
  loading = true;
  error: string | null = null;
  projectId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.projectId = +params['id'];
      this.loadProject();
    });
  }

  loadProject(): void {
    this.loading = true;
    this.error = null;

    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load project details';
        this.loading = false;
        console.error('Error loading project:', err);
      }
    });
  }

  editProject(): void {
    this.router.navigate(['/projects', this.projectId, 'edit']);
  }

  deleteProject(): void {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    this.projectService.deleteProject(this.projectId).subscribe({
      next: () => {
        this.router.navigate(['/projects']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to delete project';
        console.error('Error deleting project:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}
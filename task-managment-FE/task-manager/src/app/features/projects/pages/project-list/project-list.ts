import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectService } from '../../../../core/services/project.service';
import { Project } from '../../models/project.model';
import { ProjectCard } from '../../../../shared/ui-components/project-card/project-card';

@Component({
  selector: 'app-project-list',
  imports: [CommonModule, ProjectCard],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss',
  standalone: true
})
export class ProjectList implements OnInit {
  projects: Project[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.error = null;

    this.projectService.getAllProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load projects. Please try again.';
        this.loading = false;
        console.error('Error loading projects:', err);
      }
    });
  }

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
          this.loadProjects(); 
        },
        error: (err) => {
          this.error = 'Failed to delete project. Please try again.';
          console.error('Error deleting project:', err);
        }
      });
    }
  }

  onCreateProject(): void {
    this.router.navigate(['/projects', 'new']);
  }
}

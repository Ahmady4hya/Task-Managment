import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DeveloperService } from '../../../../core/services/developer.service';
import { Developer } from '../../../projects/models/developer.model';
import { SpinnerComponent } from '../../../../shared/ui-components/spinner/spinner';

@Component({
  selector: 'app-developer-list',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './developer-list.html',
  styleUrls: ['./developer-list.scss']
})
export class DeveloperListComponent implements OnInit {
  developers: Developer[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private developerService: DeveloperService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDevelopers();
  }

  loadDevelopers(): void {
    this.loading = true;
    this.error = null;

    this.developerService.getAllDevelopers().subscribe({
      next: (developers) => {
        this.developers = developers;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load developers. Please try again.';
        this.loading = false;
        console.error('Error loading developers:', err);
      }
    });
  }

  onCreateDeveloper(): void {
    this.router.navigate(['/developers', 'new']);
  }

  onEditDeveloper(developerId: number): void {
    this.router.navigate(['/developers', developerId, 'edit']);
  }

  onDeleteDeveloper(developerId: number): void {
    if (confirm('Are you sure you want to delete this developer?')) {
      this.developerService.deleteDeveloper(developerId).subscribe({
        next: () => {
          this.loadDevelopers();
        },
        error: (err) => {
          this.error = 'Failed to delete developer. Please try again.';
          console.error('Error deleting developer:', err);
        }
      });
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
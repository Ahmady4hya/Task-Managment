import { Component, inject,resource } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DeveloperService } from '../../../../core/services/developer.service';
import { SpinnerComponent } from '../../../../shared/ui-components/spinner/spinner';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-developer-list',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './developer-list.html',
  styleUrls: ['./developer-list.scss']
})
export class DeveloperListComponent {
  private developerService = inject(DeveloperService);
  private router = inject(Router);

  developersResource = resource({
    loader: () => firstValueFrom(this.developerService.getAllDevelopers())
  })

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
          this.developersResource.reload();
        },
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
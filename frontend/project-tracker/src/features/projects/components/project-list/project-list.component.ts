import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../../../shared/services/auth.service';


@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',  
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule]
})
export class ProjectListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);

  protected readonly projects = this.projectService.getProjects();
  protected readonly loading = this.projectService.getLoading();
  protected readonly error = this.projectService.getError();

  ngOnInit() {    
    const token = this.authService.getToken();    
    console.log('ProjectListComponent: Token in localStorage:', localStorage.getItem('accessToken')?.substring(0, 50) + '...');
    this.projectService.loadProjects();
  }

  deleteProject(id: number) {
    this.projectService.deleteProject(id).subscribe({
      next: () => {
        this.projectService.loadProjects();
      },
      error: (err: unknown) => {
        console.error('Error deleting project:', err);
      }
    });
  }
}
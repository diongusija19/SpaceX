import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourcesService, ResourceDetail } from '../services/resources.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-resource-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resource-detail.page.html'
})
export class ResourceDetailPage {
  detail: ResourceDetail | null = null;
  message = '';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private service: ResourcesService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.auth.ensure().subscribe(() => {
      this.service.get(id).subscribe(d => {
        this.detail = d;
        this.cdr.detectChanges();
      });
    });
  }

  get isAdmin() {
    return this.auth.current?.role === 'admin';
  }

  action(action: 'start' | 'stop' | 'delete') {
    if (!this.detail) return;
    this.message = '';
    this.error = '';
    this.service.action(this.detail.resource.id, action).subscribe({
      next: () => {
        if (action === 'delete') {
          this.message = 'Resource deleted.';
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigateByUrl('/resources'), 800);
          return;
        }
        this.service.get(this.detail!.resource.id).subscribe(d => {
          this.detail = d;
          this.message = `Resource ${action}ed.`;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.error = 'Action failed. Try again.';
        this.cdr.detectChanges();
      }
    });
  }
}

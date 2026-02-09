import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityService, ActivityItem } from '../services/activity.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity.page.html'
})
export class ActivityPage {
  items: ActivityItem[] = [];

  constructor(
    private service: ActivityService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.auth.ensure().subscribe(() => {
      this.service.list().subscribe(items => {
        this.items = items;
        this.cdr.detectChanges();
      });
    });
  }
}
